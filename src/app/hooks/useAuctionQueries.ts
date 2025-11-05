import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { auctionApi } from '../../api/auction';

// Query Keys - Centralized for consistency
export const auctionKeys = {
  all: ['auctions'] as const,
  lists: () => [...auctionKeys.all, 'list'] as const,
  list: (filters: string) => [...auctionKeys.lists(), filters] as const,
  details: () => [...auctionKeys.all, 'detail'] as const,
  detail: (id: string) => [...auctionKeys.details(), id] as const,
};

/**
 * Hook to fetch joinable auctions with caching and auto-refresh
 * @param status - Filter by auction status (live, scheduled, all)
 * @param page - Page number
 * @param pageSize - Items per page
 */
export function useAuctions(
  status?: 'live' | 'scheduled' | 'all',
  page: number = 1,
  pageSize: number = 20
) {
  return useQuery({
    queryKey: auctionKeys.list(status || 'all'),
    queryFn: () => auctionApi.getJoinableAuctions(
      status === 'all' ? undefined : status,
      page,
      pageSize
    ),
    // Refetch every 30 seconds for live auctions
    refetchInterval: status === 'live' ? 30000 : false,
    // Keep data fresh for 1 minute
    staleTime: 60000,
  });
}

/**
 * Hook to fetch single auction detail with caching
 * @param auctionId - Auction ID
 */
export function useAuction(auctionId: string | null) {
  return useQuery({
    queryKey: auctionKeys.detail(auctionId || ''),
    queryFn: () => {
      if (!auctionId) throw new Error('No auction ID');
      return auctionApi.getAuctionById(auctionId);
    },
    enabled: !!auctionId, // Only fetch when auctionId exists
    // Refetch every 10 seconds for active auction
    refetchInterval: 10000,
    staleTime: 5000,
  });
}

/**
 * Hook to place bid with optimistic update
 */
export function usePlaceBid(auctionId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (amount: number) => {
      // This would be the actual bid API call
      // For now, we'll use the socket in useAuctionLive
      return { success: true, amount };
    },
    // Optimistic update
    onMutate: async (newBid) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: auctionKeys.detail(auctionId) });

      // Snapshot previous value
      const previousAuction = queryClient.getQueryData(auctionKeys.detail(auctionId));

      // Optimistically update the UI
      queryClient.setQueryData(auctionKeys.detail(auctionId), (old: any) => {
        if (!old) return old;
        return {
          ...old,
          currentPrice: newBid,
          bidCount: (old.bidCount || 0) + 1,
        };
      });

      return { previousAuction };
    },
    // If mutation fails, rollback
    onError: (err, newBid, context) => {
      if (context?.previousAuction) {
        queryClient.setQueryData(
          auctionKeys.detail(auctionId),
          context.previousAuction
        );
      }
    },
    // Always refetch after error or success
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: auctionKeys.detail(auctionId) });
    },
  });
}

/**
 * Hook to buy now
 */
export function useBuyNow() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ auctionId, buyerId }: { auctionId: string; buyerId: string }) =>
      auctionApi.buyNow(auctionId, buyerId),
    onSuccess: (data, variables) => {
      // Invalidate and refetch auction details
      queryClient.invalidateQueries({ queryKey: auctionKeys.detail(variables.auctionId) });
      queryClient.invalidateQueries({ queryKey: auctionKeys.lists() });
    },
  });
}

/**
 * Hook to end auction
 */
export function useEndAuction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (auctionId: string) => auctionApi.endAuction(auctionId),
    onSuccess: (data, auctionId) => {
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: auctionKeys.detail(auctionId) });
      queryClient.invalidateQueries({ queryKey: auctionKeys.lists() });
    },
  });
}
