import { useEffect, useState } from "react";
import { App } from "antd";
import authSerivce from "../services/AuthService";
import { useNavigate } from "react-router-dom";
import { getDeviceInfoString } from "../utils";
import { jwtDecode } from "jwt-decode";
interface handleRegisterProps {
  email: string;
  password: string;
  fullName: string;
  phone: string;
  confirmPassword: string;
}

interface handleLoginProps {
  email: string;
  password: string;
  deviceInfo: string;
}

const userAuth = () => {
  const { register, login } = authSerivce();
  const { message } = App.useApp();
  const navigate = useNavigate();

  const [deviceInfo, setDeviceInfo] = useState("");

  useEffect(() => {
    setDeviceInfo(getDeviceInfoString());
  }, []);

  const handleRegister = async (values: handleRegisterProps) => {
    const response = await register({
      email: values.email,
      password: values.password,
      fullName: values.fullName,
      phone: values.phone,
    });
    if (response) {
      navigate("/auth", { replace: true });
      message.success("Register successfully!");
      return response
    }
    return null;
  };

  const handleLogin = async (values: handleLoginProps) => {
    console.log('Login: ', {...values, deviceInfo: deviceInfo})
    const response = await login({...values, deviceInfo: deviceInfo});
    if (response) {
      const token = response.data.accessToken
      const decoded = jwtDecode(token);
      console.log('decoded: ', decoded);
      message.success("Login successfully!");
      localStorage.setItem('token', token)
      localStorage.setItem('user', JSON.stringify(decoded));
      navigate('/')
    }

    return null;
  };

  return { handleRegister, handleLogin };
};

export default userAuth;
