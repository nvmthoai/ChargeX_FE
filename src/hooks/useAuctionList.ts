import { useEffect, useState, useCallback } from "react";
import {
  auctionApi,
  type AuctionSummary,
  type PaginatedAuctions,
} from "../api/auction";

export interface UseAuctionListOptions {
  status?: "scheduled" | "live" | "ended" | "cancelled";
  pageSize?: number;
  autoFetch?: boolean;
}

export interface UseAuctionListReturn {
  auctions: AuctionSummary[];
  total: number;
  page: number;
  pageSize: number;
  isLoading: boolean;
  error: string | null;
  hasMore: boolean;

  // Actions
  fetchAuctions: (page?: number) => Promise<void>;
  nextPage: () => Promise<void>;
  prevPage: () => Promise<void>;
  refresh: () => Promise<void>;
  setStatus: (status?: "scheduled" | "live" | "ended" | "cancelled") => void;
}

export function useAuctionList({
  status,
  pageSize = 20,
  autoFetch = true,
}: UseAuctionListOptions = {}): UseAuctionListReturn {
  const [auctions, setAuctions] = useState<AuctionSummary[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [currentStatus, setCurrentStatus] = useState(status);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAuctions = useCallback(
    async (targetPage?: number) => {
      const pageToFetch = targetPage ?? page;

      try {
        setIsLoading(true);
        setError(null);

        const data: PaginatedAuctions = await auctionApi.getJoinableAuctions(
          currentStatus,
          pageToFetch,
          pageSize
        );

        setAuctions(data.items);
        setTotal(data.meta.total);
        setPage(data.meta.page);
      } catch (err: any) {
        setError(err.message || "Failed to fetch auctions");
        setAuctions([]);
      } finally {
        setIsLoading(false);
      }
    },
    [page, currentStatus, pageSize]
  );

  const nextPage = useCallback(async () => {
    const totalPages = Math.ceil(total / pageSize);
    if (page < totalPages) {
      const newPage = page + 1;
      setPage(newPage);
      await fetchAuctions(newPage);
    }
  }, [page, total, pageSize, fetchAuctions]);

  const prevPage = useCallback(async () => {
    if (page > 1) {
      const newPage = page - 1;
      setPage(newPage);
      await fetchAuctions(newPage);
    }
  }, [page, fetchAuctions]);

  const refresh = useCallback(async () => {
    await fetchAuctions(1);
  }, [fetchAuctions]);

  const setStatus = useCallback(
    (newStatus?: "scheduled" | "live" | "ended" | "cancelled") => {
      setCurrentStatus(newStatus);
      setPage(1);
    },
    []
  );

  useEffect(() => {
    if (autoFetch) {
      fetchAuctions(1);
    }
  }, [currentStatus, autoFetch, fetchAuctions]);

  const hasMore = page < Math.ceil(total / pageSize);

  return {
    auctions,
    total,
    page,
    pageSize,
    isLoading,
    error,
    hasMore,
    fetchAuctions,
    nextPage,
    prevPage,
    refresh,
    setStatus,
  };
}
