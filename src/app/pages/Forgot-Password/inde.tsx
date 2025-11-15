import { useState } from "react";
import { Form, Input, Button, message, Card, Steps } from "antd";
import {
  MailOutlined,
  LockOutlined,
  ArrowLeftOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import UserAuth from "@/app/hooks/useAuth";

interface ForgotPasswordFormData {
  email: string;
}

interface ResetPasswordFormData {
  password: string;
  confirmPassword: string;
}

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [resetCode, setResetCode] = useState("");
  const { handleForgotPassword } = UserAuth();

  const handlePasswordReset = async (values: ResetPasswordFormData) => {
    if (values.password !== values.confirmPassword) {
      message.error("Mật khẩu không khớp!");
      return;
    }

    setIsLoading(true);
    try {
      // Call your reset password service
      console.log("[v0] Resetting password with code:", resetCode);

      // Replace with your actual service call
      // const response = await resetPasswordService({
      //   email,
      //   code: resetCode,
      //   password: values.password
      // });

      message.success("Mật khẩu đã được đặt lại thành công!");

    } catch (error) {
      console.error("[v0] Reset password error:", error);
      message.error("Không thể đặt lại mật khẩu. Vui lòng thử lại.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-ocean-50 via-energy-50/50 to-ocean-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Back Button */}
        <button
          onClick={() => navigate("/auth")}
          className="flex items-center gap-2 text-ocean-600 hover:text-ocean-700 font-medium mb-6 transition-colors"
        >
          <ArrowLeftOutlined />
          Quay lại đăng nhập
        </button>

        {/* Main Card */}
        <Card className="bg-white/90 backdrop-blur-xl border border-ocean-200/50 rounded-3xl shadow-2xl p-8">
          <div className="space-y-6">
            {/* Header */}
            <div className="text-center space-y-2">
              <h1 className="text-2xl font-bold text-dark-900">
                Đặt lại mật khẩu
              </h1>
              <p className="text-dark-600 text-sm">
                {currentStep === 0
                  ? "Nhập email của bạn để nhận liên kết đặt lại mật khẩu"
                  : "Nhập mã xác nhận và mật khẩu mới"}
              </p>
            </div>

            {/* Steps */}
            <Steps
              current={currentStep}
              items={[
                {
                  title: "Xác nhận Email",
                  status: currentStep >= 0 ? "process" : "wait",
                },
                {
                  title: "Đặt lại Mật khẩu",
                  status: currentStep >= 1 ? "process" : "wait",
                },
              ]}
              size="small"
              className="[&_.ant-steps-item-title]:text-xs [&_.ant-steps-item-title]:font-medium"
            />

            {/* Step 1: Email Verification */}
            {currentStep === 0 && (
              <Form layout="vertical" onFinish={handleForgotPassword}>
                <Form.Item
                  label={
                    <span className="text-dark-800 font-medium">Email</span>
                  }
                  name="email"
                  rules={[
                    { required: true, message: "Vui lòng nhập email!" },
                    { type: "email", message: "Email không hợp lệ!" },
                  ]}
                >
                  <Input
                    prefix={<MailOutlined className="text-ocean-500" />}
                    placeholder="user@example.com"
                    size="large"
                    className="rounded-xl border-ocean-200 focus:border-ocean-500"
                  />
                </Form.Item>

                <Form.Item>
                  <Button
                    type="primary"
                    htmlType="submit"
                    block
                    size="large"
                    loading={isLoading}
                    className="bg-gradient-to-r from-energy-500 to-energy-600 hover:from-energy-600 hover:to-energy-700 border-0 rounded-xl font-semibold shadow-lg shadow-energy-500/30 hover:shadow-xl transition-all h-12"
                  >
                    Gửi liên kết đặt lại
                  </Button>
                </Form.Item>
              </Form>
            )}

            {/* Step 2: Reset Password */}
            {currentStep === 1 && (
              <Form layout="vertical" onFinish={handlePasswordReset}>
                <Form.Item
                  label={
                    <span className="text-dark-800 font-medium">
                      Mã xác nhận
                    </span>
                  }
                  name="resetCode"
                  rules={[
                    { required: true, message: "Vui lòng nhập mã xác nhận!" },
                  ]}
                >
                  <Input
                    placeholder="Nhập mã từ email"
                    size="large"
                    onChange={(e) => setResetCode(e.target.value)}
                    className="rounded-xl border-ocean-200 focus:border-ocean-500"
                  />
                </Form.Item>

                <Form.Item
                  label={
                    <span className="text-dark-800 font-medium">
                      Mật khẩu mới
                    </span>
                  }
                  name="password"
                  rules={[
                    { required: true, message: "Vui lòng nhập mật khẩu mới!" },
                    { min: 6, message: "Mật khẩu phải có ít nhất 6 ký tự!" },
                  ]}
                >
                  <Input.Password
                    prefix={<LockOutlined className="text-ocean-500" />}
                    placeholder="Nhập mật khẩu mới"
                    size="large"
                    className="rounded-xl"
                  />
                </Form.Item>

                <Form.Item
                  label={
                    <span className="text-dark-800 font-medium">
                      Xác nhận mật khẩu
                    </span>
                  }
                  name="confirmPassword"
                  rules={[
                    { required: true, message: "Vui lòng xác nhận mật khẩu!" },
                    { min: 6, message: "Mật khẩu phải có ít nhất 6 ký tự!" },
                  ]}
                >
                  <Input.Password
                    prefix={<LockOutlined className="text-ocean-500" />}
                    placeholder="Xác nhận mật khẩu"
                    size="large"
                    className="rounded-xl"
                  />
                </Form.Item>

                <Form.Item>
                  <Button
                    type="primary"
                    htmlType="submit"
                    block
                    size="large"
                    loading={isLoading}
                    className="bg-gradient-to-r from-energy-500 to-energy-600 hover:from-energy-600 hover:to-energy-700 border-0 rounded-xl font-semibold shadow-lg shadow-energy-500/30 hover:shadow-xl transition-all h-12"
                  >
                    Đặt lại mật khẩu
                  </Button>
                </Form.Item>

                <Button
                  type="link"
                  block
                  onClick={() => setCurrentStep(0)}
                  className="text-ocean-600 hover:text-ocean-700"
                >
                  Quay lại bước trước
                </Button>
              </Form>
            )}

            {/* Help Text */}
            <div className="mt-6 pt-6 border-t border-ocean-200/50 text-center text-xs text-dark-600">
              <p>Không nhận được email?</p>
              <button className="text-ocean-600 hover:text-ocean-700 font-medium mt-1">
                Gửi lại email
              </button>
            </div>
          </div>
        </Card>

        {/* Footer Text */}
        <p className="text-center text-xs text-dark-600 mt-6">
          Liên kết đặt lại sẽ hết hạn sau 24 giờ
        </p>
      </div>
    </div>
  );
}
