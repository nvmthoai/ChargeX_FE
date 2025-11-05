import { useState, useEffect, useCallback, useRef } from "react";
import { io, Socket } from "socket.io-client";
import api from "../config/axios";

const SOCKET_URL =
  import.meta.env.VITE_SOCKET_URL ||
  import.meta.env.VITE_API_URL ||
  "http://localhost:3001";

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
  const [reconnecting, setReconnecting] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [pendingBid, setPendingBid] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const socketRef = useRef<Socket | null>(null);
  const resyncIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const countdownIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const mountedRef = useRef(true);

  const live = auction?.status === "live";

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
      }
        } catch (err: unknown) {
      console.error("[useAuctionLive] Socket connection error:", err);
      if (mountedRef.current) {
        setError("Failed to connect to live auction");
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
      const socket = io(SOCKET_URL, {
        path: "/socket.io/",
        transports: ["websocket", "polling"],
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionAttempts: 5,
        auth: {
          userId: bidderId, // Pass user ID for authentication
        },
      });

      socketRef.current = socket;

      socket.on("connect", () => {
        setReconnecting(false);
        // Join auction room
        socket.emit("auction:join", { auctionId });
      });

      socket.on("disconnect", () => {
        if (mountedRef.current) {
          setReconnecting(true);
        }
      });

      socket.on("connect_error", (err: Error) => {
        console.error("[useAuctionLive] Connection error:", err);
        if (mountedRef.current) {
          setReconnecting(true);
        }
      });

      // Listen for auction state updates
      socket.on("auction:state", (state: AuctionData) => {
        if (mountedRef.current) {
          setAuction(state);
          setLoading(false);
        }
      });

      // Listen for price updates
      socket.on("auction:price_update", (update: PriceUpdate) => {
        
        if (mountedRef.current) {
          setAuction((prev) => {
            if (!prev) return prev;
            
            // Add new bid to history
            const newBid: BidHistoryItem = {
              bidId: update.bidId,
              userId: update.userId || update.winnerId || 'unknown',
              userName: update.userName,
              amount: update.currentPrice,
              timestamp: update.timestamp,
              isWinning: true,
            };
            
            // Update existing history - mark previous bids as not winning
            const updatedHistory = (prev.bidHistory || []).map(bid => ({
              ...bid,
              isWinning: false,
            }));
            
           
            
            return {
              ...prev,
              currentPrice: update.currentPrice,
              endTime: update.endTime,
              winnerId: update.winnerId,
              bidCount: updatedHistory.length + 1,
              bidHistory: [newBid, ...updatedHistory], // Latest bid first
            };
          });
          // Clear pending bid on successful update
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
    } catch (err: any) {
      console.error("[useAuctionLive] Socket connection failed:", err);
      setError(err.message || "Failed to connect to auction");
    }
  }, [auctionId, bidderId]);

  // Place bid function
  const placeBid = useCallback(
    async (amount: number) => {
      if (!socketRef.current?.connected) {
        throw new Error("Not connected to auction server");
      }

      if (!auctionId) {
        throw new Error("No auction ID");
      }

      // Set pending bid for optimistic UI
      setPendingBid(amount);
      setError(null);

      const clientBidId = `bid-${Date.now()}-${Math.random()
        .toString(36)
        .substr(2, 9)}`;

      // Check if we have bidderId
      if (!bidderId) {
        console.error("❌ [useAuctionLive] No bidderId provided!");
        throw new Error("User not authenticated. Please log in to place a bid.");
      }

 

      // Emit bid to server
      socketRef.current.emit("auction:place_bid", {
        auctionId,
        bidderId,
        amount,
        clientBidId,
      });
      
      

      // Clear pending after a timeout (in case we don't get response)
      setTimeout(() => {
        if (mountedRef.current) {
          setPendingBid(null);
        }
      }, 5000);
    },
    [auctionId, bidderId]
  );

  // Update countdown
  useEffect(() => {
    if (!auction?.endTime) {
      setCountdown(0);
      return;
    }

    const updateCountdown = () => {
      const now = new Date().getTime();
      
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
  }, [auction?.endTime]);

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
    };
  }, [auctionId, connectSocket, fetchAuctionDetail, resyncIntervalSeconds]);

  return {
    auction,
    loading,
    live,
    reconnecting,
    countdown,
    placeBid,
    pendingBid,
    resync,
    error,
  };
}
