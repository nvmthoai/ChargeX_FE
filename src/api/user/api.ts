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
};
