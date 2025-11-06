// ===============================
// 🧾 ORDER TYPES (Final version)
// ===============================

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

// 🏠 Địa chỉ
export interface AddressRef {
  addressId: string;
  label: string;
  fullName: string;
  phone: string;
  line1: string;
}

// 👤 Người dùng
export interface UserRef {
  userId: string;
  fullName: string;
  email?: string;
  phone?: string;
}

// 📦 Sản phẩm
export interface ProductRef {
  id: string;
  title: string;
  description?: string;
  imageUrls: string[];
}

// 💰 Chi tiết sản phẩm trong đơn hàng
export interface OrderDetail {
  orderDetailId: string;
  price: number;
  quantity?: number;
  subtotal?: number;
  product?: ProductRef;
}

// 🏪 Cửa hàng trong đơn hàng (multi-seller)
export interface OrderShop {
  orderShopId: string;
  seller?: UserRef;
  shippingFee?: number;
  status?: string;
  orderDetails?: OrderDetail[];
}

// 🧾 Đơn hàng chính
export interface Order {
  orderId: string;
  buyer?: UserRef;
  seller?: UserRef;
  product?: ProductRef;
  orderShops?: OrderShop[];

  receiverAddressRef?: AddressRef;
  receiverName?: string;
  receiverPhone?: string;

  totalPrice: number;
  totalShippingFee: number;
  grandTotal?: number;
  status: OrderStatus;

  shipping_provider?: string;
  shipping_code?: string;
  contract_url?: string;

  pickupAddress?: AddressRef;
  deliveryAddress?: AddressRef;

  createdAt?: string;
  updatedAt?: string;
}

// 🟩 Tạo đơn hàng
export interface CreateOrderRequest {
  receiverName: string;
  receiverPhone: string;
  receiverAddress?: string;
  receiverDistrictId?: number;
  receiverWardCode?: string;
  receiverAddressId?: string;

  orderShops: {
    sellerId: string;
    shippingProvider: string;
    fromAddressId: string;
    orderDetails: {
      productId: string;
      quantity: number;
      price: number;
      subtotal: number;
    }[];
  }[];
}

// 🟨 Cập nhật đơn hàng
export interface UpdateOrderRequest {
  status?: OrderStatus;
  shipping_code?: string;
  shipping_provider?: string;
  contract_url?: string;
  eventNote?: string;
}

// 🧭 Tham số truy vấn danh sách
export interface GetOrdersParams {
  buyerId?: string;
  sellerId?: string;
  status?: OrderStatus;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "ASC" | "DESC";
}
