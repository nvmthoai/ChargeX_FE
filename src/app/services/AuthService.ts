import { useState } from "react";
import { message } from "antd";
import { authApi, type RegisterData, type LoginData, type VerifyOtpData } from "../../api/auth/api";

const authService = () => {
  const [loading, setLoading] = useState(false);

  const register = async (values: RegisterData) => {
    try {
      setLoading(true);
      const response = await authApi.register(values);
      return response;
    } catch (e: any) {
      message.error(e?.response?.data?.message || "Registration failed");
      throw e;
    } finally {
      setLoading(false);
    }
  };

  const login = async (values: LoginData) => {
    try {
      setLoading(true);
      const response = await authApi.login(values);
      return response;
    } catch (e: any) {
      message.error(e?.response?.data?.message || "Login failed");
      throw e;
    } finally {
      setLoading(false);
    }
  };

  const verifyOtp = async (values: VerifyOtpData) => {
    try {
      setLoading(true);
      const response = await authApi.verifyOtp(values);
      return response;
    } catch (e: any) {
      message.error(e?.response?.data?.message || "OTP verification failed");
      throw e;
    } finally {
      setLoading(false);
    }
  };

  const resendOtp = async (values: { email: string }) => {
    try {
      setLoading(true);
      const response = await authApi.resendOtp(values);
      return response;
    } catch (e: any) {
      message.error(e?.response?.data?.message || "Failed to resend OTP");
      throw e;
    } finally {
      setLoading(false);
    }
  };

   const forgotPassword = async (values: { email: string }) => {
    try {
      setLoading(true);
      const response = await authApi.forgotPassword(values);
      return response;
    } catch (e: any) {
      message.error(e?.response?.data?.message || "Failed to forgotPassword");
      throw e;
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async (values: any) => {
    try {
      setLoading(true);
      const response = await authApi.resetPassword(values);
      return response;
    } catch (e: any) {
      message.error(e?.response?.data?.message || "Failed to resetPassword");
      throw e;
    } finally {
      setLoading(false);
    }
  };

  return {
    register,
    resendOtp,
    login,
    loading,
    setIsLoading: setLoading,
    verifyOtp,
    forgotPassword,
    resetPassword
  };
};

export default authService;
