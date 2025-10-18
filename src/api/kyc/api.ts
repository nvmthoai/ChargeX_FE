import axiosInstance from "../../app/config/axios";
import type { ApiResponse, KycDocument, KycProfile } from "./type";
import axios from "axios";

export const getKycProfileById = async (userId: string): Promise<ApiResponse<KycProfile>> => {
  try {
    const response = await axiosInstance.get<ApiResponse<KycProfile>>(`/kyc-profiles/${userId}/user`);
    console.log("✅ KYC profile detail:", response.data);
    return response.data;
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      return (error.response?.data ?? {
        success: false,
        statusCode: error.response?.status ?? 500,
        message: "Axios error: failed to get KYC profile",
      }) as ApiResponse<KycProfile>;
    }
    throw new Error("Unknown error when fetching KYC profile");
  }
};


export const postKycProfile = async (
  data: Pick<KycProfile, "level" | "note">
): Promise<ApiResponse<KycProfile>> => {
  try {
    const response = await axiosInstance.post<ApiResponse<KycProfile>>(`/kyc-profiles`, data);
    console.log("✅ Created KYC profile:", response.data);
    return response.data;
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      return (error.response?.data ?? {
        success: false,
        statusCode: error.response?.status ?? 500,
        message: "Axios error: failed to create KYC profile",
      }) as ApiResponse<KycProfile>;
    }
    throw new Error("Unknown error when creating KYC profile");
  }
};


export const uploadKycDocument = async (
  profileId: string,
  data: Pick<KycDocument, "type" | "fileUrl">
): Promise<ApiResponse<KycDocument>> => {
  try {
    const response = await axiosInstance.post<ApiResponse<KycDocument>>(
      `/kyc-profiles/${profileId}/documents`,
      data
    );
    console.log("✅ Uploaded KYC document:", response.data);
    return response.data;
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      return (error.response?.data ?? {
        success: false,
        statusCode: error.response?.status ?? 500,
        message: "Axios error: failed to upload KYC document",
      }) as ApiResponse<KycDocument>;
    }
    throw new Error("Unknown error when uploading KYC document");
  }
};


export const updateKycProfileStatus = async (
  profileId: string,
  data: Pick<KycProfile, "status" | "note">
): Promise<ApiResponse<KycProfile>> => {
  try {
    const response = await axiosInstance.patch<ApiResponse<KycProfile>>(
      `/kyc-profiles/${profileId}`,
      data
    );
    console.log("✅ Updated KYC profile status:", response.data);
    return response.data;
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      return (error.response?.data ?? {
        success: false,
        statusCode: error.response?.status ?? 500,
        message: "Axios error: failed to update KYC profile status",
      }) as ApiResponse<KycProfile>;
    }
    throw new Error("Unknown error when updating KYC profile status");
  }
};


export const getAllKycProfiles = async (
  status?: KycProfile["status"]
): Promise<ApiResponse<KycProfile[]>> => {
  try {
    const url = status ? `/kyc-profiles?status=${status}` : `/kyc-profiles`;
    const response = await axiosInstance.get<ApiResponse<KycProfile[]>>(url);
    console.log("✅ All KYC profiles:", response.data);
    return response.data;
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      return (error.response?.data ?? {
        success: false,
        statusCode: error.response?.status ?? 500,
        message: "Axios error: failed to fetch KYC profiles",
      }) as ApiResponse<KycProfile[]>;
    }
    throw new Error("Unknown error when fetching KYC profiles");
  }
};
