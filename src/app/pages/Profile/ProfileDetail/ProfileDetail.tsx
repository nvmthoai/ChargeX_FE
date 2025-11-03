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
} from "antd";
import {
  MailOutlined,
  PhoneOutlined,
  UserOutlined,
  HomeOutlined,
  WalletOutlined,
} from "@ant-design/icons";
import useUser from "../../../hooks/useUser";

export default function ProfileDetail() {
  const [form] = Form.useForm();
  const { userDetail } = useUser();
  const handleSubmit = () => {
    //   if (onUpdate) {
    //     onUpdate(values);
    //   }
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
                  disabled
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
                <Input
                  prefix={<MailOutlined />}
                  placeholder="Enter email"
                  disabled
                />
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
                  disabled
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
              <Button type="primary" htmlType="submit">
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
