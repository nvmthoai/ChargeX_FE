import { useEffect, useState, useCallback, useRef } from "react";
import {
  auctionSocket,
  type AuctionState,
  type PriceUpdate,
} from "../api/auction/socket";
import { auctionApi, type AuctionDetail } from "../api/auction";

export interface UseAuctionOptions {
  auctionId: string;
  userId?: string;
  autoConnect?: boolean;
}

export interface UseAuctionReturn {
  // State
  auctionState: AuctionState | null;
  auctionDetail: AuctionDetail | null;
  isConnected: boolean;
  isLoading: boolean;
  error: string | null;

  // Actions
  placeBid: (amount: number) => void;
  buyNow: () => Promise<void>;
  refresh: () => Promise<void>;

  // Connection
  connect: () => void;
  disconnect: () => void;
}

export function useAuction({
  auctionId,
  userId,
  autoConnect = true,
}: UseAuctionOptions): UseAuctionReturn {
  const [auctionState, setAuctionState] = useState<AuctionState | null>(null);
  const [auctionDetail, setAuctionDetail] = useState<AuctionDetail | null>(
    null
  );
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const mountedRef = useRef(true);
  const hasJoinedRef = useRef(false);

  // Fetch auction details
  const fetchAuctionDetail = useCallback(async () => {
    if (!auctionId) return;

    try {
      setIsLoading(true);
      const detail = await auctionApi.getAuctionById(auctionId);
      if (mountedRef.current) {
        setAuctionDetail(detail);
        setError(null);
      }
    } catch (err: any) {
      if (mountedRef.current) {
        setError(err.message || "Failed to fetch auction");
      }
    } finally {
      if (mountedRef.current) {
        setIsLoading(false);
      }
    }
  }, [auctionId]);

  // Connect to socket
  const connect = useCallback(() => {
    try {
      auctionSocket.connect(userId);
      setIsConnected(true);
      setError(null);
    } catch (err: any) {
      setError(err.message || "Failed to connect");
      setIsConnected(false);
    }
  }, [userId]);

  // Disconnect from socket
  const disconnect = useCallback(() => {
    if (hasJoinedRef.current && auctionId) {
      auctionSocket.leaveAuction(auctionId);
      hasJoinedRef.current = false;
    }
    auctionSocket.disconnect();
    setIsConnected(false);
  }, [auctionId]);

  // Place bid
  const placeBid = useCallback(
    (amount: number) => {
      if (!auctionId) {
        setError("No auction ID provided");
        return;
      }

      try {
        const clientBidId = `bid-${Date.now()}-${Math.random()
          .toString(36)
          .substr(2, 9)}`;
        auctionSocket.placeBid({
          auctionId,
          amount,
          clientBidId,
        });
      } catch (err: any) {
        setError(err.message || "Failed to place bid");
      }
    },
    [auctionId]
  );

  // Buy now
  const buyNow = useCallback(async () => {
    if (!auctionId) {
      setError("No auction ID provided");
      return;
    }

    try {
      await auctionApi.buyNow(auctionId, userId);
      await fetchAuctionDetail();
    } catch (err: any) {
      setError(err.message || "Failed to buy now");
    }
  }, [auctionId, userId, fetchAuctionDetail]);

  // Refresh auction data
  const refresh = useCallback(async () => {
    await fetchAuctionDetail();
  }, [fetchAuctionDetail]);

  // Setup socket listeners
  useEffect(() => {
    if (!isConnected || !auctionId) return;

    // Join auction room
    if (!hasJoinedRef.current) {
      auctionSocket.joinAuction(auctionId);
      hasJoinedRef.current = true;
    }

    // Listen for auction state
    const handleAuctionState = (state: AuctionState) => {
      if (mountedRef.current) {
        setAuctionState(state);
      }
    };

    // Listen for price updates
    const handlePriceUpdate = (update: PriceUpdate) => {
      if (mountedRef.current) {
        setAuctionState((prev) =>
          prev
            ? {
                ...prev,
                currentPrice: update.currentPrice,
                endTime: update.endTime,
                winnerId: update.winnerId,
              }
            : null
        );

        // Also update detail
        setAuctionDetail((prev) =>
          prev
            ? {
                ...prev,
                currentPrice: update.currentPrice,
                endTime: update.endTime,
                winnerId: update.winnerId,
              }
            : null
        );
      }
    };

    // Listen for auction extended
    const handleAuctionExtended = (data: { endTime: string }) => {
      if (mountedRef.current) {
        setAuctionState((prev) =>
          prev
            ? {
                ...prev,
                endTime: data.endTime,
              }
            : null
        );

        setAuctionDetail((prev) =>
          prev
            ? {
                ...prev,
                endTime: data.endTime,
              }
            : null
        );
      }
    };

    // Listen for errors
    const handleError = (err: { message: string }) => {
      if (mountedRef.current) {
        setError(err.message);
      }
    };

    auctionSocket.onAuctionState(handleAuctionState);
    auctionSocket.onPriceUpdate(handlePriceUpdate);
    auctionSocket.onAuctionExtended(handleAuctionExtended);
    auctionSocket.onError(handleError);

    return () => {
      auctionSocket.off("auction:state", handleAuctionState);
      auctionSocket.off("auction:price_update", handlePriceUpdate);
      auctionSocket.off("auction:extended", handleAuctionExtended);
      auctionSocket.off("auction:error", handleError);
    };
  }, [isConnected, auctionId]);

  // Auto connect and fetch data on mount
  useEffect(() => {
    mountedRef.current = true;

    if (autoConnect) {
      connect();
    }

    fetchAuctionDetail();

    return () => {
      mountedRef.current = false;
      if (hasJoinedRef.current && auctionId) {
        auctionSocket.leaveAuction(auctionId);
        hasJoinedRef.current = false;
      }
    };
  }, [auctionId, autoConnect, connect, fetchAuctionDetail]);

  return {
    auctionState,
    auctionDetail,
    isConnected,
    isLoading,
    error,
    placeBid,
    buyNow,
    refresh,
    connect,
    disconnect,
  };
}
