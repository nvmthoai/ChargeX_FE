interface User {
  userId: string;
  email: string;
  phone: string;
  image: string | null;
  fullName: string;
  role: string;
  otp: string | null;
  expiresAt: string | null;
  emailVerified: boolean;
  isActive: boolean;
  isDelete: boolean;
  createdAt: string;
  updatedAt: string;
}

interface Address {
  addressId: string;
  label: string;
  fullName: string;
  phone: string;
  line1: string;
  wardCode: string;
  districtId: number;
  provinceId: number;
  note: string;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

interface Product {
  id: string;
  seller_id: string;
  title: string;
  description: string;
  price_start: string;
  price_buy_now: string;
  price_now: string | null;
  status: string;
  imageUrls: string[] | null;
  soh_percent: number | null;
  cycle_count: number | null;
  nominal_voltage_v: number | null;
  weight_kg: number | null;
  length: number | null;
  width: number | null;
  height: number | null;
  condition_grade: string | null;
  dimension: string | null;
  is_auction: boolean;
  end_time: string | null;
  createdAt: string;
  updatedAt: string;
}

interface OrderDetail {
  orderDetailId: string;
  product: Product;
  quantity: number;
  price: string;
  subtotal: string;
  createdAt: string;
}

export interface OrderShop {
  orderShopId: string;
  seller: User;
  orderDetails: OrderDetail[];
  ghnOrderCode: string;
  shippingProvider: string;
  shippingCode: string | null;
  shippingStatus: string | null;
  shippingLabelUrl: string | null;
  shippingFee: string;
  serviceTypeId: number | null;
  paymentTypeId: number | null;
  requiredNote: string | null;
  fromAddress: Address;
  fromDistrictId: number | null;
  fromWardCode: string | null;
  toName: string | null;
  toPhone: string | null;
  toAddressText: string | null;
  toDistrictId: number | null;
  toWardCode: string | null;
  weight: number;
  length: number;
  width: number;
  height: number;
  subtotal: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface Order {
  orderId: string;
  buyer: User;
  orderShops: OrderShop[];
  receiverName: string;
  receiverPhone: string;
  receiverAddress: string | null;
  receiverDistrictId: number | null;
  receiverWardCode: string | null;
  receiverAddressRef: Address;
  totalPrice: string;
  totalShippingFee: string;
  grandTotal: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

