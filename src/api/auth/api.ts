import axiosInstance from "../../app/config/axios";

export interface RegisterData {
  email: string;
  password: string;
  fullName: string;
  phone: string;
}

export interface LoginData {
  email: string;
  password: string;
  deviceInfo: string;
}

export interface VerifyOtpData {
  email: string;
  otp: string;
}

export interface AuthResponse {
  accessToken: string;
  user?: any;
}

export const authApi = {
  register: async (data: RegisterData) => {
    const response = await axiosInstance.post("/auth/register", data);
    return response.data;
  },

  login: async (data: LoginData) => {
    const response = await axiosInstance.post("/auth/login", data);
    return response.data;
  },

  verifyOtp: async (data: VerifyOtpData) => {
    const response = await axiosInstance.post("/auth/verify-otp", data);
    return response.data;
  },

  resendOtp: async (data: { email: string }) => {
    const response = await axiosInstance.post("/auth/resend-otp", data);
    return response.data;
  },
};




