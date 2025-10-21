export interface KycDocument {
  kycDocumentId: string;
  type: string;
  fileUrl: string;
  status: "pending" | "approved" | "rejected";
  createdAt?: string;
  updatedAt?: string;
}

export interface KycProfile {
  kycProfileId: string;
  userId?: string;
  level:string;
  status: string;
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