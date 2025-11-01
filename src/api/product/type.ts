export interface Address {
  addressId: string;
  fullName: string;
  phone: string;
  line1: string;
  districtId: number;
  provinceId: number;
  wardCode: string;
  label: string;
  isDefault: boolean;
  note: string | null;
  createdAt: string;
}

export interface Seller {
  userId: string;
  fullName: string;
  defaultAddress: Address;
}

export interface Product {
  id: string;
  seller: Seller;
  title: string;
  description: string;
  price_start: number;
  price_buy_now: number;
  price_now: number | null;
  status: string;

  imageUrls: string[];
  soh_percent: number | null;
  cycle_count: number | null;
  nominal_voltage_v: number | null;
  condition_grade: string | null;
  weight_kg: number | null;
  dimension: string | null;
  is_auction: boolean;
  createdAt: string;
  end_time: string | null;
}

export interface ProductListResponse {
  data: Product[];
  total: number;
  page: number;
  limit: number;
}