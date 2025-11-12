import { useState, useEffect, useCallback, useRef } from "react";
import { Socket } from "socket.io-client";
import { auctionSocket } from "../../api/auction/socket";
import api from "../config/axios";

// NOTE: normalized socket url is handled by the singleton socket; function removed to avoid unused declaration

interface BidHistoryItem {
  bidId: string;
  userId: string;
  userName?: string;
  amount: number;
  timestamp: string;
  isWinning?: boolean;
}

interface AuctionData {
  auctionId: string;
  productId: string;
  status: "scheduled" | "live" | "ended" | "cancelled";
  startTime: string;
  endTime: string;
  currentPrice: number;
  startingPrice?: number;
  buyNowPrice?: number;
  minBidIncrement: number; // ✅ Fixed: Backend returns minBidIncrement, not minIncrement
  reservePrice?: number;
  antiSnipingSeconds?: number;
  leadingBidId?: string | null;
  bidCount?: number;
  winnerId?: string | null;
  bidHistory?: BidHistoryItem[]; // Add bid history
  product?: {
    title: string;
    description: string;
    imageUrls: string[];
    sohPercent?: number;
    cycleCount?: number;
    nominalVoltageV?: number;
    weightKg?: number;
    conditionGrade?: string;
    dimension?: string;
    priceStart?: number;
    priceBuyNow?: number;
  };
}

interface PriceUpdate {
  currentPrice: number;
  endTime: string;
  bidId: string;
  winnerId: string;
  timestamp: string;
  userName?: string;
  userId?: string;
}

interface UseAuctionLiveOptions {
  resyncIntervalSeconds?: number;
  bidderId?: string | null; // User ID for placing bids
}

interface UseAuctionLiveReturn {
  auction: AuctionData | null;
  loading: boolean;
  live: boolean;
  reconnecting: boolean;
  isConnected: boolean;
  countdown: number;
  placeBid: (amount: number) => Promise<void>;
  pendingBid: number | null;
  resync: () => Promise<void>;
  error: string | null;
}

export default function useAuctionLive(
  auctionId: string | null,
  options: UseAuctionLiveOptions = {}
): UseAuctionLiveReturn {
  const { resyncIntervalSeconds = 8, bidderId = null } = options;

  const [auction, setAuction] = useState<AuctionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [reconnecting, setReconnecting] = useState(true);
  const [countdown, setCountdown] = useState(0);
  const [pendingBid, setPendingBid] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [serverTimeOffset, setServerTimeOffset] = useState<number>(0);

  const socketRef = useRef<Socket | null>(null);
  const resyncIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const countdownIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const mountedRef = useRef(true);

  const live = auction?.status?.toLowerCase() === "live";

  // Fetch auction details from REST API
  const fetchAuctionDetail = useCallback(async () => {
    if (!auctionId) return;

    try {
      const response = await api.get(`/auction/${auctionId}`);
      
      // Unwrap NestJS response format: {success, statusCode, data}
      let auctionData = response.data;
      if (auctionData && typeof auctionData === 'object') {
        // Check if response is wrapped
        if ('data' in auctionData && 'success' in auctionData) {
          auctionData = auctionData.data;
        }
      }

      if (mountedRef.current) {
        setAuction(auctionData);
        setError(null);
        setLoading(false);
        // if server provides serverNow, compute offset
        try {
          const serverNow = auctionData?.serverNow || auctionData?.server_now || null;
          if (serverNow) {
            const serverMs = new Date(serverNow).getTime();
            if (!Number.isNaN(serverMs)) setServerTimeOffset(Date.now() - serverMs);
          }
        } catch {
          // ignore
        }
       }
    } catch (err: unknown) {
      console.error("[useAuctionLive] fetchAuctionDetail error:", err);
      if (mountedRef.current) {
        // Derive a safe fallback message without using `any` directly
        let fallbackMessage = "Failed to load auction details";
        try {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const e: any = err;
          if (e && e.response && e.response.data && e.response.data.message) {
            fallbackMessage = e.response.data.message;
          } else if (err instanceof Error) {
            fallbackMessage = err.message;
          } else if (typeof err === 'string') {
            fallbackMessage = err;
          }
        } catch {
          // ignore
        }
        setError(fallbackMessage);
        setLoading(false);
      }
    }
  }, [auctionId]);

  // Resync function
  const resync = useCallback(async () => {
    await fetchAuctionDetail();
  }, [fetchAuctionDetail]);

  // Connect to WebSocket
  const connectSocket = useCallback(() => {
    if (!auctionId) return;

    try {
      const storedUserId = localStorage.getItem("userId");
      const normalizedUserId =
        storedUserId && storedUserId !== "null" && storedUserId !== "undefined"
          ? storedUserId
          : undefined;
      const socket = auctionSocket.connect(normalizedUserId);
      socketRef.current = socket;

      socket.on("connect", () => {
        if (!mountedRef.current) return;
        setIsConnected(true);
        setReconnecting(false);
        console.log("[useAuctionLive] Joining auction room:", auctionId);
        socket.emit("auction:join", { auctionId });
      });

      socket.on("disconnect", () => {
        if (mountedRef.current) {
          setIsConnected(false);
          setReconnecting(true);
        }
      });

      socket.on("connect_error", (err: unknown) => {
        console.error("[useAuctionLive] Connection error:", err);
        if (mountedRef.current) {
          setReconnecting(true);
        }
      });

      socket.on("auction:state", (serverData: unknown) => {
        if (mountedRef.current) {
          // Safely map unknown to AuctionData shape
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const sd: any = serverData || {};
          const mapped: AuctionData = {
            auctionId: sd.auctionId || auctionId || "",
            productId: sd.productId || "",
            status: sd.status || "scheduled",
            startTime: sd.startTime || "",
            endTime: sd.endTime || "",
            currentPrice: sd.currentPrice || 0,
            startingPrice: sd.startingPrice,
            buyNowPrice: sd.buyNowPrice,
            minBidIncrement: sd.minBidIncrement || sd.minIncrement || 0,
            reservePrice: sd.reservePrice,
            antiSnipingSeconds: sd.antiSnipingSeconds,
            leadingBidId: sd.leadingBidId,
            bidCount: sd.bidCount || 0,
            winnerId: sd.winnerId || null,
            bidHistory: sd.bidHistory || [],
            product: sd.product || undefined,
          };
          setAuction(mapped);
          setLoading(false);
          // update server time offset if provided by socket payload
          try {
            const sv: any = sd
            const sNow = sv.serverNow ?? sv.server_now ?? sv.serverTime
            if (sNow) {
              const sMs = new Date(sNow).getTime()
              if (!Number.isNaN(sMs)) setServerTimeOffset(Date.now() - sMs)
            }
          } catch {
            // ignore
          }
         }
       });

      socket.on("auction:price_update", (update: PriceUpdate) => {
        console.log("[useAuctionLive] Price update:", update);
        if (mountedRef.current) {
          setAuction((prev) => {
            if (!prev) return prev;
            return {
              ...prev,
              currentPrice: update.currentPrice,
              endTime: update.endTime,
              winnerId: update.winnerId,
              bidCount: (prev.bidCount || 0) + 1,
            };
          });
          setPendingBid(null);
        }
      });

      // Listen for auction extended
      socket.on("auction:extended", (data: { endTime: string }) => {
        
        if (mountedRef.current) {
          setAuction((prev) => {
            if (!prev) return prev;
            return { ...prev, endTime: data.endTime };
          });
        }
      });

      // Listen for errors
      socket.on("auction:error", (err: { message: string }) => {
        console.error("[useAuctionLive] Auction error:", err);
        if (mountedRef.current) {
          setError(err.message);
          setPendingBid(null);
        }
      });
    } catch (err: unknown) {
      let msg = "";
      if (err instanceof Error) msg = err.message;
      else msg = String(err);
      console.error("[useAuctionLive] Socket connection failed:", msg);
      setError(msg || "Failed to connect to auction");
    }
  }, [auctionId]);

  // Place bid function
  const placeBid = useCallback(
    async (amount: number) => {
      if (!socketRef.current?.connected) {
        const msg = "Not connected to auction server"
        console.error("[useAuctionLive]", msg)
        throw new Error(msg)
      }

      if (!auctionId) {
        const msg = "No auction ID"
        console.error("[useAuctionLive]", msg)
        throw new Error(msg)
      }

      // Try to resolve bidderId: prefer provided option, fallback to localStorage
      const normalizedOptionBidder =
        bidderId && bidderId !== "null" && bidderId !== "undefined" ? bidderId : null
      const storedUserId = localStorage.getItem("userId")
      const normalizedStoredUser =
        storedUserId && storedUserId !== "null" && storedUserId !== "undefined"
          ? storedUserId
          : null
      const decodedUser = tryDecodeTokenSub()
      const effectiveBidderId = normalizedOptionBidder ?? normalizedStoredUser ?? decodedUser ?? null

      if (!effectiveBidderId) {
        console.error("❌ [useAuctionLive] No bidderId provided!")
        const errMsg = "User not authenticated. Please log in to place a bid."
        // update hook error state and throw to caller
        setError(errMsg)
        throw new Error(errMsg)
      }

      // Set pending bid for optimistic UI only after we validated bidder
      setPendingBid(amount)
      setError(null)

      const clientBidId = `bid-${Date.now()}-${Math.random()
        .toString(36)
        .substr(2, 9)}`

      // Emit bid to server
      socketRef.current.emit("auction:place_bid", {
        auctionId,
        bidderId: effectiveBidderId,
        amount,
        clientBidId,
      })

      // Clear pending after a timeout (in case we don't get response)
      setTimeout(() => {
        if (mountedRef.current) {
          setPendingBid(null)
        }
      }, 5000)
    },
    [auctionId, bidderId]
  )

  // Update countdown
  useEffect(() => {
    if (!auction?.endTime) {
      setCountdown(0);
      return;
    }

    const updateCountdown = () => {
      // derive server current time using offset (serverNow = Date.now() - offset)
      const now = Date.now() - serverTimeOffset;

      // Ensure endTime is properly parsed as ISO string (UTC)
      let endTimeStr = auction.endTime;
      // If endTime doesn't have timezone info, assume it's UTC
      if (!endTimeStr.endsWith('Z') && !endTimeStr.includes('+') && !endTimeStr.includes('-', 10)) {
        endTimeStr = endTimeStr + 'Z';
      }

      const end = new Date(endTimeStr).getTime();
      const distance = Math.max(0, end - now);
      const seconds = Math.floor(distance / 1000);

      if (mountedRef.current) {
        setCountdown(seconds);
      }

      if (distance <= 0 && countdownIntervalRef.current) {
        clearInterval(countdownIntervalRef.current);
      }
    };

    updateCountdown();
    countdownIntervalRef.current = setInterval(updateCountdown, 1000);

    return () => {
      if (countdownIntervalRef.current) {
        clearInterval(countdownIntervalRef.current);
      }
    };
  }, [auction?.endTime, serverTimeOffset]);

  // Initial fetch and socket connection
  useEffect(() => {
    if (!auctionId) return;

    // Set mounted state to true on mount
    mountedRef.current = true;

    // Fetch initial data
    fetchAuctionDetail();

    // Connect to WebSocket
    connectSocket();

    // Setup resync interval
    if (resyncIntervalSeconds > 0) {
      resyncIntervalRef.current = setInterval(() => {
        fetchAuctionDetail();
      }, resyncIntervalSeconds * 1000);
    }

    return () => {
      mountedRef.current = false;

      // Clear intervals
      if (resyncIntervalRef.current) {
        clearInterval(resyncIntervalRef.current);
      }
      if (countdownIntervalRef.current) {
        clearInterval(countdownIntervalRef.current);
      }

      // Disconnect socket
      if (socketRef.current) {
        socketRef.current.emit("auction:leave", { auctionId });
        socketRef.current.disconnect();
        socketRef.current = null;
      }
      setIsConnected(false);
      setReconnecting(false);
    };
  }, [auctionId, connectSocket, fetchAuctionDetail, resyncIntervalSeconds]);

  // Helper: try decode JWT payload to extract user id
  const tryDecodeTokenSub = () => {
    try {
      const tk = localStorage.getItem("token")
      if (!tk) return null
      const parts = tk.split('.')
      if (parts.length < 2) return null
      const payload = JSON.parse(atob(parts[1].replace(/-/g, '+').replace(/_/g, '/')))
      return payload?.sub || payload?.userId || null
    } catch {
      return null
    }
  }

  return {
    auction,
    loading,
    live,
    reconnecting,
    isConnected,
    countdown,
    placeBid,
    pendingBid,
    resync,
    error,
  };
}
