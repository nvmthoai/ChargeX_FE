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

export enum PaymentMethod {
  PAYOS = "payos",
  WALLET = "wallet",
}

export interface Payment {
  paymentId: string;           // 🟩 UUID
  orderId?: string;            // 🆕 nếu backend có liên kết tới order
  provider: PaymentProvider;
  method: PaymentMethod;              // e.g., "bank" | "wallet"
  status: PaymentStatus;
  amount: number;
  description?: string;
  checkoutUrl?: string;        // URL từ PayOS để redirect
  transactionId?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreatePaymentRequest {
  type: "pay_order";           // ✔ theo Swagger
  amount: number;
  description?: string;
  related_order_id: string;    // ⚠️ Sửa từ number → string (backend dùng UUID!)
  related_bid_id?: string;
  provider: PaymentProvider;   // "payos" | "wallet"
  method?: string;             // "bank" | "wallet"
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
