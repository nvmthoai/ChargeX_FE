
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