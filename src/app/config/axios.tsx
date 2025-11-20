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
          // Token expired — do not show toast to avoid duplicate toasts across many failed requests
          // Redirect will occur below.

          // Clear storage and redirect to auth with next param
          try {
            localStorage.clear();
            const next = encodeURIComponent(window.location.pathname + window.location.search);
            const redirectTo = `/auth${next ? `?next=${next}` : ""}`;
            setTimeout(() => {
              window.location.href = redirectTo;
            }, 500);
          } catch {
            // Fallback redirect if clearing storage or building redirect fails
            try {
              window.location.href = "/auth";
            } catch (err) {
              // log fallback failure and continue — nothing more we can do here
              console.error("Redirect to /auth failed", err);
            }
          }

          // reset redirect flag shortly after
          setTimeout(() => {
            isRedirecting = false;
          }, 1000);

          return Promise.reject(error);
        }

        // Non-auth errors: show friendly message if available
        const extractMessage = (d: unknown): string | null => {
          if (!d) return null;
          if (typeof d === "string") return d;
          const obj = d as Record<string, unknown>;
          if (typeof obj.message === "string") return obj.message;
          if (typeof obj.message === "object" && obj.message !== null) {
            const nested = obj.message as Record<string, unknown>;
            if (typeof nested.message === "string") return nested.message;
          }
          if (typeof obj.error === "string") return obj.error;
          return null;
        };

        const userMessage = extractMessage(data);
        if (userMessage) {
          // create a stable toastId from the message so duplicate messages won't stack
          const safeId = `api-error-${String(userMessage).replace(/[^a-z0-9]+/gi, '-').slice(0, 60)}`;
          toast.error(String(userMessage), { toastId: safeId });
        } else if (statusCode >= 500) {
          toast.error("Đã có lỗi xảy ra trên server. Vui lòng thử lại sau.", { toastId: 'server-error' });
        }
      }
    } catch (handlerErr) {
      console.error("Error in axios interceptor handler", handlerErr);
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
