export interface UserDetail {
  user: {
    userId: string;
    fullName: string;
    email: string;
    phone: string;
    role: string;
    emailVerified: boolean;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
  };
  wallet: {
    balance: string;
    id: string;
  };
  addresses: Array<{
    addressId: string;
    label: string;
    fullName: string;
    phone: string;
    line1: string;
    wardCode: string;
    districtId: number;
    provinceId: number;
    note?: string;
    isDefault?: boolean;
    createdAt: string;
    updatedAt: string;
  }>;
}

export interface ShopDetail {
  seller: {
    userId: string;
    fullName: string;
    email: string;
    phone: string;
    image: string | null;
    createdAt: string;
  };
  addresses: Array<{
    addressId: string;
    label: string;
    fullName: string;
    phone: string;
    line1: string;
    wardCode: string;
    districtId: number;
    provinceId: number;
    note?: string | null;
    isDefault: boolean;
  }>;
  products: Array<{
    id: string;
    title: string;
    description: string;
    priceStart: string;
    priceBuyNow: string;
    priceNow: string | null;
    status: string;
    imageUrls: string[] | null;
    sohPercent: number;
    cycleCount: number;
    nominalVoltageV: number;
    weightKg: number;
    conditionGrade: string;
    dimension: string;
    isAuction: boolean;
    endTime: string | null;
    createdAt: string;
  }>;
  reviews: any[];
  stats: {
    totalProducts: number;
    totalReviews: number;
    averageRating: number;
  };
}
