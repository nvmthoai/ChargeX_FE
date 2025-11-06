import axios from "axios";
import ENV from "./env";
import { toast } from "react-toastify";

// Global flag to prevent multiple redirects
let isRedirecting = false;

const axiosInstance = axios.create({
  baseURL: ENV.BASE_URL,
});

axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    console.log('err: ', error);
    
    if (error.response) {
      const { status, data, config } = error.response;
      const statusCode = status;
      const isLoginRequest = config?.url?.includes("/auth/login");
      const isAuthError = statusCode === 401 || statusCode === 403;
      const token = localStorage.getItem("token");

      // Check if token is expired based on error message or status
      const tokenExpiredMessages = [
        'jwt expired',
        'token expired',
        'unauthorized',
        'invalid token',
        'jwt malformed'
      ];
      
      const isTokenExpired = 
        isAuthError && 
        token && 
        !isLoginRequest &&
        (
          tokenExpiredMessages.some(msg => 
            data?.message?.toLowerCase()?.includes(msg) ||
            data?.message?.message?.toLowerCase()?.includes(msg)
          ) ||
          statusCode === 401
        );

      // Handle token expiration - redirect to login
      if (isTokenExpired && !isRedirecting) {
        isRedirecting = true;
        toast.error("Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại!");
        
        // Clear storage
        localStorage.clear();
        
        // Redirect to login page
        setTimeout(() => {
          try {
            const next = encodeURIComponent(window.location.pathname + window.location.search);
            window.location.href = `/auth${next ? `?next=${next}` : ""}`;
          } catch {
            window.location.href = "/auth";
          }
          
          // Reset flag after redirect
          setTimeout(() => {
            isRedirecting = false;
          }, 1000);
        }, 500);
        
        return Promise.reject(error);
      }

      // Show error messages for other cases
      console.log('data.message: ', data?.message);
      if ((statusCode === 400 || statusCode === 401) && data?.message && !isTokenExpired) {
        const message = data.message.message || data.message;
        toast.error(message);
      } else if (data?.message && !isTokenExpired) {
        const message = data.message.message || data.message;
        toast.error(message as string);
      }
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
