export interface Notification {
  id: string;
  userId: string;
  type: 'auction_won' | 'auction_lost' | 'auction_success' | 'auction_failed' | 'bid_outbid' | 'order_paid';
  title: string;
  message: string;
  data?: {
    auctionId?: string;
    orderId?: string;
    productId?: string;
    finalPrice?: number;
    [key: string]: unknown;
  };
  isRead: boolean;
  createdAt: string;
}
