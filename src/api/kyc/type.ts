export interface KycDocument {
  kycDocumentId: string;
  type: "front_id" | "back_id" | "selfie" | "passport";
  fileUrl?: string; // ⬅️ có thể chưa có URL nếu upload chưa hoàn tất
  status: "pending" | "approved" | "rejected";
  createdAt?: string;
  updatedAt?: string;
}

export interface KycProfile {
  kycProfileId: string;
  userId?: string;
  level: "basic" | "advanced";
  status: "pending" | "approved" | "rejected";
  note?: string;
  documents: KycDocument[];
  createdAt?: string;
  updatedAt?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  statusCode: number;
  message?: string | Record<string, unknown>;
  data?: T;
}