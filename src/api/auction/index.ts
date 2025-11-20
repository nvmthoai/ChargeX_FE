import axiosInstance from "../../app/config/axios";

export interface AuctionSummary {
  auctionId: string;
  productId: string;
  title: string;
  status: "scheduled" | "live" | "ended" | "cancelled";
  startTime: string;
  endTime: string;
  currentPrice: number;
  minBidIncrement: number;
  imageUrls?: string[];
  serverNow?: string;
  serverTime?: number;
}

export interface AuctionDetail extends AuctionSummary {
  startingPrice: number;
  buyNowPrice?: number;
  reserveMet: boolean;
  bidCount: number;
  winnerId: string | null;
  sellerId?: string;
  serverNow?: string;
  serverTime?: number;
  product: {
    id: string;
    title: string;
    description: string;
    images?: string[];
    imageUrls?: string[];
    sellerId?: string;
  };
  bidHistory?: Array<{
    bidId: string;
    userId: string;
    userName: string;
    amount: number;
    timestamp: string;
    isWinning: boolean;
  }>;
}

export interface RequestAuctionDto {
  productId: string;
  startingPrice: number;
  reservePrice: number;
  minBidIncrement: number;
  antiSnipingSeconds: number;
  buyNowPrice?: number;
  bidDepositPercent: number;
  note?: string;
}

export interface ApproveAuctionDto {
  auctionRequestId: string;
  startTime: string;
  endTime: string;
}

export interface PaginatedAuctions {
  items: AuctionSummary[];
  meta: {
    total: number;
    page: number;
    pageSize: number;
  };
}

// Consolidated API client for auction endpoints
export const auctionApi = {
  // Seller requests auction
  requestAuction: async (sellerId: string, data: RequestAuctionDto) => {
    const response = await axiosInstance.post(
      `/auction/request/${sellerId}`,
      data
    );
    return response.data;
  },

  // Admin approves auction
  approveAuction: async (adminId: string, data: ApproveAuctionDto) => {
    const response = await axiosInstance.post(
      `/auction/approve/${adminId}`,
      data
    );
    return response.data;
  },

  // Admin denies auction request
  denyAuction: async (auctionRequestId: string, reason?: string) => {
    const response = await axiosInstance.post(`/auction/deny`, {
      auctionRequestId,
      reason,
    });
    return response.data;
  },

  // Make auction go live
  goLive: async (auctionId: string) => {
    const response = await axiosInstance.post(`/auction/${auctionId}/live`);
    return response.data;
  },

  // Buy now
  buyNow: async (auctionId: string, buyerId?: string) => {
    const response = await axiosInstance.post(
      `/auction/${auctionId}/buy-now`,
      {
        buyerId,
      }
    );
    return response.data;
  },

  // End auction
  endAuction: async (auctionId: string) => {
    const response = await axiosInstance.post(`/auction/${auctionId}/end`);
    return response.data;
  },

  // Get auction requests (admin)
  getRequests: async () => {
    const response = await axiosInstance.get(`/auction/requests`);
    return response.data;
  },

  // Get all auction IDs / summaries
  getAllAuctionIds: async () => {
    const response = await axiosInstance.get(`/auction/ids`);
    return response.data;
  },

  // Get joinable auctions with pagination
  getJoinableAuctions: async (
    status?: string,
    page: number = 1,
    pageSize: number = 50
  ): Promise<PaginatedAuctions> => {
    const params = new URLSearchParams();
    if (status) params.append("status", status);
    params.append("page", page.toString());
    params.append("pageSize", pageSize.toString());

    const url = `/auction/joinable?${params.toString()}`;
    console.log("🔗 [API] Requesting URL:", url);

    try {
      const response = await axiosInstance.get(url);

      console.log("📦 [API] Full response:", response);
      console.log("📊 [API] Response status:", response.status);
      console.log("📋 [API] Response headers:", response.headers);
      console.log("📄 [API] Response data:", response.data);
      console.log("🔍 [API] Data type:", typeof response.data);
      console.log("🗂️ [API] Data keys:", response.data ? Object.keys(response.data) : null);

      // Handle case where API returns empty response or null
      if (!response.data) {
        console.warn("⚠️ [API] Empty response data, returning default structure");
        return {
          items: [],
          meta: {
            total: 0,
            page: page,
            pageSize: pageSize
          }
        };
      }

      // Handle case where API doesn't return expected structure
      if (!response.data.items && !response.data.meta) {
        console.warn("⚠️ [API] Unexpected response structure, attempting to adapt:", response.data);

        // Check if response.data has a nested data property (NestJS standard response)
        if (response.data.data && typeof response.data.data === 'object') {
          console.log("✅ [API] Found nested data property, extracting...");
          const nestedData = response.data.data;

          if (nestedData.items && Array.isArray(nestedData.items)) {
            return nestedData;
          }

          // If nested data is an array, assume it's the items
          if (Array.isArray(nestedData)) {
            return {
              items: nestedData,
              meta: {
                total: nestedData.length,
                page: page,
                pageSize: pageSize
              }
            };
          }
        }

        // If response.data is an array, assume it's the items array
        if (Array.isArray(response.data)) {
          return {
            items: response.data,
            meta: {
              total: response.data.length,
              page: page,
              pageSize: pageSize
            }
          };
        }

        // If response.data has a different structure, log it and use mock data
        console.warn("⚠️ [API] Cannot adapt response structure, using mock data");

        // Return mock data for development
        const mockItems = [
          {
            auctionId: "mock-auction-1",
            productId: "mock-product-1",
            title: "Tesla Battery 100kWh - Mock Data (No Real Auctions)",
            status: "live" as const,
            startTime: new Date(Date.now() - 3600000).toISOString(),
            endTime: new Date(Date.now() + 7200000).toISOString(),
            currentPrice: 50000000,
            minBidIncrement: 1000000
          },
          {
            auctionId: "mock-auction-2",
            productId: "mock-product-2",
            title: "BMW Battery 80kWh - Mock Data (No Real Auctions)",
            status: "scheduled" as const,
            startTime: new Date(Date.now() + 3600000).toISOString(),
            endTime: new Date(Date.now() + 10800000).toISOString(),
            currentPrice: 40000000,
            minBidIncrement: 500000
          }
        ];

        return {
          items: mockItems,
          meta: {
            total: mockItems.length,
            page: page,
            pageSize: pageSize
          }
        };
      }

      return response.data;

    } catch (error: unknown) {
      console.error("❌ [API] Request failed:", error);

      // If 401 Unauthorized or other auth errors, return mock data for development
      const isAxiosError = error && typeof error === 'object' && 'response' in error;
      if (isAxiosError) {
        const axiosError = error as { response: { status: number } };
        if (axiosError.response?.status === 401 || axiosError.response?.status === 403) {
          console.warn("⚠️ [API] Authentication required, using mock data for development");

          // Generate mock auction data
          const allMockItems = [
            {
              auctionId: "mock-auction-1",
              productId: "mock-product-1",
              title: "Tesla Battery 100kWh - Mock Data",
              status: "live" as const,
              startTime: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
              endTime: new Date(Date.now() + 7200000).toISOString(), // 2 hours from now
              currentPrice: 50000000,
              minBidIncrement: 1000000
            },
            {
              auctionId: "mock-auction-2",
              productId: "mock-product-2",
              title: "BMW Battery 80kWh - Mock Data",
              status: "scheduled" as const,
              startTime: new Date(Date.now() + 3600000).toISOString(), // 1 hour from now
              endTime: new Date(Date.now() + 10800000).toISOString(), // 3 hours from now
              currentPrice: 40000000,
              minBidIncrement: 500000
            },
            {
              auctionId: "mock-auction-3",
              productId: "mock-product-3",
              title: "Audi e-tron Battery 95kWh - Mock Data",
              status: "live" as const,
              startTime: new Date(Date.now() - 1800000).toISOString(), // 30 min ago
              endTime: new Date(Date.now() + 5400000).toISOString(), // 1.5 hours from now
              currentPrice: 60000000,
              minBidIncrement: 2000000
            }
          ];

          const mockItems = allMockItems.filter(item => !status || item.status === status);

          return {
            items: mockItems.slice(0, pageSize),
            meta: {
              total: mockItems.length,
              page: page,
              pageSize: pageSize
            }
          };
        }
      }

      // Re-throw other errors
      throw error;
    }
  },

  // Get auction by ID
  getAuctionById: async (auctionId: string): Promise<AuctionDetail> => {
    try {
      const response = await axiosInstance.get(`/auction/${auctionId}`);
      console.log("📦 [API] getAuctionById raw response:", response.data);

      // Unwrap NestJS response format: {success, statusCode, data}
      let auctionData = response.data;
      if (auctionData && typeof auctionData === 'object') {
        if ('data' in auctionData && 'success' in auctionData) {
          console.log("✅ [API] Unwrapping nested data structure");
          auctionData = auctionData.data;
        }
      }

      console.log("📦 [API] getAuctionById parsed data:", auctionData);
      return auctionData;
    } catch (error: unknown) {
      console.error("❌ [API] getAuctionById failed:", error);

      // Return mock data if API fails
      const isAxiosError = error && typeof error === 'object' && 'response' in error;
      if (isAxiosError) {
        const axiosError = error as { response: { status: number } };
        if (axiosError.response?.status === 401 || axiosError.response?.status === 403 || axiosError.response?.status === 404) {
          console.warn("⚠️ [API] Using mock auction detail for development");

          return {
            auctionId: auctionId,
            productId: `product-${auctionId}`,
            title: "Mock Auction - Tesla Battery 100kWh",
            status: "live",
            startTime: new Date(Date.now() - 3600000).toISOString(),
            endTime: new Date(Date.now() + 7200000).toISOString(),
            currentPrice: 50000000,
            minBidIncrement: 1000000,
            startingPrice: 45000000,
            buyNowPrice: 80000000,
            reserveMet: true,
            bidCount: 15,
            winnerId: null,
            product: {
              id: `product-${auctionId}`,
              title: "Mock Tesla Battery 100kWh",
              description: "High quality Tesla battery in excellent condition - Mock Data",
              images: []
            }
          };
        }
      }

      throw error;
    }
  },

  // Get auctions the user won
  getUserWonAuctions: async (userId: string, page: number = 1, pageSize: number = 20) => {
    const params = new URLSearchParams();
    params.append('page', page.toString());
    params.append('pageSize', pageSize.toString());
    const response = await axiosInstance.get(`/auction/user/${userId}/won-auctions?${params.toString()}`);
    return response.data;
  },

  // Get auctions the user is participating in (live or scheduled)
  getUserParticipatingAuctions: async (userId: string, page: number = 1, pageSize: number = 20) => {
    const params = new URLSearchParams();
    params.append('page', page.toString());
    params.append('pageSize', pageSize.toString());
    const response = await axiosInstance.get(`/auction/user/${userId}/participating-auctions?${params.toString()}`);
    return response.data;
  },

  // Get user's complete auction history (won and lost)
  getUserAuctionHistory: async (userId: string, page: number = 1, pageSize: number = 20, status?: string) => {
    const params = new URLSearchParams();
    params.append('page', page.toString());
    params.append('pageSize', pageSize.toString());
    if (status) params.append('status', status);
    const url = `/auction/user/${userId}/auction-history?${params.toString()}`;
    const response = await axiosInstance.get(url);
    return response.data;
  },

  // Get auctions for seller (management view)
  getSellerAuctions: async (sellerId: string, page: number = 1, pageSize: number = 20) => {
    const params = new URLSearchParams();
    params.append('page', page.toString());
    params.append('pageSize', pageSize.toString());
    const url = `/auction/seller/${sellerId}/managed?${params.toString()}`;
    const response = await axiosInstance.get(url);
    return response.data;
  },

  // Get auctions won by user with payment information
  getWonAuctionsWithPayments: async (userId: string, page: number = 1, pageSize: number = 20) => {
    const params = new URLSearchParams();
    params.append('page', page.toString());
    params.append('pageSize', pageSize.toString());
    const response = await axiosInstance.get(`/auction/user/${userId}/won-auctions-with-payments?${params.toString()}`);
    return response.data;
  },

  // Get order created for ended auction
  getOrderByAuctionId: async (auctionId: string) => {
    const response = await axiosInstance.get(`/auction/${auctionId}/order`);
    let data = response.data;
    if (data && typeof data === 'object' && 'data' in data && 'success' in data) data = data.data;
    return data;
  },

  // Seller accepts an ended auction that didn't meet reserve (create order)
  sellerAccept: async (auctionId: string, sellerId?: string) => {
    const body = sellerId ? { sellerId } : {}
    const response = await axiosInstance.post(`/auction/${auctionId}/seller-accept`, body)
    return response.data
  },

  // Debug endpoint - check auction and order status
  getAuctionDebug: async (auctionId: string) => {
    const response = await axiosInstance.get(`/auction/${auctionId}/debug`);
    let data = response.data;
    if (data && typeof data === 'object' && 'data' in data && 'success' in data) data = data.data;
    return data;
  }
}
