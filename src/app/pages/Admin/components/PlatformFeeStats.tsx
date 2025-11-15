import { Card, Statistic, Row, Col, Empty } from "antd";
import { DollarOutlined, ShoppingOutlined, CheckCircleOutlined } from "@ant-design/icons";

interface PlatformStats {
  totalOrders: number;
  completedOrders: number;
  totalGrossValue: number;
  platformFeeCollected: number;
  platformFeePercent: number;
}

interface Props {
  stats: PlatformStats;
  loading?: boolean;
}

export default function PlatformFeeStats({ stats, loading = false }: Props) {
  if (!stats || Object.values(stats).every((v) => v === 0 || v === undefined)) {
    return <Empty description="No data available" />;
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Orders */}
        <Card loading={loading} className="shadow-sm hover:shadow-md transition-shadow">
          <Statistic
            title="Total Orders"
            value={stats.totalOrders || 0}
            prefix={<ShoppingOutlined className="text-blue-500" />}
            valueStyle={{ color: "#1890ff" }}
          />
          <p className="text-xs text-gray-500 mt-2">All orders processed</p>
        </Card>

        {/* Completed Orders */}
        <Card loading={loading} className="shadow-sm hover:shadow-md transition-shadow">
          <Statistic
            title="Completed Orders"
            value={stats.completedOrders || 0}
            prefix={<CheckCircleOutlined className="text-green-500" />}
            valueStyle={{ color: "#52c41a" }}
          />
          <p className="text-xs text-gray-500 mt-2">
            {stats.totalOrders > 0
              ? `${((stats.completedOrders / stats.totalOrders) * 100).toFixed(1)}% completion rate`
              : "No completed orders"}
          </p>
        </Card>

        {/* Gross Order Value */}
        <Card loading={loading} className="shadow-sm hover:shadow-md transition-shadow">
          <Statistic
            title="Gross Order Value"
            value={stats.totalGrossValue || 0}
            prefix={<DollarOutlined />}
            valueStyle={{ color: "#faad14" }}
            precision={2}
          />
          <p className="text-xs text-gray-500 mt-2">Total value before fees</p>
        </Card>

        {/* Platform Fee Collected */}
        <Card loading={loading} className="shadow-sm hover:shadow-md transition-shadow border-l-4 border-l-green-500">
          <Statistic
            title="Platform Fee Collected"
            value={stats.platformFeeCollected || 0}
            prefix={<DollarOutlined className="text-green-600" />}
            valueStyle={{ color: "#52c41a", fontWeight: "bold" }}
            precision={2}
          />
          <p className="text-xs text-gray-500 mt-2">
            {stats.platformFeePercent}% of gross value
          </p>
        </Card>
      </div>

      {/* Summary */}
      <Card className="bg-gradient-to-r from-green-50 to-blue-50 border border-green-200">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Platform Revenue Summary</h3>
            <p className="text-gray-600 text-sm">
              Based on {stats.completedOrders} completed orders with total gross value of ${stats.totalGrossValue?.toFixed(2) || "0.00"}
            </p>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold text-green-600 mb-1">
              ${(stats.platformFeeCollected || 0).toFixed(2)}
            </div>
            <p className="text-xs text-gray-500">Total platform revenue</p>
          </div>
        </div>
      </Card>

      {/* Breakdown */}
      <Card>
        <h4 className="font-semibold text-gray-800 mb-4">Revenue Breakdown</h4>
        <div className="space-y-3">
          <div className="flex justify-between items-center pb-3 border-b">
            <span className="text-gray-600">Total Gross Order Value</span>
            <span className="font-semibold">${(stats.totalGrossValue || 0).toFixed(2)}</span>
          </div>
          <div className="flex justify-between items-center pb-3 border-b bg-red-50 p-2 rounded">
            <span className="text-gray-600">Platform Fees (10%)</span>
            <span className="font-semibold text-green-600">-${(stats.platformFeeCollected || 0).toFixed(2)}</span>
          </div>
          <div className="flex justify-between items-center pt-2 bg-blue-50 p-2 rounded">
            <span className="text-gray-700 font-medium">Seller Payout</span>
            <span className="font-bold text-blue-600">
              ${((stats.totalGrossValue || 0) - (stats.platformFeeCollected || 0)).toFixed(2)}
            </span>
          </div>
        </div>
      </Card>
    </div>
  );
}
