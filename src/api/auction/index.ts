import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export interface AuctionSummary {
  auctionId: string;
  productId: string;
  title: string;
  status: 'scheduled' | 'live' | 'ended' | 'cancelled';
  startTime: string;
  endTime: string;
  currentPrice: number;
  minBidIncrement: number;
}

export interface AuctionDetail extends AuctionSummary {
  startingPrice: number;
  buyNowPrice?: number;
  reserveMet: boolean;
  bidCount: number;
  winnerId: string | null;
  product: {
    id: string;
    title: string;
    description: string;
    images: string[];
  };
}

export interface RequestAuctionDto {
  productId: string;
  note?: string;
}

export interface ApproveAuctionDto {
  auctionRequestId: string;
  startTime: string;
  endTime: string;
  startingPrice: number;
  buyNowPrice?: number;
  minBidIncrement: number;
}

export interface PaginatedAuctions {
  items: AuctionSummary[];
  meta: {
    total: number;
    page: number;
    pageSize: number;
  };
}

// API Functions
export const auctionApi = {
  // Seller requests auction
  requestAuction: async (sellerId: string, data: RequestAuctionDto) => {
    const response = await axios.post(`${API_URL}/auction/request/${sellerId}`, data);
    return response.data;
  },

  // Admin approves auction
  approveAuction: async (adminId: string, data: ApproveAuctionDto) => {
    const response = await axios.post(`${API_URL}/auction/approve/${adminId}`, data);
    return response.data;
  },

  // Admin denies auction request
  denyAuction: async (auctionRequestId: string, reason?: string) => {
    const response = await axios.post(`${API_URL}/auction/deny`, {
      auctionRequestId,
      reason,
    });
    return response.data;
  },

  // Make auction go live
  goLive: async (auctionId: string) => {
    const response = await axios.post(`${API_URL}/auction/${auctionId}/live`);
    return response.data;
  },

  // Buy now
  buyNow: async (auctionId: string, buyerId?: string) => {
    const response = await axios.post(`${API_URL}/auction/${auctionId}/buy-now`, {
      buyerId,
    });
    return response.data;
  },

  // End auction
  endAuction: async (auctionId: string) => {
    const response = await axios.post(`${API_URL}/auction/${auctionId}/end`);
    return response.data;
  },

  // Get auction requests (admin)
  getRequests: async () => {
    const response = await axios.get(`${API_URL}/auction/requests`);
    return response.data;
  },

  // Get all auction IDs
  getAllAuctionIds: async () => {
    const response = await axios.get(`${API_URL}/auction/ids`);
    return response.data;
  },

  // Get joinable auctions with pagination
  getJoinableAuctions: async (
    status?: string,
    page: number = 1,
    pageSize: number = 50
  ): Promise<PaginatedAuctions> => {
    const params = new URLSearchParams();
    if (status) params.append('status', status);
    params.append('page', page.toString());
    params.append('pageSize', pageSize.toString());

    const response = await axios.get(`${API_URL}/auction/joinable?${params.toString()}`);
    return response.data;
  },

  // Get auction by ID
  getAuctionById: async (auctionId: string): Promise<AuctionDetail> => {
    const response = await axios.get(`${API_URL}/auction/${auctionId}`);
    return response.data;
  },
};
