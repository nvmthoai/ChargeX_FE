export interface Product {
  id: string;
  seller: {
    userId: string;
    fullName: string;
  };
  title: string;
  description: string;
  price_start: string;
  price_buy_now: string;
  price_now: string | null;
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
