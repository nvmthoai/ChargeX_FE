// ===============================
// 🧾 ORDER TYPES (Fixed version)
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

// 🏠 Tham chiếu địa chỉ
export interface AddressRef {
  addressId: string;
  label: string;
  fullName: string;
  phone: string;
  line1: string;
}

// 👤 Người dùng cơ bản
export interface UserRef {
  userId: string;
  fullName: string;
  email?: string;
  phone?: string;
}

// 📦 Sản phẩm cơ bản (nếu có)
export interface ProductRef {
  id: string;
  title: string;
  description?: string;
  imageUrls: string[];
}


export interface OrderDetail {
  orderDetailId: string;
  price: number;
  quantity?: number;
  subtotal?: number;
  product?: ProductRef;
}

export interface OrderShop {
  orderShopId: string;
  seller?: UserRef;
  shippingFee?: number;
  status?: string;
  orderDetails?: OrderDetail[];
}

// 🧾 Đơn hàng trả về từ API
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

// 🧩 Tạo mới đơn hàng
export interface CreateOrderRequest {
  receiverName: string;
  receiverPhone: string;

  // chỉ cần 1 trong 2 cách sau
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

// ✏️ Cập nhật đơn hàng
export interface UpdateOrderRequest {
  status?: OrderStatus;
  shipping_code?: string;
  shipping_provider?: string;
  contract_url?: string;
}


export interface GetOrdersParams {
  buyerId?: string;
  sellerId?: string;
  status?: OrderStatus;
  page?: number;
  limit?: number;
  sort?: string;
  order?: "ASC" | "DESC";
}
