import axios from "axios";
import ENV from "./env";
import { toast } from "react-toastify";

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
    if (error.response) {
      const { status, data, config } = error.response;
      let isTokenExpired = false;
      const isLoginRequest = config?.url?.includes("/auth");
      const isAuthError = status === 401 || status === 403;
      const token = localStorage.getItem("token");



      // if (data.message === "Tài khoản chưa được xác thực" && data.statusCode === 400) {
      //   window.location.href = AUTH_ROUTES.AUTH + "/" + AUTH_ROUTES.REVERIFY_ACCOUNT;
      //   return error;
      // }
      console.log('data.message.message: ',data.message.message)
      if ((status === 400 || status === 401) && data.message) {
        toast.error(data.message.message);
      } else if (data.message) {
        toast.error(data.message.message as string);
      }

      if (isAuthError && !isLoginRequest && token) {
        if (!isTokenExpired) {
          isTokenExpired = true;
          toast.error("Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại!");
          // Immediately clear storage and redirect to login page
          localStorage.clear();
          // store.dispatch(logout());
          try {
            const next = encodeURIComponent(window.location.pathname + window.location.search);
            window.location.href = `/auth${next ? `?next=${next}` : ""}`;
          } catch {
            window.location.href = "/auth";
          }
        }
      }
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
