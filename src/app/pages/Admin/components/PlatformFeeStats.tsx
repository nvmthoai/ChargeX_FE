import { Card, Statistic, Empty } from "antd";
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
    return (
      <Empty 
        description="No data available" 
        styles={{ description: { color: 'rgba(209, 213, 219, 1)' } }}
      />
    );
  }

  const cardStyles = {
    background: 'rgba(31, 41, 55, 0.8)',
    border: '1px solid rgba(30, 58, 138, 0.3)',
    borderRadius: '12px',
  };

  const gradientCardStyles = {
    background: 'linear-gradient(135deg, rgba(30, 58, 138, 0.2) 0%, rgba(251, 191, 36, 0.2) 100%)',
    border: '1px solid rgba(30, 58, 138, 0.5)',
    borderRadius: '12px',
    borderLeft: '4px solid rgba(34, 197, 94, 1)',
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Orders */}
        <Card 
          loading={loading} 
          styles={{ body: { padding: '20px' } }}
          style={cardStyles}
          className="backdrop-blur-sm shadow-lg hover:shadow-xl transition-all hover:scale-105"
        >
          <Statistic
            title={<span className="text-dark-200">Total Orders</span>}
            value={stats.totalOrders || 0}
            prefix={<ShoppingOutlined className="text-ocean-400" />}
            valueStyle={{ color: "#60A5FA" }}
          />
          <p className="text-xs text-dark-400 mt-2">All orders processed</p>
        </Card>

        {/* Completed Orders */}
        <Card 
          loading={loading} 
          styles={{ body: { padding: '20px' } }}
          style={cardStyles}
          className="backdrop-blur-sm shadow-lg hover:shadow-xl transition-all hover:scale-105"
        >
          <Statistic
            title={<span className="text-dark-200">Completed Orders</span>}
            value={stats.completedOrders || 0}
            prefix={<CheckCircleOutlined className="text-green-400" />}
            valueStyle={{ color: "#34D399" }}
          />
          <p className="text-xs text-dark-400 mt-2">
            {stats.totalOrders > 0
              ? `${((stats.completedOrders / stats.totalOrders) * 100).toFixed(1)}% completion rate`
              : "No completed orders"}
          </p>
        </Card>

        {/* Gross Order Value */}
        <Card 
          loading={loading} 
          styles={{ body: { padding: '20px' } }}
          style={cardStyles}
          className="backdrop-blur-sm shadow-lg hover:shadow-xl transition-all hover:scale-105"
        >
          <Statistic
            title={<span className="text-dark-200">Gross Order Value</span>}
            value={stats.totalGrossValue || 0}
            prefix={<DollarOutlined className="text-energy-400" />}
            valueStyle={{ color: "#FBBF24" }}
            precision={2}
          />
          <p className="text-xs text-dark-400 mt-2">Total value before fees</p>
        </Card>

        {/* Platform Fee Collected */}
        <Card 
          loading={loading} 
          styles={{ body: { padding: '20px' } }}
          style={gradientCardStyles}
          className="backdrop-blur-sm shadow-lg hover:shadow-xl transition-all hover:scale-105"
        >
          <Statistic
            title={<span className="text-dark-100 font-semibold">Platform Fee Collected</span>}
            value={stats.platformFeeCollected || 0}
            prefix={<DollarOutlined className="text-green-400" />}
            valueStyle={{ color: "#34D399", fontWeight: "bold" }}
            precision={2}
          />
          <p className="text-xs text-dark-300 mt-2">
            {stats.platformFeePercent}% of gross value
          </p>
        </Card>
      </div>

      {/* Summary */}
      <Card 
        styles={{ body: { padding: '24px' } }}
        style={{
          background: 'linear-gradient(90deg, rgba(30, 58, 138, 0.2) 0%, rgba(251, 191, 36, 0.2) 100%)',
          border: '1px solid rgba(30, 58, 138, 0.3)',
          borderRadius: '12px',
        }}
        className="backdrop-blur-sm shadow-lg"
      >
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-lg font-semibold text-dark-100 mb-2">Platform Revenue Summary</h3>
            <p className="text-dark-300 text-sm">
              Based on {stats.completedOrders} completed orders with total gross value of ${stats.totalGrossValue?.toFixed(2) || "0.00"}
            </p>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold text-green-400 mb-1">
              ${(stats.platformFeeCollected || 0).toFixed(2)}
            </div>
            <p className="text-xs text-dark-400">Total platform revenue</p>
          </div>
        </div>
      </Card>

      {/* Breakdown */}
      <Card 
        styles={{ body: { padding: '24px' } }}
        style={cardStyles}
        className="backdrop-blur-sm shadow-lg"
      >
        <h4 className="font-semibold text-dark-100 mb-4">Revenue Breakdown</h4>
        <div className="space-y-3">
          <div className="flex justify-between items-center pb-3 border-b border-ocean-800/30">
            <span className="text-dark-300">Total Gross Order Value</span>
            <span className="font-semibold text-dark-100">${(stats.totalGrossValue || 0).toFixed(2)}</span>
          </div>
          <div className="flex justify-between items-center pb-3 border-b border-ocean-800/30 bg-red-500/10 p-2 rounded">
            <span className="text-dark-300">Platform Fees ({stats.platformFeePercent}%)</span>
            <span className="font-semibold text-green-400">-${(stats.platformFeeCollected || 0).toFixed(2)}</span>
          </div>
          <div className="flex justify-between items-center pt-2 bg-ocean-500/10 p-2 rounded">
            <span className="text-dark-200 font-medium">Seller Payout</span>
            <span className="font-bold text-ocean-400">
              ${((stats.totalGrossValue || 0) - (stats.platformFeeCollected || 0)).toFixed(2)}
            </span>
          </div>
        </div>
      </Card>
    </div>
  );
}
