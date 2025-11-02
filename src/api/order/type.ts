export enum OrderStatus {
  PENDING = "pending",
  PAID = "paid",
  HANDED_TO_CARRIER = "handed_to_carrier",
  IN_TRANSIT = "in_transit",
  DELIVERED_PENDING_CONFIRM = "delivered_pending_confirm",
  DELIVERED = "delivered",
  REFUNDED = "refunded",
  COMPLETED = "completed",
  DISPUTED = "disputed",
  CANCELLED = "cancelled",
}

export interface AddressRef {
  addressId: string;
  label: string;
  fullName: string;
  phone: string;
  line1: string;
}

export interface UserRef {
  userId: string;
  fullName: string;
  email?: string;
  phone?: string;
}

export interface ProductRef {
  id: string;
  title: string;
  description?: string;
  imageUrls: string[];
}

export interface Order {
  orderId: string;
  buyer: UserRef;                     // 🟩 object
  seller: UserRef;                    // 🟩 object
  product: ProductRef;                // 🟩 object
  price: number;
  shipping_fee: number;               // 🟩 đúng với backend
  shipping_provider?: string;
  shipping_code?: string;
  contract_url?: string;              // 🟩 sửa đúng
  pickupAddress?: AddressRef;         // 🟩 object
  deliveryAddress?: AddressRef;       // 🟩 object
  status: OrderStatus;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateOrderRequest {
  buyer_id: string;
  seller_id: string;
  productId: string;
  price: number;
  shipping_fee: number;               // 🟩 rename lại cho đúng API
  shipping_provider?: string;
  shipping_code?: string;
  contract_url?: string;
  pickup_address_id: string;
  delivery_address_id: string;
  status?: OrderStatus;               // default: pending
}

export interface UpdateOrderRequest {
  status?: OrderStatus;
  shipping_code?: string;
  shipping_provider?: string;
  contract_url?: string;              // 🟩 đồng bộ tên
}
