import { useCallback, useEffect, useRef, useState } from "react";
import ENV from "../config/env";
import useApiService from "./useApi";
import { useAuth } from "./AuthContext";
import toast from "react-hot-toast";
import { io, Socket } from "socket.io-client";

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
  const { user } = useAuth();
  const resyncIntervalSeconds = options?.resyncIntervalSeconds ?? 10;

  const [loading, setLoading] = useState<boolean>(true);
  const [live, setLive] = useState<boolean>(false);
  const [reconnecting, setReconnecting] = useState<boolean>(false);
  const [auction, setAuction] = useState<AuctionState | null>(null);
  const [serverTimeOffset, setServerTimeOffset] = useState<number>(0); // Date.now() - serverTime
  const [countdown, setCountdown] = useState<number>(0); // ms remaining

  const socketRef = useRef<Socket | null>(null);
  const resyncTimerRef = useRef<number | null>(null);
  const pendingBidRef = useRef<{ amount: number; id?: string } | null>(null);

  const baseUrl = ENV.BASE_URL || "";

  const buildSocketUrl = useCallback(() => {
    // Use dedicated socket URL from env, or fallback to API URL base
    const socketUrl = import.meta.env.VITE_SOCKET_URL;
    if (socketUrl) return socketUrl;
    
    if (!baseUrl) return null;
    // For socket.io we should connect to the API host origin (strip any api path like /api or /api/v1)
    try {
      const u = new URL(baseUrl);
      // Use origin (protocol + host + port)
      return u.origin;
    } catch (e) {
      // fallback: strip common api prefixes
      return baseUrl
        .replace(/\/(?:api|api\/v\d+)(?:\/.*)?$/i, "")
        .replace(/\/$/, "");
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

      // Backend returns: { auctionId, status, currentPrice, startTime, endTime, product, ... }
      const serverTime = Date.now(); // or extract from response if backend provides it
      const snapshot = data;

      setServerTimeOffset(0); // adjust if backend provides serverTime

      // Map backend fields to FE AuctionState
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
      setLive(snapshot.status === "live" || snapshot.status === "scheduled");
      // compute countdown
      setCountdown(Math.max(0, next.endAt - serverTime));
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
      // read token if available for auth handshake
      const token = localStorage.getItem("token");
      console.info("Connecting socket.io to:", url, "for auction:", auctionId);
      const socket = io(`${url}/auctions`, {
        path: "/socket.io",
        transports: ["websocket"],
        auth: token ? { token } : undefined,
        autoConnect: true,
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionAttempts: 5,
      });
      socketRef.current = socket;

      socket.on("connect", async () => {
        console.info("socket.io connected", socket.id);
        setReconnecting(false);
        // Fetch latest snapshot from server first, then join the auction room.
        try {
          await resyncFromServer();
        } catch (e) {
          console.warn("resyncFromServer failed before join", e);
        }
        // join auction room after resync
        socket.emit("auction:join", { auctionId, userId: user?.sub ?? null });
      });

      socket.on("connect_error", (err: any) => {
        console.error("socket connect_error:", err.message || err);
        setReconnecting(true);
        toast.error("Cannot connect to live auction server");
      });

      socket.on("disconnect", (reason: any) => {
        console.warn("socket disconnected", reason);
        setReconnecting(true);
      });

      // Backend events: auction:state, auction:price_update, auction:extended, auction:error

      socket.on("auction:state", (d: any) => {
        console.log("Received auction:state", d);
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
        setCountdown(Math.max(0, next.endAt - Date.now()));
      });

      socket.on("auction:price_update", (d: any) => {
        console.log("Received auction:price_update", d);
        setAuction((prev) => {
          if (!prev) return prev;
          const newPrice = d.currentPrice ?? d.amount ?? prev.currentPrice;
          return { ...prev, currentPrice: newPrice };
        });

        if (pendingBidRef.current) {
          const pendingAmount = pendingBidRef.current.amount;
          if (d.currentPrice === pendingAmount && d.bidderId === user?.sub) {
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
        const newEndTime = d.endTime
          ? new Date(d.endTime).getTime()
          : Date.now() + 60000;
        setAuction((prev) => (prev ? { ...prev, endAt: newEndTime } : prev));
        setCountdown(Math.max(0, newEndTime - Date.now()));
        toast(
          `Auction extended to ${new Date(newEndTime).toLocaleTimeString()}`,
          { icon: "ℹ️" }
        );
      });

      socket.on("auction:error", (d: any) => {
        console.error("Received auction:error", d);
        const reason = d.message ?? "Auction error";
        toast.error(reason);
        if (pendingBidRef.current) {
          pendingBidRef.current = null;
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
    } catch (e) {
      console.error("connectSocket error", e);
      setReconnecting(true);
    }
  }, [auctionId, buildSocketUrl, user]);

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
  }, [auctionId, connectSocket]);

  // tick countdown every 250ms using server offset
  useEffect(() => {
    const id = window.setInterval(() => {
      if (!auction) return;
      const nowServer = Date.now() - serverTimeOffset;
      const remaining = Math.max(0, auction.endAt - nowServer);
      setCountdown(remaining);
      if (remaining <= 0 && live) {
        setLive(false);
      }
    }, 250);
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
              throw new Error(reason);
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
        // REST fallback: POST /auction/:id/bid (if backend supports REST bid endpoint)
        // Note: backend may only support WebSocket bids — adjust if needed
        const resp = await callApi("post", `/auction/${auctionId}/bid`, {
          amount,
        });
        // If response contains new state, update
        if (resp) {
          const snapshot = resp;
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
    [auctionId, callApi, user]
  );

  return {
    auction,
    loading,
    live,
    reconnecting,
    countdown,
    serverTimeOffset,
    placeBid,
    pendingBid: pendingBidRef.current,
    resync: resyncFromServer,
  };
}
