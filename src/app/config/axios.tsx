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
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore - axios types allow headers assignment
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    // centralize error handling
    try {
      console.error("axios error:", error?.message ?? error);

      const token = localStorage.getItem("token");

      if (error?.response) {
        const { status, data, config } = error.response;
        const statusCode = Number(status);

        // Consider requests under /auth as login-related
        const requestUrl = String(config?.url ?? "").toLowerCase();
        const isLoginRequest = requestUrl.includes("/auth/login") || requestUrl.includes("/auth/register") || requestUrl === "/auth" || requestUrl.includes("/auth");
        const isAuthError = statusCode === 401 || statusCode === 403;

        // Detect common token-expired messages
        const tokenExpiredMessages = [
          "jwt expired",
          "token expired",
          "unauthorized",
          "invalid token",
          "jwt malformed"
        ];

        let isTokenExpired = false;
        if (isAuthError && token && !isLoginRequest) {
          const rawMsg = (data?.message && (typeof data.message === "string" ? data.message : data.message?.message)) || data?.error || "";
          const msg = String(rawMsg).toLowerCase();
          if (tokenExpiredMessages.some((m) => msg.includes(m)) || statusCode === 401) {
            isTokenExpired = true;
          }
        }

        if (isTokenExpired && !isRedirecting) {
          isRedirecting = true;
          toast.error("Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại!");

          // Clear storage and redirect to auth with next param
          try {
            localStorage.clear();
            const next = encodeURIComponent(window.location.pathname + window.location.search);
            const redirectTo = `/auth${next ? `?next=${next}` : ""}`;
            setTimeout(() => {
              window.location.href = redirectTo;
            }, 500);
          } catch (e) {
            try {
              window.location.href = "/auth";
            } catch {}
          }

          // reset redirect flag shortly after
          setTimeout(() => {
            isRedirecting = false;
          }, 1000);

          return Promise.reject(error);
        }

        // Non-auth errors: show friendly message if available
        const extractMessage = (d: any) => {
          if (!d) return null;
          if (typeof d === "string") return d;
          if (typeof d.message === "string") return d.message;
          if (typeof d.message?.message === "string") return d.message.message;
          if (typeof d.error === "string") return d.error;
          return null;
        };

        const userMessage = extractMessage(data);
        if (userMessage) {
          toast.error(String(userMessage));
        } else if (statusCode >= 500) {
          toast.error("Đã có lỗi xảy ra trên server. Vui lòng thử lại sau.");
        }
      }
    } catch (handlerErr) {
      console.error("Error in axios interceptor handler", handlerErr);
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
