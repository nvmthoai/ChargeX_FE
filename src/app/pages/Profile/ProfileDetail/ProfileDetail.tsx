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
} from "@ant-design/icons";
import { useState } from "react";
import useUser from "../../../hooks/useUser";

export default function ProfileDetail() {
  const [form] = Form.useForm();
  const { userDetail, handleUploadAvatar, handleUploadProfile } = useUser();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (values: any) => {
    console.log('values: ', values)
    setLoading(true);
    try {
      handleUploadProfile(values); // Gửi object {email, fullName, phone}
    } catch (error) {
      console.error("Failed to update profile");
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
      handleUploadAvatar({ file: file }); // Upload avatar riêng biệt
    } catch (error) {
      console.error("Failed to upload avatar");
    }

    return false; // Ngăn upload mặc định
  };

  if (!userDetail) {
    return <Empty description="No profile userDetail available" />;
  }

  const tabItems = [
    {
      key: "personal",
      label: "Personal Information",
      children: (
        <div className="bg-slate-50 rounded-lg p-6">
          <div className="mb-8">
            <div className="flex items-center gap-6">
              <div className="flex flex-col items-center">
                {userDetail.user.image ? (
                  <Avatar size={100} src={userDetail.user.image} />
                ) : (
                  <Avatar size={100} icon={<UserOutlined />} />
                )}
              </div>
              <div>
                <h3 className="text-lg font-semibold text-slate-900 mb-2">
                  Profile Picture
                </h3>
                <Upload
                  beforeUpload={handleAvatarUpload}
                  maxCount={1}
                  accept="image/*"
                  showUploadList={false}
                >
                  <Button icon={<CameraOutlined />}>Upload Avatar</Button>
                </Upload>
                <p className="text-xs text-slate-500 mt-2">
                  JPG, PNG, GIF - Max 5MB
                </p>
              </div>
            </div>
          </div>
          <Divider />

          <Form
            form={form}
            layout="vertical"
            onFinish={handleSubmit}
            initialValues={{
              fullName: userDetail.user.fullName,
              email: userDetail.user.email,
              phone: userDetail.user.phone,
            }}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Form.Item
                label="Full Name"
                name="fullName"
                rules={[{ required: true, message: "Please enter full name" }]}
              >
                <Input
                  prefix={<UserOutlined />}
                  placeholder="Enter full name"
                />
              </Form.Item>

              <Form.Item
                label="Email"
                name="email"
                rules={[
                  { required: true, message: "Please enter email" },
                  { type: "email", message: "Invalid email" },
                ]}
              >
                <Input prefix={<MailOutlined />} placeholder="Enter email" />
              </Form.Item>

              <Form.Item
                label="Phone Number"
                name="phone"
                rules={[
                  { required: true, message: "Please enter phone number" },
                ]}
              >
                <Input
                  prefix={<PhoneOutlined />}
                  placeholder="Enter phone number"
                />
              </Form.Item>

              <Form.Item label="Role">
                <Tag color="blue">{userDetail.user.role}</Tag>
              </Form.Item>

              <Form.Item label="Email Verified">
                <Tag color={userDetail.user.emailVerified ? "green" : "red"}>
                  {userDetail.user.emailVerified ? "Verified" : "Not Verified"}
                </Tag>
              </Form.Item>

              <Form.Item label="Account Status">
                <Tag color={userDetail.user.isActive ? "green" : "orange"}>
                  {userDetail.user.isActive ? "Active" : "Inactive"}
                </Tag>
              </Form.Item>
            </div>

            <Divider />

            <div className="flex gap-3">
              <Button type="primary" htmlType="submit" loading={loading}>
                Update Profile
              </Button>
              <Button>Cancel</Button>
            </div>
          </Form>
        </div>
      ),
    },
    {
      key: "addresses",
      label: `Addresses (${userDetail.addresses.length})`,
      children: (
        <div className="bg-slate-50 rounded-lg p-6">
          {userDetail.addresses.length > 0 ? (
            <div className="space-y-4">
              {userDetail.addresses.map((addr) => (
                <Card
                  key={addr.addressId}
                  className="border-l-4 border-l-blue-500"
                  hoverable
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-3">
                        <HomeOutlined className="text-blue-500" />
                        <span className="font-semibold text-lg">
                          {addr.label}
                        </span>
                        {addr.isDefault && <Tag color="blue">Default</Tag>}
                      </div>

                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-slate-500">Name:</span>
                          <p className="font-medium">{addr.fullName}</p>
                        </div>
                        <div>
                          <span className="text-slate-500">Phone:</span>
                          <p className="font-medium">{addr.phone}</p>
                        </div>
                      </div>

                      <div className="mt-3">
                        <span className="text-slate-500 text-sm">Address:</span>
                        <p className="font-medium text-slate-700">
                          {addr.line1}
                        </p>
                      </div>

                      {addr.note && (
                        <div className="mt-2">
                          <span className="text-slate-500 text-sm">Note:</span>
                          <p className="text-slate-600 text-sm">{addr.note}</p>
                        </div>
                      )}
                    </div>

                    <Space>
                      <Button type="link" size="small">
                        Edit
                      </Button>
                      <Button type="link" danger size="small">
                        Delete
                      </Button>
                    </Space>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <Empty description="No addresses saved" />
          )}
        </div>
      ),
    },
    {
      key: "wallet",
      label: "Wallet",
      children: (
        <div className="bg-slate-50 rounded-lg p-6">
          <Card className="border-l-4 border-l-yellow-500">
            <Row gutter={32}>
              <Col xs={24} sm={12} md={8}>
                <Statistic
                  title="Available Balance"
                  value={Number.parseFloat(userDetail.wallet.balance)}
                  prefix={<WalletOutlined />}
                  precision={2}
                  suffix="VND"
                  valueStyle={{ color: "#1f2937" }}
                />
              </Col>
            </Row>

            <Divider />

            <div className="flex gap-3">
              <Button type="primary">Deposit</Button>
              <Button>Withdraw</Button>
            </div>
          </Card>
        </div>
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-slate-100 p-6">
      <div className="max-w-5xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">
            Profile Details
          </h1>
          <p className="text-slate-600">
            Manage your personal information and preferences
          </p>
        </div>

        <Tabs
          items={tabItems}
          className="bg-white rounded-lg shadow-sm"
          tabBarStyle={{
            backgroundColor: "#1e293b",
            borderRadius: "8px 8px 0 0",
            margin: 0,
          }}
          tabBarExtraContent={
            <div className="text-xs text-slate-300 mr-4">
              Last updated:{" "}
              {new Date(userDetail.user.updatedAt).toLocaleDateString()}
            </div>
          }
        />
      </div>
    </div>
  );
}
