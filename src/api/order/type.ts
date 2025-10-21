export enum OrderStatus {
  PENDING = "pending",
  PAID = "paid",
  SHIPPING = "shipping",
  COMPLETED = "completed",
  CANCELLED = "cancelled",
}

export interface Order {
  order_id: string;
  buyer_id: string;
  seller_id: string;
  product_id: string;
  price: number;
  shipping_fees: number;
  shipping_provider?: string;
  shipping_code?: string;
  contract_pdf?: string;
  pickup_address_id?: string;
  delivery_address_id?: string;
  status: OrderStatus;
  created_at?: string;
  updated_at?: string;
}


export interface CreateOrderRequest {
  buyer_id: string;
  seller_id: string;
  price: number;
  shipping_fee: number;
  productId: string;
  shipping_provider?: string;
  shipping_code?: string;
  contract_url?: string;
  pickup_address_id: string;
  delivery_address_id: string;
  status?: OrderStatus; // default: pending
}

export interface UpdateOrderRequest {
  status?: OrderStatus;
  shipping_code?: string;
  shipping_provider?: string;
  contract_pdf?: string;
}
