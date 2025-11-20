import { Card, Row, Col, Statistic, Space, Avatar } from "antd";
import {
  ShopOutlined,
  UserOutlined,
  PhoneOutlined,
  MailOutlined,
  StarOutlined,
} from "@ant-design/icons";

interface ShopHeaderProps {
  seller: {
    userId: string;
    fullName: string;
    email: string;
    phone: string;
    image: string | null;
    createdAt: string;
  };
  stats: {
    totalProducts: number;
    totalReviews: number;
    averageRating: number;
  };
}

export default function ShopHeader({ seller, stats }: ShopHeaderProps) {
  return (
    <Card className="border-0 shadow-sm bg-white">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="flex items-center gap-6">
          <Avatar size={80} icon={<UserOutlined />} src={seller.image} />
          <div>
            <h1 className="text-2xl font-bold text-slate-900 mb-2">
              {seller.fullName}
            </h1>
            <Space direction="vertical" size="small">
              <div className="flex items-center gap-2 text-slate-600">
                <PhoneOutlined /> {seller.phone}
              </div>
              <div className="flex items-center gap-2 text-slate-600">
                <MailOutlined /> {seller.email}
              </div>
              <div className="text-xs text-slate-500">
                Member since {new Date(seller.createdAt).toLocaleDateString()}
              </div>
            </Space>
          </div>
        </div>

        <div>
          <Row gutter={[32, 16]}>
            <Col xs={24} sm={8}>
              <Statistic
                title="Total Products"
                value={stats.totalProducts}
                prefix={<ShopOutlined />}
                valueStyle={{ color: "#1f2937" }}
              />
            </Col>
            <Col xs={24} sm={8}>
              <Statistic
                title="Reviews"
                value={stats.totalReviews}
                valueStyle={{ color: "#1f2937" }}
              />
            </Col>
            <Col xs={24} sm={8}>
              <Statistic
                title="Rating"
                value={stats.averageRating || 0}
                precision={1}
                prefix={<StarOutlined />}
                suffix="/ 5"
                valueStyle={{
                  color: stats.averageRating > 0 ? "#fbbf24" : "#9ca3af",
                }}
              />
            </Col>
          </Row>
        </div>
      </div>
    </Card>
  );
}
