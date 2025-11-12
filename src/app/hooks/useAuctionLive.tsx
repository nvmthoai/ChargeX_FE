import { useCallback, useEffect, useRef, useState } from "react";
import ENV from "../config/env";
import useApiService from "./useApi";
import { useAuth } from "./AuthContext";
import toast from "react-hot-toast";
import { io, Socket } from "socket.io-client";
import axiosInstance from "../config/axios";

type AuctionState = {
  id: string;
  currentPrice: number;
  minIncrement: number;
  endAt: number; // server timestamp (ms)
  participants?: any[];
  status?: string;
  winnerId?: string | null;
  finalPrice?: number | null;
  title?: string;
  description?: string;
  imageUrls?: string[];
  startingPrice?: number;
  buyNowPrice?: number;
};

type UseAuctionLiveOptions = {
  resyncIntervalSeconds?: number;
};

/**
 * useAuctionLive
 * - Fetches auction snapshot via GET
 * - Connects a WebSocket and listens for auction:state, auction:bid, auction:ended, heartbeat
 * - Keeps serverTime offset and provides countdown derived from server time
 *
 * NOTE: This hook assumes a JSON-over-WebSocket protocol with messages shaped like:
 * { event: 'auction:state' | 'auction:bid' | 'auction:ended' | 'heartbeat', data: {...} }
 * and a WS URL derived from ENV.BASE_URL by replacing http(s) -> ws(s) and appending `/ws/auctions/${id}`.
 * Adjust the URL and message parsing to match your backend (socket.io would require `socket.io-client`).
 */
export default function useAuctionLive(
  auctionId: string | null,
  options?: UseAuctionLiveOptions
) {
  const { callApi } = useApiService();
  const { user, token } = useAuth();
  const resyncIntervalSeconds = options?.resyncIntervalSeconds ?? 10;

  const [loading, setLoading] = useState<boolean>(true);
  const [live, setLive] = useState<boolean>(false);
  const [reconnecting, setReconnecting] = useState<boolean>(false);
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [auction, setAuction] = useState<AuctionState | null>(null);
  const [serverTimeOffset, setServerTimeOffset] = useState<number>(0); // Date.now() - serverTime
  const [countdown, setCountdown] = useState<number>(0); // ms remaining

  const socketRef = useRef<Socket | null>(null);
  const resyncTimerRef = useRef<number | null>(null);
  const pendingBidRef = useRef<{ amount: number; id?: string } | null>(null);

  const baseUrl = ENV.BASE_URL || "";

  const buildSocketUrl = useCallback(() => {
    // Prefer explicit SOCKET_URL from ENV (set in src/app/config/env.ts or VITE_SOCKET_URL)
    if (ENV.SOCKET_URL) return ENV.SOCKET_URL

    // Fallback: derive origin from BASE_URL
    if (!baseUrl) return null
    try {
      const u = new URL(baseUrl)
      return u.origin
    } catch {
      return baseUrl.replace(/\/(?:api|api\/v\d+)(?:\/.*)?$/i, "").replace(/\/$/, "")
    }
  }, [baseUrl]);

  const resyncFromServer = useCallback(async () => {
    if (!auctionId) return;
    try {
      setLoading(true);
      // Backend endpoint: GET /auction/:id
      const data = await callApi("get", `/auction/${auctionId}`);

      if (!data) {
        console.warn("resyncFromServer: no data returned");
        toast.error(`Auction ${auctionId} not found`);
        setLive(false);
        return;
      }

      // Prefer server time if backend provides it so client countdown stays in sync
      const serverTimeFromResponse =
        data.serverTime ?? data.serverNow ?? data.now ?? Date.now();

      // normalize to milliseconds number
      const serverTimeMs =
        typeof serverTimeFromResponse === "number"
          ? serverTimeFromResponse
          : new Date(serverTimeFromResponse).getTime() || Date.now();

      // compute server time offset (clientNow - serverNow)
      const newOffset = Date.now() - serverTimeMs;
      console.log("🔄 [useAuctionLive] Offset updated from resync:", {
        newOffset,
        clientNow: Date.now(),
        serverTimeMs,
      });
      setServerTimeOffset(newOffset);

      // Backend returns: { auctionId, status, currentPrice, startTime, endTime, product, ... }
      const snapshot = data;

      // Map backend fields to FE AuctionState
      const endAtMs = snapshot.endTime
        ? new Date(snapshot.endTime).getTime()
        : Date.now() + 3600000;

      const next: AuctionState = {
        id: String(snapshot.auctionId ?? auctionId),
        currentPrice: snapshot.currentPrice ?? 0,
        minIncrement: snapshot.minBidIncrement ?? snapshot.minIncrement ?? 1000,
        endAt: endAtMs,
        participants: snapshot.participants ?? [],
        status: snapshot.status ?? "live",
        winnerId: snapshot.winnerId ?? null,
        finalPrice: snapshot.finalPrice ?? null,
        title: snapshot.title,
        description: snapshot.description,
        imageUrls: snapshot.imageUrls ?? [],
        startingPrice: snapshot.startingPrice,
        buyNowPrice: snapshot.buyNowPrice,
      };

      setAuction(next);
      setLive(snapshot.status === "live" || snapshot.status === "scheduled");

      // compute countdown using server time (so clocks stay in sync)
      const countdown = Math.max(0, endAtMs - serverTimeMs);
      console.log('⏳ [useAuctionLive] resyncFromServer countdown:', {
        endAtMs,
        serverTimeMs,
        countdown: countdown + 'ms (' + Math.ceil(countdown/1000) + 's)',
        endTime: snapshot.endTime,
        status: snapshot.status
      });
      setCountdown(countdown);
    } catch (e: any) {
      console.error("resyncFromServer error", e);
      const msg =
        e?.response?.data?.message || e?.message || "Failed to load auction";
      toast.error(msg);
      setLive(false);
    } finally {
      setLoading(false);
    }
  }, [auctionId, callApi]);

  const connectSocket = useCallback(() => {
    const url = buildSocketUrl();
    if (!url || !auctionId) {
      console.warn("connectSocket: no url or auctionId", { url, auctionId });
      return;
    }

    try {
      setReconnecting(false);
      // read token: prefer hook token, fallback to localStorage
      const finalToken = token ?? localStorage.getItem("token");
      // determine userId for handshake: prefer hook user.sub, fallback to stored local user
      let finalUserId: string | null = null;
      if (user && (user as unknown as Record<string, unknown>)?.sub) {
        finalUserId = (user as unknown as Record<string, unknown>).sub as string;
      } else {
        try {
          const su = localStorage.getItem("user");
          if (su) {
            const parsed = JSON.parse(su || "{}");
            if (parsed && (parsed.sub || parsed.id)) finalUserId = parsed.sub || parsed.id || null;
          }
        } catch (err) {
          // ignore parse errors
        }
      }
      console.info("Preparing socket.io to:", url, "for auction:", auctionId, { hasToken: !!finalToken, userId: finalUserId });

      // ✅ Build auth object
      const authObj: Record<string, string> = {};
      if (finalToken) authObj.token = finalToken;
      if (finalUserId) authObj.userId = finalUserId;

      console.log("🔐 Socket auth object:", authObj);
      console.log("🔐 Debug:", { finalToken: !!finalToken, finalUserId, user, userSub: (user as any)?.sub });

      // Create socket but do not auto connect: wait for initial resync to finish
      const socket = io(`${url}/auctions`, {
        path: "/socket.io",
        transports: ["websocket"],
        auth: Object.keys(authObj).length > 0 ? authObj : undefined,
        autoConnect: false,
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionAttempts: 5,
      });

      socketRef.current = socket;

      // Attach listeners before connecting
      socket.on("connect", async () => {
        console.info("socket.io connected", socket.id);
        setReconnecting(false);
        setIsConnected(true);
        // join auction room after resync (we already resynced before connect)
        try {
          socket.emit("auction:join", { auctionId, userId: user?.sub ?? null });
        } catch (err) {
          console.warn("join after connect failed", err);
        }
      });

      socket.on("connect_error", (err: any) => {
        console.error("socket connect_error:", err?.message || err);
        setReconnecting(true);
        setIsConnected(false);
        toast.error("Cannot connect to live auction server");
      });

      socket.on("disconnect", (reason: any) => {
        console.warn("socket disconnected", reason);
        setReconnecting(true);
        setIsConnected(false);
      });

      // Backend events: auction:state, auction:price_update, auction:extended, auction:error

      socket.on("auction:state", (d: any) => {
        console.log("Received auction:state", d);
        // If server provides server time, adjust offset
        if (d?.serverTime) {
          const serverTimeFromSocket = d.serverTime;
          const serverTimeSocketMs =
            typeof serverTimeFromSocket === "number"
              ? serverTimeFromSocket
              : new Date(serverTimeFromSocket).getTime() || Date.now();
          const newOffset = Date.now() - serverTimeSocketMs;
          console.log("🔄 [useAuctionLive] Offset updated from auction:state event:", {
            newOffset,
            auctionStatus: d?.status,
          });
          setServerTimeOffset(newOffset);
        }
        const snapshot = d;
        const next: AuctionState = {
          id: String(snapshot.auctionId ?? auctionId),
          currentPrice: snapshot.currentPrice ?? 0,
          minIncrement: snapshot.minBidIncrement ?? snapshot.minIncrement ?? 1000,
          endAt: snapshot.endTime
            ? new Date(snapshot.endTime).getTime()
            : Date.now() + 3600000,
          participants: snapshot.participants ?? [],
          status: snapshot.status ?? "live",
          winnerId: snapshot.winnerId ?? null,
          finalPrice: snapshot.finalPrice ?? null,
          title: snapshot.title,
          description: snapshot.description,
          imageUrls: snapshot.imageUrls ?? [],
          startingPrice: snapshot.startingPrice,
          buyNowPrice: snapshot.buyNowPrice,
        };
        setAuction(next);
        setLive(snapshot.status === "live");
        // use server-synced time when available
        const nowServer = d?.serverTime
          ? typeof d.serverTime === "number"
            ? d.serverTime
            : new Date(d.serverTime).getTime() || Date.now()
          : Date.now();
        setCountdown(Math.max(0, next.endAt - nowServer));
      });

      socket.on("auction:price_update", (d: any) => {
        console.log("Received auction:price_update", d);

        // ✅ Update serverTimeOffset if provided
        if (d?.serverTime) {
          const serverTimeFromSocket = d.serverTime;
          const serverTimeSocketMs =
            typeof serverTimeFromSocket === "number"
              ? serverTimeFromSocket
              : new Date(serverTimeFromSocket).getTime() || Date.now();
          setServerTimeOffset(Date.now() - serverTimeSocketMs);
        }

        setAuction((prev) => {
          if (!prev) return prev;
          const newPrice = d.currentPrice ?? d.amount ?? prev.currentPrice;
          // ✅ Also update endTime if provided in price_update
          const newEndAt = d.endTime
            ? new Date(d.endTime).getTime()
            : prev.endAt;
          return { ...prev, currentPrice: newPrice, endAt: newEndAt };
        });

        if (pendingBidRef.current) {
          const pendingAmount = pendingBidRef.current.amount;
          if (d.currentPrice === pendingAmount && d.userId === user?.sub) {
            pendingBidRef.current = null;
            toast.success("Your bid was accepted");
          } else if (d.currentPrice > pendingAmount) {
            pendingBidRef.current = null;
            toast.error("You have been outbid");
          }
        }
      });

      socket.on("auction:extended", (d: any) => {
        console.log("Received auction:extended", d);

        // ✅ Update serverTimeOffset if provided
        if (d?.serverTime) {
          const serverTimeFromSocket = d.serverTime;
          const serverTimeSocketMs =
            typeof serverTimeFromSocket === "number"
              ? serverTimeFromSocket
              : new Date(serverTimeFromSocket).getTime() || Date.now();
          setServerTimeOffset(Date.now() - serverTimeSocketMs);
        }

        const newEndTime = d.endTime
          ? new Date(d.endTime).getTime()
          : Date.now() + 60000;
        setAuction((prev) => (prev ? { ...prev, endAt: newEndTime } : prev));

        // ✅ Use server-synced time for countdown calculation
        const nowServer = d?.serverTime
          ? typeof d.serverTime === "number"
            ? d.serverTime
            : new Date(d.serverTime).getTime() || Date.now()
          : Date.now();
        setCountdown(Math.max(0, newEndTime - nowServer));
        toast(
          `Auction extended to ${new Date(newEndTime).toLocaleTimeString()}`,
          { icon: "ℹ️" }
        );
      });

      socket.on("auction:error", (d: any) => {
        console.error("Received auction:error", d);
        const reason = d.message ?? "Auction error";
        toast.error(reason);

        // If we have a pending optimistic bid, try REST fallback (use callApi)
        if (pendingBidRef.current && auctionId) {
          const pending = pendingBidRef.current;
          pendingBidRef.current = null; // clear optimistic pending
          // Try REST fallback to place bid (may succeed if REST uses standard auth header)
          (async () => {
            try {
              const resp = await callApi("post", `/auction/${auctionId}/bid`, {
                amount: pending.amount,
              });
              // If resp indicates success, inform user
              if (resp) {
                toast.success("Bid submitted via REST fallback");
                // update auction state if response has new price
                if (resp.currentPrice !== undefined) {
                  setAuction((prev) =>
                    prev ? { ...prev, currentPrice: resp.currentPrice } : prev
                  );
                }
                return;
              }
            } catch (restErr) {
              console.warn("REST fallback bid failed", restErr);
            }
            // if fallback didn't work, notify user
            toast.error("Bid failed. Please login and try again.");
          })();
        }
      });

      socket.on("auction:ended", (d: any) => {
        console.log("Received auction:ended", d);
        setAuction((prev) =>
          prev
            ? {
                ...prev,
                status: "ended",
                winnerId: d.winnerId ?? null,
                finalPrice: d.finalPrice ?? null,
              }
            : prev
        );
        setLive(false);
        if (d.winnerId && user?.sub && d.winnerId === user.sub) {
          toast.success("You won the auction!");
        }
      });

      // Start: do an initial resync then connect
      (async () => {
        try {
          await resyncFromServer();
        } catch (err) {
          console.warn("Initial resync failed before connect", err);
        }

        // finally connect the socket
        try {
          socket.connect();
        } catch (err) {
          console.error("socket.connect() error", err);
        }
      })();
    } catch (e) {
      console.error("connectSocket error", e);
      setReconnecting(true);
    }
  }, [auctionId, buildSocketUrl, token, user, resyncFromServer, callApi]);

  // polling resync
  useEffect(() => {
    if (!auctionId) return;
    resyncFromServer();
    // set resync interval
    if (resyncTimerRef.current) window.clearInterval(resyncTimerRef.current);
    resyncTimerRef.current = window.setInterval(
      () => resyncFromServer(),
      resyncIntervalSeconds * 1000
    );

    return () => {
      if (resyncTimerRef.current) window.clearInterval(resyncTimerRef.current);
    };
  }, [auctionId, resyncFromServer, resyncIntervalSeconds]);

  // manage socket lifecycle
  useEffect(() => {
    if (!auctionId) return;
    connectSocket();
    return () => {
      try {
        if (socketRef.current) socketRef.current.disconnect();
      } catch {}
      socketRef.current = null;
    };
  }, [auctionId, connectSocket, token, user]);

  // tick countdown every 250ms using server offset (fallback to client time)
  useEffect(() => {
    if (!auction) return;

    const id = window.setInterval(() => {
      if (!auction) return;
      // ✅ Fixed: serverTimeOffset = clientNow - serverNow
      // So: serverNow = clientNow - serverTimeOffset
      const nowServer = Date.now() - serverTimeOffset;
      const endAtNum = Number(auction.endAt) || 0;
      const remaining = Math.max(0, endAtNum - nowServer);
      if (!Number.isFinite(remaining)) {
        console.warn("useAuctionLive: remaining is not finite", {
          remaining,
          nowServer,
          endAtNum,
          serverTimeOffset,
          auctionEndAt: auction.endAt,
          auctionStatus: auction.status,
        });
        setCountdown(0);
        return;
      }
      if (remaining % 3000 === 0) {  // Log every 3 ticks
        console.log("⏱️ [useAuctionLive] Countdown tick:", {
          remaining: Math.ceil(remaining / 1000) + "s",
          endAtNum,
          nowServer,
          serverTimeOffset,
          auctionStatus: auction.status,
        });
      }
      setCountdown(remaining);
      if (remaining <= 0 && live) {
        setLive(false);
      }
    }, 1000);
    return () => clearInterval(id);
  }, [auction, serverTimeOffset, live]);

  // Public placeBid: prefer socket, fallback to REST; sets optimistic pending
  const placeBid = useCallback(
    async (amount: number) => {
      if (!auctionId) throw new Error("missing auction id");
      // optimistic mark
      pendingBidRef.current = { amount };

      // Prefer socket emit if connected
      const socket = socketRef.current;
      if (socket && socket.connected) {
        try {
          const ackResp: any = await new Promise((resolve, reject) => {
            // 5s timeout for ack
            try {
              // Backend event: auction:place_bid
              socket
                .timeout(5000)
                .emit(
                  "auction:place_bid",
                  { auctionId, amount, clientBidId: `bid-${Date.now()}` },
                  (err: any, resp: any) => {
                    if (err) return reject(err);
                    return resolve(resp);
                  }
                );
            } catch (e) {
              return reject(e);
            }
          });

          // Backend may return success/error in ackResp or via auction:error event
          if (ackResp) {
            if (ackResp.success === false || ackResp.error) {
              pendingBidRef.current = null;
              const reason = ackResp.message ?? ackResp.error ?? "Bid rejected";
              throw new Error(String(reason));
            }
            // Successful bid — state update will come via auction:price_update event
            return ackResp;
          }

          // If no ackResp, resolution will come through socket events
          return { via: "socket" };
        } catch (err) {
          console.warn(
            "socket placeBid failed/timeout, falling back to REST",
            err
          );
          // continue to REST fallback
        }
      }

      try {
        // REST fallback: try callApi first, then axiosInstance
        let resp: any = null;
        try {
          resp = await callApi("post", `/auction/${auctionId}/bid`, { amount });
        } catch (callApiErr) {
          console.warn("callApi fallback failed, trying axiosInstance", callApiErr);
          const ares = await axiosInstance.post(`/auction/${auctionId}/bid`, { amount });
          resp = ares.data?.data ?? ares.data;
        }

        // If response contains new state, update
        if (resp) {
          const snapshot = resp as any;
          if (snapshot.currentPrice !== undefined) {
            setAuction((prev) =>
              prev ? { ...prev, currentPrice: snapshot.currentPrice } : prev
            );
          }
        }
        return resp;
      } catch (e) {
        // clear optimistic if failed
        pendingBidRef.current = null;
        throw e;
      }
    },
    [auctionId, callApi, token, user?.sub]
  );

  return {
    auction,
    loading,
    live,
    reconnecting,
    isConnected,
    countdown,
    serverTimeOffset,
    placeBid,
    pendingBid: pendingBidRef.current,
    resync: resyncFromServer,
  };
}
