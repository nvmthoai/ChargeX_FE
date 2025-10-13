import { useEffect, useState } from "react";
import { App } from "antd";
import authSerivce from "../services/AuthService";
import { useNavigate } from "react-router-dom";
import { getDeviceInfoString } from "../utils";
import { jwtDecode } from "jwt-decode";
import { useAuth } from "./AuthContext";
import type { User } from "./AuthContext";

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
  const { register, login } = authSerivce();
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

      console.log("decoded:", decoded);

      // ✅ cập nhật context để Header tự re-render
      setAuthUser(decoded, token);

      message.success("Login successfully!");
      navigate("/");
    }

    return null;
  };

  return { handleRegister, handleLogin };
};

export default UserAuth;
