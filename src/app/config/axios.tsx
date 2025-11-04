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

 console.log('err: ')
    if (error.response) {
      const { statusCode, data, config } = error.response;
      let isTokenExpired = false;
      const isLoginRequest = config?.url?.includes("/auth/login");
      const isAuthError = statusCode === 401 || statusCode === 403;
      const token = localStorage.getItem("token");



      // if (data.message === "Tài khoản chưa được xác thực" && data.statusCode === 400) {
      //   window.location.href = AUTH_ROUTES.AUTH + "/" + AUTH_ROUTES.REVERIFY_ACCOUNT;
      //   return error;
      // }
      console.log('data.message.message: ',data.message.message)
      if ((statusCode === 400 || statusCode === 401) && data.message) {
        toast.error(data.message.message);
      } else if (data.message) {
        toast.error(data.message.message as string);
      }

      if (isAuthError && !isLoginRequest && token) {
        if (!isTokenExpired) {
          isTokenExpired = true;
          toast.error("Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại!");
          setTimeout(() => {
            localStorage.clear();
            // store.dispatch(logout());
            window.location.href = "/";
            isTokenExpired = false;
          }, 1300);
        }
      }
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
