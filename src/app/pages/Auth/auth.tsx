"use client";

import { useState } from "react";
import { Form, Input, Button, Tabs, Divider, message } from "antd";
import {
  GoogleOutlined,
  FacebookOutlined,
  EyeInvisibleOutlined,
  EyeTwoTone,
} from "@ant-design/icons";
import "./auth.css";
import userAuth from "../../hooks/useAuth";

function AuthPage() {
  const [activeTab, setActiveTab] = useState("login");
  const { handleRegister, handleLogin } = userAuth();


  const handleSocialLogin = (provider: string) => {
    message.info(`Tiếp tục với ${provider}`);
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <h1 className="auth-title">Welcome to EV Trade Hub</h1>
          <p className="auth-subtitle">Login to your account</p>
        </div>

        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          centered
          className="auth-tabs"
          items={[
            {
              key: "login",
              label: "Login",
              children: (
                <Form
                  layout="vertical"
                  onFinish={handleLogin}
                  className="auth-form"
                >
                  <Form.Item
                    label="Email"
                    name="email"
                    rules={[
                      { required: true, message: "Vui lòng nhập email!" },
                      { type: "email", message: "Email không hợp lệ!" },
                    ]}
                  >
                    <Input placeholder="email@example.com" />
                  </Form.Item>

                  <Form.Item
                    label="Password"
                    name="password"
                    rules={[
                      { required: true, message: "Vui lòng nhập mật khẩu!" },
                    ]}
                  >
                    <Input.Password
                      placeholder="••••••••"
                      iconRender={(visible) =>
                        visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />
                      }
                    />
                  </Form.Item>

                  <div className="forgot-password">
                    <Button type="link">Forgot Password?</Button>
                  </div>

                  <Form.Item>
                    <Button
                      type="primary"
                      htmlType="submit"
                      className="login-button"
                      block
                    >
                      Login
                    </Button>
                  </Form.Item>
                </Form>
              ),
            },
            {
              key: "signup",
              label: "Sign Up",
              children: (
                <Form
                  layout="vertical"
                  onFinish={handleRegister}
                  className="auth-form"
                >
                  <Form.Item
                    label="Họ và tên"
                    name="fullName"
                    rules={[
                      { required: true, message: "Vui lòng nhập họ tên!" },
                    ]}
                  >
                    <Input placeholder="Nguyễn Văn A" />
                  </Form.Item>

                  <Form.Item
                    label="Email"
                    name="email"
                    rules={[
                      { required: true, message: "Vui lòng nhập email!" },
                      { type: "email", message: "Email không hợp lệ!" },
                    ]}
                  >
                    <Input placeholder="email@example.com" />
                  </Form.Item>

                  <Form.Item
                    label="Mật khẩu"
                    name="password"
                    rules={[
                      { required: true, message: "Vui lòng nhập mật khẩu!" },
                      { min: 6, message: "Mật khẩu phải có ít nhất 6 ký tự!" },
                    ]}
                  >
                    <Input.Password
                      placeholder="••••••••"
                      iconRender={(visible) =>
                        visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />
                      }
                    />
                  </Form.Item>

                  <Form.Item
                    label="Xác nhận mật khẩu"
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
                      iconRender={(visible) =>
                        visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />
                      }
                    />
                  </Form.Item>

                  <Form.Item
                    label="Số điện thoại"
                    name="phone"
                    dependencies={["phone"]}
                    rules={[
                      { required: true, message: "Vui lòng nhập mật khầu!" },
                    ]}
                  >
                    <Input />
                  </Form.Item>

                  <Form.Item>
                    <Button
                      type="primary"
                      htmlType="submit"
                      className="login-button"
                      block
                    >
                      Sign Up
                    </Button>
                  </Form.Item>
                </Form>
              ),
            },
          ]}
        />

        <Divider className="divider-text">or</Divider>

        <div>
          <Button
            onClick={() => handleSocialLogin("Google")}
            className="social-button"
            block
          >
            <GoogleOutlined className="social-icon" />
            Continue with Google
          </Button>

          <Button
            onClick={() => handleSocialLogin("Facebook")}
            className="social-button"
            block
          >
            <FacebookOutlined className="social-icon" />
            Continue with Facebook
          </Button>
        </div>
      </div>
    </div>
  );
}

export default AuthPage;
