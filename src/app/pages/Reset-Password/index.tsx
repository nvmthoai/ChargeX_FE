import { Form, Input, Button, Card } from "antd";
import {
  MailOutlined,
  LockOutlined,
  ArrowLeftOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import UserAuth from "@/app/hooks/useAuth";

export default function ResetPassword() {
  const navigate = useNavigate();

  const [form] = Form.useForm();
  const { handleResetPassword, loading } = UserAuth();
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
                Nhập email, mã OTP và mật khẩu mới của bạn
              </p>
            </div>

            {/* Reset Form */}
            <Form layout="vertical" form={form} onFinish={handleResetPassword}>
              <Form.Item
                label={<span className="text-dark-800 font-medium">Email</span>}
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

              <Form.Item
                label={
                  <span className="text-dark-800 font-medium">Mã OTP</span>
                }
                name="otp"
                rules={[
                  { required: true, message: "Vui lòng nhập mã OTP!" },
                  { len: 6, message: "Mã OTP phải có 6 ký tự!" },
                ]}
              >
                <Input
                  placeholder="Nhập mã 6 ký tự"
                  size="large"
                  maxLength={6}
                  className="rounded-xl border-ocean-200 focus:border-ocean-500"
                />
              </Form.Item>

              <Form.Item
                label={
                  <span className="text-dark-800 font-medium">
                    Mật khẩu mới
                  </span>
                }
                name="newPassword"
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
                  loading={loading}
                  className="bg-gradient-to-r from-energy-500 to-energy-600 hover:from-energy-600 hover:to-energy-700 border-0 rounded-xl font-semibold shadow-lg shadow-energy-500/30 hover:shadow-xl transition-all h-12"
                >
                  Đặt lại mật khẩu
                </Button>
              </Form.Item>
            </Form>

            {/* Help Text */}
            <div className="mt-6 pt-6 border-t border-ocean-200/50 text-center text-xs text-dark-600">
              <p>Không nhận được mã OTP?</p>
              <button className="text-ocean-600 hover:text-ocean-700 font-medium mt-1">
                Gửi lại mã
              </button>
            </div>
          </div>
        </Card>

        {/* Footer Text */}
        <p className="text-center text-xs text-dark-600 mt-6">
          Mã OTP sẽ hết hạn sau 15 phút
        </p>
      </div>
    </div>
  );
}
