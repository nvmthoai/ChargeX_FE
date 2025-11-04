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
  buyer: UserRef;                     
  seller: UserRef;                    
  product: ProductRef;                
  price: number;
  shipping_fee: number;               
  shipping_provider?: string;
  shipping_code?: string;
  contract_url?: string;             
  pickupAddress?: AddressRef;
  deliveryAddress?: AddressRef;
  status: OrderStatus;
  createdAt?: string;
  updatedAt?: string;
}

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



export interface UpdateOrderRequest {
  status?: OrderStatus;
  shipping_code?: string;
  shipping_provider?: string;
  contract_url?: string;              // 🟩 đồng bộ tên
}
