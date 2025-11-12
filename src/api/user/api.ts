import axiosInstance from "../../app/config/axios";

export interface UserProfile {
  userId: string;
  email: string;
  fullName?: string;
  phone?: string;
  image?: string;
  createdAt?: string;
}

export const userApi = {
  // Get user by ID
  getUserById: async (userId: string): Promise<UserProfile | null> => {
    try {
      const response = await axiosInstance.get(`/users/${userId}`);
      console.log("📦 [API] getUserById response:", response.data);
      
      // Unwrap NestJS response format if needed
      let userData = response.data;
      if (userData && typeof userData === 'object') {
        if ('data' in userData && 'success' in userData) {
          userData = userData.data;
        }
      }
      
      return userData;
    } catch (error) {
      console.error("❌ [API] getUserById failed:", error);
      // Return null if failed (axios interceptor will handle redirect if token expired)
      // This allows UI to show fallback name instead of crashing
      return null;
    }
  },

  // Get current user detail
  getUserDetail: async () => {
    const response = await axiosInstance.get(`/users/me`);
    return response.data;
  },

  // Get shop detail by seller ID
  getShopDetail: async (sellerId: string) => {
    const response = await axiosInstance.get(`/users/seller/${sellerId}`);
    return response.data;
  },

  // Upload avatar
  uploadAvatar: async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    const response = await axiosInstance.patch(`/users/upload-image`, formData);
    return response.data;
  },

  // Update profile
  updateProfile: async (data: any) => {
    const response = await axiosInstance.patch(`/users/profile`, data);
    return response.data;
  },
};
