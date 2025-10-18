

export enum PaymentStatus {
  PENDING = "pending",
  COMPLETED = "completed",
  FAILED = "failed",
  CANCELLED = "cancelled",
}

export enum PaymentProvider {
  PAYOS = "payos",
  WALLET = "wallet",
}

export interface Payment {
  paymentId: string;
  method: string; // e.g., "wallet|payos"
  status: PaymentStatus;
  checkoutUrl?: string;
  transactionId?: string;
  amount?: number;
  description?: string;
  createdAt?: string;
  updatedAt?: string;
}


export interface CreatePaymentRequest {
  type: string; // "pay_order"
  amount: number;
  description?: string;
  related_order_id: number;
  related_bid_id?: number;
  provider: PaymentProvider; // "payos" | "wallet"
  returnUrl: string;
  cancelUrl: string;
  webhookUrl?: string;
}

export interface UpdatePaymentRequest {
  status?: PaymentStatus;
  description?: string;
}

export interface PayosWebhookPayload {
  code: string;
  desc?: string;
  data?: any;
}
