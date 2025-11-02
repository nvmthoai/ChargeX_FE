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
export default function useAuctionLive(auctionId: string | null, options?: UseAuctionLiveOptions) {
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
    if (!baseUrl) return null;
    // For socket.io we should connect to the API host origin (strip any api path like /api or /api/v1)
    try {
      const u = new URL(baseUrl);
      // Use origin (protocol + host + port)
      return u.origin;
    } catch (e) {
      // fallback: strip common api prefixes
      return baseUrl.replace(/\/(?:api|api\/v\d+)(?:\/.*)?$/i, "").replace(/\/$/, "");
    }
  }, [baseUrl]);

  const resyncFromServer = useCallback(async () => {
    if (!auctionId) return;
    try {
      setLoading(true);
      // Try both common endpoints — backend might use /auction/:id or /auctions/:id
      let data: any = null;
      try {
        data = await callApi("get", `/auction/${auctionId}`);
      } catch (_) {
        data = await callApi("get", `/auctions/${auctionId}`);
      }

      if (!data) return;

      // Expect data to include serverTime and auction snapshot
      const serverTime = data.serverTime ?? data.server_time ?? Date.now();
      const snapshot = data.auction ?? data;

      setServerTimeOffset(Date.now() - serverTime);

      const next: AuctionState = {
        id: String(snapshot.id ?? auctionId),
        currentPrice: snapshot.currentPrice ?? snapshot.current_price ?? snapshot.currentBid ?? 0,
        minIncrement: snapshot.minIncrement ?? snapshot.min_increment ?? snapshot.minBidIncrement ?? 0,
        endAt: snapshot.endAt ?? snapshot.end_at ?? snapshot.endsAt ?? Date.now(),
        participants: snapshot.participants ?? [],
        status: snapshot.status ?? snapshot.state ?? "live",
        winnerId: snapshot.winnerId ?? snapshot.winner_id ?? null,
        finalPrice: snapshot.finalPrice ?? snapshot.final_price ?? null,
      };

      setAuction(next);
      setLive(true);
      // compute countdown
      setCountdown(Math.max(0, next.endAt - serverTime));
    } catch (e) {
      console.error("resyncFromServer error", e);
    } finally {
      setLoading(false);
    }
  }, [auctionId, callApi]);

  const connectSocket = useCallback(() => {
    const url = buildSocketUrl();
    if (!url || !auctionId) return;

    try {
      setReconnecting(false);
      // read token if available for auth handshake
      const token = localStorage.getItem("token");
      const socket = io(url, {
        path: "/socket.io",
        transports: ["websocket"],
        auth: token ? { token } : undefined,
        autoConnect: true,
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
        console.warn("socket connect_error", err);
        setReconnecting(true);
      });

      socket.on("disconnect", (reason: any) => {
        console.warn("socket disconnected", reason);
        setReconnecting(true);
      });

      socket.on("heartbeat", (d: any) => {
        const serverTime = d.serverTime ?? d.server_time ?? Date.now();
        setServerTimeOffset(Date.now() - serverTime);
      });

      socket.on("auction:state", (d: any) => {
        const serverTime = d.serverTime ?? d.server_time ?? Date.now();
        setServerTimeOffset(Date.now() - serverTime);
        const snapshot = d.auction ?? d;
        const next: AuctionState = {
          id: String(snapshot.id ?? auctionId),
          currentPrice: snapshot.currentPrice ?? snapshot.current_price ?? snapshot.currentBid ?? 0,
          minIncrement: snapshot.minIncrement ?? snapshot.min_increment ?? snapshot.minBidIncrement ?? 0,
          endAt: snapshot.endAt ?? snapshot.end_at ?? snapshot.endsAt ?? Date.now(),
          participants: snapshot.participants ?? [],
          status: snapshot.status ?? snapshot.state ?? "live",
          winnerId: snapshot.winnerId ?? snapshot.winner_id ?? null,
          finalPrice: snapshot.finalPrice ?? snapshot.final_price ?? null,
        };
        setAuction(next);
        setCountdown(Math.max(0, next.endAt - serverTime));
      });

      socket.on("auction:bid", (d: any) => {
        const serverTime = d.serverTime ?? d.server_time ?? Date.now();
        setServerTimeOffset(Date.now() - serverTime);
        const bid = d.bid ?? d;
        setAuction((prev) => {
          if (!prev) return prev;
          return { ...prev, currentPrice: bid.amount ?? bid.price ?? prev.currentPrice };
        });

        if (pendingBidRef.current) {
          const pendingAmount = pendingBidRef.current.amount;
          if (bid.amount === pendingAmount && bid.bidderId === user?.sub) {
            pendingBidRef.current = null;
            toast.success("Your bid was accepted");
          } else if (bid.amount > pendingAmount && bid.bidderId !== user?.sub) {
            pendingBidRef.current = null;
            toast.error("You have been outbid");
          }
        }
      });

      socket.on("auction:bidRejected", (d: any) => {
        const reason = d.reason ?? d.message ?? "Bid rejected";
        pendingBidRef.current = null;
        toast.error(reason);
      });

      socket.on("auction:ended", (d: any) => {
        const serverTime = d.serverTime ?? d.server_time ?? Date.now();
        setServerTimeOffset(Date.now() - serverTime);
        const ended = d;
        setAuction((prev) => (prev ? { ...prev, status: "ended", winnerId: ended.winnerId ?? ended.winner_id ?? null, finalPrice: ended.finalPrice ?? ended.final_price ?? null } : prev));
        setLive(false);
        if (ended.winnerId && user?.sub && ended.winnerId === user.sub) {
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
    resyncTimerRef.current = window.setInterval(() => resyncFromServer(), resyncIntervalSeconds * 1000);

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
              socket.timeout(5000).emit("auction:placeBid", { auctionId, amount, userId: user?.sub ?? null }, (err: any, resp: any) => {
                if (err) return reject(err);
                return resolve(resp);
              });
            } catch (e) {
              return reject(e);
            }
          });

          // ackResp may include { accepted, auction, serverTime }
          if (ackResp) {
            if (ackResp.accepted === false) {
              pendingBidRef.current = null;
              const reason = ackResp.error ?? ackResp.reason ?? "Bid rejected";
              throw new Error(reason);
            }
            if (ackResp.serverTime) setServerTimeOffset(Date.now() - ackResp.serverTime);
            const snapshot = ackResp.auction ?? ackResp;
            if (snapshot) {
              setAuction((prev) => ({
                id: String(snapshot.id ?? auctionId),
                currentPrice: snapshot.currentPrice ?? snapshot.current_price ?? snapshot.currentBid ?? prev?.currentPrice ?? 0,
                minIncrement: snapshot.minIncrement ?? snapshot.min_increment ?? snapshot.minBidIncrement ?? prev?.minIncrement ?? 0,
                endAt: snapshot.endAt ?? snapshot.end_at ?? snapshot.endsAt ?? prev?.endAt ?? Date.now(),
                participants: snapshot.participants ?? prev?.participants ?? [],
                status: snapshot.status ?? prev?.status ?? "live",
                winnerId: snapshot.winnerId ?? snapshot.winner_id ?? prev?.winnerId ?? null,
                finalPrice: snapshot.finalPrice ?? snapshot.final_price ?? prev?.finalPrice ?? null,
              }));
            }
            return ackResp;
          }
          // If no ackResp, resolution will come through socket events
          return { via: "socket" };
        } catch (err) {
          console.warn("socket placeBid failed/timeout, falling back to REST", err);
          // continue to REST fallback
        }
      }

      try {
        // REST fallback: use /auctions/:id/bid per contract
        const resp = await callApi("post", `/auctions/${auctionId}/bid`, { amount });
        // If response contains canonical state, update
        if (resp) {
          if (resp.serverTime) setServerTimeOffset(Date.now() - resp.serverTime);
          const snapshot = resp.auction ?? resp;
          if (snapshot) {
            setAuction((prev) => ({
              id: String(snapshot.id ?? auctionId),
              currentPrice: snapshot.currentPrice ?? snapshot.current_price ?? snapshot.currentBid ?? prev?.currentPrice ?? 0,
              minIncrement: snapshot.minIncrement ?? snapshot.min_increment ?? snapshot.minBidIncrement ?? prev?.minIncrement ?? 0,
              endAt: snapshot.endAt ?? snapshot.end_at ?? snapshot.endsAt ?? prev?.endAt ?? Date.now(),
              participants: snapshot.participants ?? prev?.participants ?? [],
              status: snapshot.status ?? prev?.status ?? "live",
              winnerId: snapshot.winnerId ?? snapshot.winner_id ?? prev?.winnerId ?? null,
              finalPrice: snapshot.finalPrice ?? snapshot.final_price ?? prev?.finalPrice ?? null,
            }));
          }
        }
        return resp;
      } catch (e) {
        // clear optimistic if failed
        pendingBidRef.current = null;
        throw e;
      }
    },
    [auctionId, callApi, user],
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
