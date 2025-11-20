import {
  Form,
  Input,
  Button,
  Card,
  Tabs,
  Empty,
  Divider,
  Tag,
  Space,
  Statistic,
  Row,
  Col,
  Upload,
  message,
  Avatar,
} from "antd";
import {
  MailOutlined,
  PhoneOutlined,
  UserOutlined,
  HomeOutlined,
  WalletOutlined,
  CameraOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
} from "@ant-design/icons";
import { useState } from "react";
import useUser from "../../../hooks/useUser";
import { User, MapPin, Wallet, Sparkles } from "lucide-react";

export default function ProfileDetail() {
  const [form] = Form.useForm();
  const { userDetail, handleUploadAvatar, handleUploadProfile } = useUser();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (values: any) => {
    console.log('values: ', values)
    setLoading(true);
    try {
      handleUploadProfile(values);
      message.success("Profile updated successfully!");
    } catch (error) {
      console.error("Failed to update profile");
      message.error("Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarUpload = async (file: File) => {
    const isImage = file.type.startsWith("image/");
    if (!isImage) {
      message.error("You can only upload image files!");
      return false;
    }
    try {
      handleUploadAvatar({ file: file });
      message.success("Avatar uploaded successfully!");
    } catch (error) {
      console.error("Failed to upload avatar");
      message.error("Failed to upload avatar");
    }

    return false;
  };

  if (!userDetail) {
    return (
      <div className="flex items-center justify-center py-20">
        <Empty description="No profile information available" />
      </div>
    );
  }

  const tabItems = [
    {
      key: "personal",
      label: (
        <span className="flex items-center gap-2">
          <User className="w-4 h-4" />
          Thông tin cá nhân
        </span>
      ),
      children: (
        <div className="space-y-6">
          {/* Avatar Section */}
          <div className="bg-gradient-to-r from-ocean-50 to-energy-50 rounded-2xl p-6 border border-ocean-200/50">
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-ocean-400 to-energy-400 rounded-full blur opacity-30"></div>
                {userDetail.user.image ? (
                  <Avatar 
                    size={120} 
                    src={userDetail.user.image}
                    className="relative border-4 border-white shadow-xl"
                  />
                ) : (
                  <Avatar 
                    size={120} 
                    icon={<UserOutlined />}
                    className="relative border-4 border-white shadow-xl bg-gradient-to-r from-ocean-500 to-energy-500"
                  />
                )}
              </div>
              <div className="flex-1 text-center sm:text-left">
                <h3 className="text-xl font-bold text-dark-900 mb-2">
                  Ảnh đại diện
                </h3>
                <Upload
                  beforeUpload={handleAvatarUpload}
                  maxCount={1}
                  accept="image/*"
                  showUploadList={false}
                >
                  <Button 
                    icon={<CameraOutlined />}
                    className="bg-gradient-to-r from-ocean-500 to-ocean-600 hover:from-ocean-600 hover:to-ocean-700 border-0 text-white shadow-lg hover:shadow-xl hover:scale-105 transition-all"
                  >
                    Tải ảnh lên
                  </Button>
                </Upload>
                <p className="text-sm text-dark-800 font-medium mt-2">
                  JPG, PNG, GIF - Max 5MB
                </p>
              </div>
            </div>
          </div>

          <Divider className="my-6" />

          {/* Form Section */}
          <Form
            form={form}
            layout="vertical"
            onFinish={handleSubmit}
            initialValues={{
              fullName: userDetail.user.fullName,
              email: userDetail.user.email,
              phone: userDetail.user.phone,
            }}
            className="space-y-4"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Form.Item
                label={<span className="font-bold text-dark-900">Tên</span>}
                name="fullName"
                rules={[{ required: true, message: "Please enter full name" }]}
              >
                <Input
                  prefix={<UserOutlined className="text-ocean-500" />}
                  placeholder="Enter full name"
                  size="large"
                  className="rounded-xl border-ocean-200 hover:border-ocean-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                />
              </Form.Item>

              <Form.Item
                label={<span className="font-semibold text-dark-700">Email</span>}
                name="email"
                rules={[
                  { required: true, message: "Please enter email" },
                  { type: "email", message: "Invalid email" },
                ]}
              >
                <Input 
                  prefix={<MailOutlined className="text-ocean-500" />} 
                  placeholder="Enter email"
                  size="large"
                  className="rounded-xl border-ocean-200 hover:border-ocean-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                />
              </Form.Item>

              <Form.Item
                label={<span className="font-semibold text-dark-700">Số điện thoại</span>}
                name="phone"
                rules={[
                  { required: true, message: "Please enter phone number" },
                ]}
              >
                <Input
                  prefix={<PhoneOutlined className="text-ocean-500" />}
                  placeholder="Enter phone number"
                  size="large"
                  className="rounded-xl border-ocean-200 hover:border-ocean-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                />
              </Form.Item>

              <Form.Item label={<span className="font-semibold text-dark-700">Chức vụ</span>}>
                <Tag 
                  color="blue"
                  className="px-3 py-1 rounded-full text-sm font-semibold"
                >
                  {userDetail.user.role}
                </Tag>
              </Form.Item>

              <Form.Item label={<span className="font-semibold text-dark-700">Email xác minh</span>}>
                <Tag 
                  color={userDetail.user.emailVerified ? "green" : "red"}
                  className="px-3 py-1 rounded-full text-sm font-semibold flex items-center gap-1 w-fit"
                >
                  {userDetail.user.emailVerified ? (
                    <>
                      <CheckCircleOutlined /> Đã xác minh
                    </>
                  ) : (
                    <>
                      <CloseCircleOutlined /> Chưa xác minh
                    </>
                  )}
                </Tag>
              </Form.Item>

              <Form.Item label={<span className="font-semibold text-dark-700">Trạng thái tài khoản</span>}>
                <Tag 
                  color={userDetail.user.isActive ? "green" : "orange"}
                  className="px-3 py-1 rounded-full text-sm font-semibold"
                >
                  {userDetail.user.isActive ? "Hoạt động" : "Không hoạt động"}
                </Tag>
              </Form.Item>
            </div>

            <Divider className="my-6" />

            <div className="flex gap-3">
              <Button 
                type="primary" 
                htmlType="submit" 
                loading={loading}
                size="large"
                className="bg-gradient-to-r from-ocean-500 to-ocean-600 hover:from-ocean-600 hover:to-ocean-700 border-0 rounded-xl font-semibold shadow-lg shadow-ocean-500/30 hover:shadow-xl hover:scale-105 transition-all px-8"
              >
                Cập nhật tài khoản
              </Button>
              <Button 
                size="large"
                className="rounded-xl border-ocean-200 text-ocean-700 hover:bg-ocean-50"
              >
                Hủy
              </Button>
            </div>
          </Form>
        </div>
      ),
    },
    {
      key: "addresses",
      label: (
        <span className="flex items-center gap-2">
          <MapPin className="w-4 h-4" />
          Địa chỉ ({userDetail.addresses.length})
        </span>
      ),
      children: (
        <div className="space-y-4">
          {userDetail.addresses.length > 0 ? (
            userDetail.addresses.map((addr) => (
              <Card
                key={addr.addressId}
                className="border-l-4 border-l-ocean-500 hover:shadow-lg transition-all rounded-xl"
                hoverable
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-3">
                      <HomeOutlined className="text-ocean-500 text-lg" />
                      <span className="font-bold text-lg text-dark-900">
                        {addr.label}
                      </span>
                      {addr.isDefault && (
                        <Tag color="blue" className="rounded-full">
                          Mặc định
                        </Tag>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm mb-3">
                      <div>
                        <span className="text-dark-800 font-medium">Tên:</span>
                        <p className="font-semibold text-dark-900">{addr.fullName}</p>
                      </div>
                      <div>
                        <span className="text-dark-600">Số điện thoại:</span>
                        <p className="font-semibold text-dark-900">{addr.phone}</p>
                      </div>
                    </div>

                    <div className="mt-3">
                      <span className="text-dark-600 text-sm">Địa chỉ:</span>
                      <p className="font-semibold text-dark-900">
                        {addr.line1}
                      </p>
                    </div>

                    {addr.note && (
                      <div className="mt-2">
                        <span className="text-dark-600 text-sm">Ghi chú:</span>
                        <p className="text-dark-800 text-sm font-medium">{addr.note}</p>
                      </div>
                    )}
                  </div>

                  <Space>
                    <Button 
                      type="link" 
                      size="small"
                      className="text-ocean-600 hover:text-ocean-700"
                    >
                      Edit
                    </Button>
                    <Button 
                      type="link" 
                      danger 
                      size="small"
                    >
                      Delete
                    </Button>
                  </Space>
                </div>
              </Card>
            ))
          ) : (
            <div className="py-12">
              <Empty description="No addresses saved" />
            </div>
          )}
        </div>
      ),
    },
    {
      key: "wallet",
      label: (
        <span className="flex items-center gap-2">
          <Wallet className="w-4 h-4" />
          Wallet
        </span>
      ),
      children: (
        <div className="space-y-6">
          <Card className="border-l-4 border-l-energy-500 rounded-xl shadow-lg">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-gradient-to-r from-energy-500 to-energy-600 rounded-xl">
                <WalletOutlined className="text-white text-xl" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-dark-900">Số dư khả dụng</h3>
                <p className="text-dark-800 font-medium">Số dư ví hiện tại của bạn</p>
              </div>
            </div>
            
            <Row gutter={32}>
              <Col xs={24} sm={12} md={8}>
                <Statistic
                  title={<span className="text-dark-800 font-medium">Số dư</span>}
                  value={Number(userDetail?.wallet?.balance || 0).toLocaleString("vi-VN")}
                  prefix={<WalletOutlined className="text-energy-600" />}
                  precision={2}
                  suffix="VND"
                  valueStyle={{ 
                    color: "#1890ff",
                    fontSize: "28px",
                    fontWeight: "bold"
                  }}
                />
              </Col>
            </Row>

            <Divider className="my-6" />

            <div className="flex gap-3">
              <Button 
                type="primary"
                size="large"
                className="bg-gradient-to-r from-energy-500 to-energy-600 hover:from-energy-600 hover:to-energy-700 border-0 rounded-xl font-semibold shadow-lg shadow-energy-500/30 hover:shadow-xl hover:scale-105 transition-all"
              >
                <Sparkles className="w-4 h-4 mr-2" />
                Nạp tiền
              </Button>
              <Button 
                size="large"
                className="rounded-xl border-ocean-200 text-ocean-700 hover:bg-ocean-50"
              >
                Rút tiền
              </Button>
            </div>
          </Card>
        </div>
      ),
    },
  ];

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-3xl font-bold bg-gradient-to-r from-ocean-600 to-energy-600 bg-clip-text text-transparent mb-2">
          Chi tiết hồ sơ
        </h2>
        <p className="text-dark-800 font-medium">
          Quản lý thông tin cá nhân và cài đặt của bạn
        </p>
      </div>

      <Tabs
        items={tabItems}
        className="profile-tabs"
        size="large"
      />
    </div>
  );
}
