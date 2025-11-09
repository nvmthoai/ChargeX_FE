import { useState, useEffect, useCallback, useRef } from "react";
import { io, Socket } from "socket.io-client";

const SOCKET_URL =
  import.meta.env.VITE_SOCKET_URL ||
  "http://103.163.24.150:3001";

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
  title?: string;
  description?: string;
  imageUrls?: string[];
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
  const { resyncIntervalSeconds = 8 } = options;

  const [auction, setAuction] = useState<AuctionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [reconnecting, setReconnecting] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
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
      const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001/api/v1";
      const response = await fetch(`${API_URL}/auction/${auctionId}`);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const serverData = await response.json();

      if (mountedRef.current) {
        // Map server data to expected AuctionData format
        const data: AuctionData = {
          auctionId: serverData.auctionId || auctionId || "",
          productId: serverData.productId || "",
          status: serverData.status || "live",
          startTime: serverData.startTime || "",
          endTime: serverData.endTime || "",
          currentPrice: serverData.currentPrice || 0,
          startingPrice: serverData.startingPrice || 0,
          buyNowPrice: serverData.buyNowPrice,
          minIncrement: serverData.minBidIncrement || serverData.minIncrement || 1000,
          reserveMet: serverData.reserveMet || false,
          bidCount: serverData.bidCount || 0,
          winnerId: serverData.winnerId || null,
          title: serverData.title,
          description: serverData.description,
          imageUrls: serverData.imageUrls || [],
        };
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
      // If an existing socket exists, and is connected, reuse it; otherwise close it before creating a new one
      if (socketRef.current) {
        try {
          socketRef.current.off();
          socketRef.current.disconnect();
        } catch {
          // ignore
        }
        socketRef.current = null;
      }

      // Get auth token for WebSocket connection
      const token = localStorage.getItem("token");
      const userId = localStorage.getItem("userId") || undefined; // Ensure undefined if absent

      // Build namespace URL explicitly (use http(s) base)
      const namespaceUrl = `${SOCKET_URL.replace(/\/+$/, "")}/auctions`;

      const socket = io(namespaceUrl, {
        path: "/socket.io/",
        transports: ["websocket", "polling"],
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 10000,
        randomizationFactor: 0.5,
        reconnectionAttempts: Infinity,
        upgrade: true,
        forceNew: true, // ensure a fresh connection for this hook
        timeout: 10000,
        auth: {
          userId,
          token,
        },
        query: {
          userId,
        },
      });

      socketRef.current = socket;

      const onConnect = () => {
        console.log("[useAuctionLive] Socket connected:", socket.id);
        setIsConnected(true);
        setReconnecting(false);

        // Join auction room after connection
        console.log("[useAuctionLive] Joining auction room:", auctionId);
        socket.emit("auction:join", { auctionId });
      };

      const onDisconnect = (reason?: string) => {
        console.log("[useAuctionLive] Socket disconnected", reason);
        if (mountedRef.current) {
          setIsConnected(false);
          setReconnecting(true);
        }
      };

      const onConnectError = (err: unknown) => {
        // Derive message from unknown
        let msg = "";
        if (err instanceof Error) msg = err.message;
        else if (typeof err === "string") msg = err;
        else if (typeof err === "object" && err !== null && "message" in err) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          msg = (err as any).message ?? String(err);
        } else {
          msg = String(err);
        }

        console.error("[useAuctionLive] Connection error:", msg);
        if (mountedRef.current) {
          setReconnecting(true);
          setError(msg || "WebSocket connection error");
        }
      };

      socket.on("connect", onConnect);
      socket.on("disconnect", onDisconnect);
      socket.on("connect_error", onConnectError);

      // Listen for auction state updates
      socket.on("auction:state", (serverData: unknown) => {
        console.log("[useAuctionLive] Received auction state:", serverData);
        if (mountedRef.current) {
          // Map server data to expected AuctionData format
          // Use any-to-unknown mapping with safe fallback
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const sd = serverData as any || {};
          const state: AuctionData = {
            auctionId: sd.auctionId || auctionId || "",
            productId: sd.productId || "",
            status: sd.status || "live",
            startTime: sd.startTime || "",
            endTime: sd.endTime || "",
            currentPrice: sd.currentPrice || 0,
            startingPrice: sd.startingPrice || 0,
            buyNowPrice: sd.buyNowPrice,
            minIncrement: sd.minBidIncrement || sd.minIncrement || 1000,
            reserveMet: sd.reserveMet || false,
            bidCount: sd.bidCount || 0,
            winnerId: sd.winnerId || null,
            title: sd.title,
            description: sd.description,
            imageUrls: sd.imageUrls || [],
          };
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
        throw new Error("Not connected to auction server");
      }

      if (!auctionId) {
        throw new Error("No auction ID");
      }

      // Client-side validation (as recommended in guide)
      const currentPrice = auction?.currentPrice || 0;
      const minIncrement = auction?.minIncrement || 0;
      const minBidRequired = currentPrice + minIncrement;

      if (amount < minBidRequired) {
        throw new Error(`Minimum bid required: ${minBidRequired}`);
      }

      // Set pending bid for optimistic UI
      setPendingBid(amount);
      setError(null);

      console.log("[useAuctionLive] Placing bid:", { auctionId, amount });

      // Emit bid to server (following guide structure)
      socketRef.current.emit("auction:place_bid", {
        auctionId,
        amount,
      });

      // Clear pending after a timeout (in case we don't get response)
      setTimeout(() => {
        if (mountedRef.current) {
          setPendingBid(null);
        }
      }, 5000);
    },
    [auctionId, auction]
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

      // Properly leave room and disconnect socket (as per guide)
      if (socketRef.current) {
        try {
          console.log("[useAuctionLive] Leaving auction room:", auctionId);
          socketRef.current.emit("auction:leave", { auctionId });
          socketRef.current.off();
          socketRef.current.disconnect();
        } catch {
          // ignore
        }
        socketRef.current = null;
      }
    };
  }, [auctionId, connectSocket, fetchAuctionDetail, resyncIntervalSeconds]);

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
