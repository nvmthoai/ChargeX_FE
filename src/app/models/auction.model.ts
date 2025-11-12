export interface AuctionRequest {
  id: string
  productId: string
  sellerId: string
  note: string
  status: "pending" | "approved" | "rejected"
  reviewedBy: string | null
  requestedAt: string
  reviewedAt: string | null
}

export interface ApproveAuctionPayload {
  auctionRequestId: string
  startTime: string
  endTime: string
  startingPrice?: number
  reservePrice: number
  minBidIncrement: number
  antiSnipingSeconds: number
  bidDepositPercent: number
}

export interface GetAuctionRequestsResponse {
  data: AuctionRequest[]
  total: number
  page: number
  limit: number
}
