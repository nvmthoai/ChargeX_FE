export interface AuctionRequest {
  id: string
  productId: string
  sellerId: string
  startingPrice: number
  reservePrice: number
  minBidIncrement: number
  antiSnipingSeconds: number
  buyNowPrice?: number
  bidDepositPercent: number
  note?: string
  status: "pending" | "approved" | "rejected"
  reviewedBy?: string
  requestedAt: string
  reviewedAt?: string
}

export interface ApproveAuctionPayload {
  auctionRequestId: string
  startTime: string
  endTime: string
}

export interface GetAuctionRequestsResponse {
  data: AuctionRequest[]
  total: number
  page: number
  limit: number
}
