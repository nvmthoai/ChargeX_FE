import { useState } from "react";
import { Form, Input, Button, Tabs, Checkbox } from "antd";
import {
  EyeInvisibleOutlined,
  EyeTwoTone,
  MailOutlined,
  LockOutlined,
  UserOutlined,
  PhoneOutlined,
} from "@ant-design/icons";
import userAuth from "../../hooks/useAuth";
import { Link } from "react-router-dom";

function AuthPage() {
  const [activeTab, setActiveTab] = useState("login");
  const { handleRegister, handleLogin } = userAuth();

  return (
    <div className="min-h-screen bg-gradient-to-br from-ocean-50 via-energy-50/50 to-ocean-100 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-ocean-300/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-energy-300/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      <div className="relative w-full max-w-md">
        {/* Auth Card */}
        <div className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl border border-ocean-200/50 p-8 sm:p-10 animate-fadeIn">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-ocean-500 via-energy-500 to-ocean-600 rounded-2xl mb-4 shadow-lg ring-4 ring-ocean-200/50">
              <img
                src="/chargeX_Logo.png"
                alt="ChargeX Logo"
                className="w-14 h-14 object-contain"
              />
            </div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-ocean-600 to-energy-600 bg-clip-text text-transparent mb-2">
              Welcome to ChargeX
            </h1>
            <p className="text-dark-800 font-semibold">
              Your EV Battery Marketplace
            </p>
          </div>

          <Tabs
            activeKey={activeTab}
            onChange={setActiveTab}
            centered
            className="auth-tabs [&_.ant-tabs-tab]:text-dark-800 [&_.ant-tabs-tab-active]:text-ocean-600 [&_.ant-tabs-ink-bar]:bg-ocean-500"
            items={[
              {
                key: "login",
                label: (
                  <span className="px-4 py-2 font-semibold text-dark-800">
                    Login
                  </span>
                ),
                children: (
                  <Form
                    layout="vertical"
                    onFinish={handleLogin}
                    className="space-y-4"
                  >
                    <Form.Item
                      label={
                        <span className="font-bold text-dark-900">Email</span>
                      }
                      name="email"
                      rules={[
                        { required: true, message: "Vui lòng nhập email!" },
                        { type: "email", message: "Email không hợp lệ!" },
                      ]}
                    >
                      <Input
                        placeholder="email@example.com"
                        prefix={<MailOutlined className="text-ocean-500" />}
                        size="large"
                        className="rounded-xl border-ocean-200 hover:border-ocean-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 [&_input]:text-dark-900 [&_input::placeholder]:text-dark-400"
                      />
                    </Form.Item>

                    <Form.Item
                      label={
                        <span className="font-bold text-dark-900">
                          Password
                        </span>
                      }
                      name="password"
                      rules={[
                        { required: true, message: "Vui lòng nhập mật khẩu!" },
                      ]}
                    >
                      <Input.Password
                        placeholder="••••••••"
                        prefix={<LockOutlined className="text-ocean-500" />}
                        size="large"
                        iconRender={(visible) =>
                          visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />
                        }
                        className="rounded-xl border-ocean-200 hover:border-ocean-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 [&_input]:text-dark-900 [&_input::placeholder]:text-dark-400"
                      />
                    </Form.Item>

                    <div className="text-right mb-4">
                     <Link to={'/forgot-password'}>
                      <Button
                        type="link"
                        className="text-ocean-600 hover:text-ocean-700 p-0"
                      >
                        Forgot Password?
                      </Button>
                     </Link>
                    </div>

                    <Form.Item>
                      <Button
                        type="primary"
                        htmlType="submit"
                        block
                        size="large"
                        className="bg-gradient-to-r from-ocean-500 to-ocean-600 hover:from-ocean-600 hover:to-ocean-700 border-0 rounded-xl font-semibold shadow-lg shadow-ocean-500/30 hover:shadow-xl hover:scale-105 transition-all h-12"
                      >
                        Login
                      </Button>
                    </Form.Item>
                  </Form>
                ),
              },
              {
                key: "signup",
                label: (
                  <span className="px-4 py-2 font-semibold text-dark-800">
                    Sign Up
                  </span>
                ),
                children: (
                  <Form
                    layout="vertical"
                    onFinish={handleRegister}
                    className="space-y-4"
                  >
                    <Form.Item
                      label={
                        <span className="font-bold text-dark-900">
                          Họ và tên
                        </span>
                      }
                      name="fullName"
                      rules={[
                        { required: true, message: "Vui lòng nhập họ tên!" },
                      ]}
                    >
                      <Input
                        placeholder="Nguyễn Văn A"
                        prefix={<UserOutlined className="text-ocean-500" />}
                        size="large"
                        className="rounded-xl border-ocean-200 hover:border-ocean-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 [&_input]:text-dark-900 [&_input::placeholder]:text-dark-400"
                      />
                    </Form.Item>

                    <Form.Item
                      label={
                        <span className="font-bold text-dark-900">Email</span>
                      }
                      name="email"
                      rules={[
                        { required: true, message: "Vui lòng nhập email!" },
                        { type: "email", message: "Email không hợp lệ!" },
                      ]}
                    >
                      <Input
                        placeholder="email@example.com"
                        prefix={<MailOutlined className="text-ocean-500" />}
                        size="large"
                        className="rounded-xl border-ocean-200 hover:border-ocean-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 [&_input]:text-dark-900 [&_input::placeholder]:text-dark-400"
                      />
                    </Form.Item>

                    <Form.Item
                      label={
                        <span className="font-bold text-dark-900">
                          Mật khẩu
                        </span>
                      }
                      name="password"
                      rules={[
                        { required: true, message: "Vui lòng nhập mật khẩu!" },
                        {
                          min: 6,
                          message: "Mật khẩu phải có ít nhất 6 ký tự!",
                        },
                      ]}
                    >
                      <Input.Password
                        placeholder="••••••••"
                        prefix={<LockOutlined className="text-ocean-500" />}
                        size="large"
                        iconRender={(visible) =>
                          visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />
                        }
                        className="rounded-xl border-ocean-200 hover:border-ocean-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 [&_input]:text-dark-900 [&_input::placeholder]:text-dark-400"
                      />
                    </Form.Item>

                    <Form.Item
                      label={
                        <span className="font-bold text-dark-900">
                          Xác nhận mật khẩu
                        </span>
                      }
                      name="confirmPassword"
                      dependencies={["password"]}
                      rules={[
                        {
                          required: true,
                          message: "Vui lòng xác nhận mật khẩu!",
                        },
                        ({ getFieldValue }) => ({
                          validator(_, value) {
                            if (!value || getFieldValue("password") === value) {
                              return Promise.resolve();
                            }
                            return Promise.reject(
                              new Error("Mật khẩu không khớp!")
                            );
                          },
                        }),
                      ]}
                    >
                      <Input.Password
                        placeholder="••••••••"
                        prefix={<LockOutlined className="text-ocean-500" />}
                        size="large"
                        iconRender={(visible) =>
                          visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />
                        }
                        className="rounded-xl border-ocean-200 hover:border-ocean-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 [&_input]:text-dark-900 [&_input::placeholder]:text-dark-400"
                      />
                    </Form.Item>

                    <Form.Item
                      label={
                        <span className="font-bold text-dark-900">
                          Số điện thoại
                        </span>
                      }
                      name="phone"
                      rules={[
                        {
                          required: true,
                          message: "Vui lòng nhập số điện thoại!",
                        },
                      ]}
                    >
                      <Input
                        placeholder="0123456789"
                        prefix={<PhoneOutlined className="text-ocean-500" />}
                        size="large"
                        className="rounded-xl border-ocean-200 hover:border-ocean-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 [&_input]:text-dark-900 [&_input::placeholder]:text-dark-400"
                      />
                    </Form.Item>

                    <Form.Item
                      name="agreeToTerms"
                      valuePropName="checked"
                      validateTrigger={["onChange"]}
                      rules={[
                        {
                          required: true,
                          message: "Vui lòng chấp nhận điều khoản!",
                        },
                      ]}
                    >
                      <Checkbox className="text-dark-900">
                        Tôi đồng ý với{" "}
                        <a
                          href="/terms"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-ocean-600 hover:text-ocean-700"
                        >
                          Điều khoản và Điều kiện
                        </a>
                      </Checkbox>
                    </Form.Item>

                    <Form.Item>
                      <Button
                        type="primary"
                        htmlType="submit"
                        block
                        size="large"
                        className="bg-gradient-to-r from-energy-500 to-energy-600 hover:from-energy-600 hover:to-energy-700 border-0 rounded-xl font-semibold shadow-lg shadow-energy-500/30 hover:shadow-xl hover:scale-105 transition-all h-12"
                      >
                        Sign Up
                      </Button>
                    </Form.Item>
                  </Form>
                ),
              },
            ]}
          />
        </div>
      </div>
    </div>
  );
}

export default AuthPage;
