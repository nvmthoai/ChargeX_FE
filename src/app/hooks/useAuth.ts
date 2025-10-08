
import { App } from "antd";
import authSerivce from "../services/AuthService";
import { useNavigate } from "react-router-dom";

interface handleRegisterProps {
  email: string;
  password: string;
  fullName: string;
  phone: string;
  confirmPassword: string;
}

const userAuth = () => {
  const { register } = authSerivce();
  const { message } = App.useApp();
  const navigate = useNavigate();
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
  return { handleRegister };
};

export default userAuth;
