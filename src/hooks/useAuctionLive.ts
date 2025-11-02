import { useState, useEffect, useCallback, useRef } from "react";
import { io, Socket } from "socket.io-client";

const SOCKET_URL =
  import.meta.env.VITE_SOCKET_URL ||
  import.meta.env.VITE_API_URL ||
  "http://localhost:3001";

interface AuctionData {
  auctionId: string;
  productId: string;
  status: "scheduled" | "live" | "ended" | "cancelled";
  startTime: string;
  endTime: string;
  currentPrice: number;
  startingPrice: number;
  buyNowPrice?: number;
  minIncrement: number;
  reserveMet: boolean;
  bidCount: number;
  winnerId: string | null;
  product?: {
    id: string;
    title: string;
    description: string;
    images: string[];
  };
}

interface PriceUpdate {
  currentPrice: number;
  endTime: string;
  bidId: string;
  winnerId: string;
}

interface UseAuctionLiveOptions {
  resyncIntervalSeconds?: number;
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
  const { resyncIntervalSeconds = 8 } = options;

  const [auction, setAuction] = useState<AuctionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [reconnecting, setReconnecting] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [pendingBid, setPendingBid] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const socketRef = useRef<Socket | null>(null);
  const resyncIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const countdownIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const mountedRef = useRef(true);

  const live = auction?.status === "live";

  // Fetch auction details from REST API
  const fetchAuctionDetail = useCallback(async () => {
    if (!auctionId) return;

    try {
      const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";
      const response = await fetch(`${API_URL}/auction/${auctionId}`);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (mountedRef.current) {
        setAuction(data);
        setError(null);
        setLoading(false);
      }
    } catch (err: any) {
      console.error("[useAuctionLive] Fetch error:", err);
      if (mountedRef.current) {
        setError(err.message || "Failed to fetch auction");
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
      const socket = io(SOCKET_URL, {
        path: "/socket.io/",
        transports: ["websocket", "polling"],
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionAttempts: 5,
      });

      socketRef.current = socket;

      socket.on("connect", () => {
        console.log("[useAuctionLive] Socket connected:", socket.id);
        setReconnecting(false);

        // Join auction room
        socket.emit("auction:join", { auctionId });
      });

      socket.on("disconnect", () => {
        console.log("[useAuctionLive] Socket disconnected");
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
        console.log("[useAuctionLive] Received auction state:", state);
        if (mountedRef.current) {
          setAuction(state);
          setLoading(false);
        }
      });

      // Listen for price updates
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
          // Clear pending bid on successful update
          setPendingBid(null);
        }
      });

      // Listen for auction extended
      socket.on("auction:extended", (data: { endTime: string }) => {
        console.log("[useAuctionLive] Auction extended:", data);
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
  }, [auctionId]);

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

      // Emit bid to server
      socketRef.current.emit("auction:place_bid", {
        auctionId,
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
    [auctionId]
  );

  // Update countdown
  useEffect(() => {
    if (!auction?.endTime) {
      setCountdown(0);
      return;
    }

    const updateCountdown = () => {
      const now = new Date().getTime();
      const end = new Date(auction.endTime).getTime();
      const distance = Math.max(0, end - now);

      if (mountedRef.current) {
        setCountdown(Math.floor(distance / 1000)); // seconds
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
