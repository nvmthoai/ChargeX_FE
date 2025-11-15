import { useEffect, useState } from "react";
import { Card, Spin, Empty, message } from "antd";
import PlatformFeeStats from "../components/PlatformFeeStats";

interface DashboardStats {
  totalOrders: number;
  completedOrders: number;
  totalGrossValue: number;
  platformFeeCollected: number;
  platformFeePercent: number;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      setLoading(true);
      // TODO: Replace with actual API call to backend
      // const res = await fetch('/admin/dashboard/stats')
      // const data = await res.json()
      // setStats(data)

      // Mock data for now
      const mockStats: DashboardStats = {
        totalOrders: 150,
        completedOrders: 145,
        totalGrossValue: 15000,
        platformFeeCollected: 1500,
        platformFeePercent: 10,
      };
      setStats(mockStats);
    } catch (err) {
      console.error("Error fetching dashboard stats:", err);
      message.error("Failed to load dashboard statistics");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[60vh]">
        <Spin size="large" />
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="p-8">
        <Empty
          description="No data available"
          style={{ marginTop: 48, marginBottom: 48 }}
        />
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            Admin Dashboard
          </h1>
          <p className="text-gray-600">
            Platform metrics and revenue tracking
          </p>
        </div>

        {/* Platform Fee Stats */}
        <Card className="shadow-lg">
          <PlatformFeeStats stats={stats} loading={loading} />
        </Card>

        {/* Additional Sections (TODO) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
          {/* Placeholder for additional widgets */}
          <Card className="h-48 flex items-center justify-center text-gray-400">
            <Empty
              description="Order Analytics Coming Soon"
              style={{ margin: 0 }}
            />
          </Card>

          <Card className="h-48 flex items-center justify-center text-gray-400">
            <Empty
              description="User Activity Coming Soon"
              style={{ margin: 0 }}
            />
          </Card>
        </div>
      </div>
    </div>
  );
}
