import axios from "axios";
import ENV from "./env";
import { message } from "antd";

console.log('ENV.BASE_URL: ', ENV.BASE_URL)
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
      const isLoginRequest = config?.url?.includes('/auth/login');
      const isAuthError = status === 401 || status === 403;
      const token = localStorage.getItem("token");

      // console.log(error.response, "error.response");

      // if (data.message === "Tài khoản chưa được xác thực" && data.statusCode === 400) {
      //   window.location.href = AUTH_ROUTES.AUTH + "/" + AUTH_ROUTES.REVERIFY_ACCOUNT;
      //   return error;
      // }

      if ((status === 400 || status === 401) && data.errors) {
        const messages = Object.values(data.errors).flat() as string[];
        messages.forEach((msg) => message.error(msg));
      } else if (data.message) {
        message.error(data.message as string);
      }

      if (isAuthError && !isLoginRequest && token) {
        if (!isTokenExpired) {
          isTokenExpired = true;
          message.error('Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại!');
          setTimeout(() => {
            localStorage.clear();
            // store.dispatch(logout());
            window.location.href = '/';
            isTokenExpired = false;
          }, 1300);
        }
      }
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
