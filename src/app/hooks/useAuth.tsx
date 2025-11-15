import { useEffect, useState } from "react";
import { App } from "antd";
import authSerivce from "../services/AuthService";
import { useNavigate } from "react-router-dom";
import { getDeviceInfoString } from "../utils";
import { jwtDecode } from "jwt-decode";
import { useAuth } from "./AuthContext";
import type { User } from "../.././api/user/type";

interface HandleRegisterProps {
  email: string;
  password: string;
  fullName: string;
  phone: string;
  confirmPassword: string;
}

interface HandleLoginProps {
  email: string;
  password: string;
  deviceInfo: string;
}

const UserAuth = () => {
  const { register, login, forgotPassword } = authSerivce();
  const { message } = App.useApp();
  const navigate = useNavigate();
  const { login: setAuthUser } = useAuth();

  const [deviceInfo, setDeviceInfo] = useState("");

  useEffect(() => {
    setDeviceInfo(getDeviceInfoString());
  }, []);

  const handleRegister = async (values: HandleRegisterProps) => {
    const response = await register({
      email: values.email,
      password: values.password,
      fullName: values.fullName,
      phone: values.phone,
    });
    if (response) {
      localStorage.setItem("emailNeedToVerify", values.email);
      navigate("/verify-otp", { replace: true });
      message.success("Register successfully!");
      return response;
    }
    return null;
  };

  const handleLogin = async (values: HandleLoginProps) => {
    const response = await login({ ...values, deviceInfo });
    if (response) {
      const token = response.data.accessToken;
      const decoded = jwtDecode<User>(token); // ✅ ép kiểu User
      // ✅ cập nhật context để Header tự re-render
      setAuthUser(decoded, token);

      message.success("Login successfully!");
      switch (decoded.role) {
        case "admin":
          return navigate("/admin");
        case "member":
          return navigate("/");
        default:
          return navigate("/");
      }
    }

    return null;
  };

  const handleForgotPassword = async (values: any) => {
    const response = await forgotPassword(values);
    if (response) {
      message.success("Check your mail to claim new password!");
      setTimeout(() => {
        navigate("/auth");
      }, 1500);
      return response;
    }
    return null;
  };

  return { handleRegister, handleLogin, handleForgotPassword };
};

export default UserAuth;
