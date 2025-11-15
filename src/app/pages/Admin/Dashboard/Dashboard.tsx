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
      <div className="p-6">
        <Empty
          description="No data available"
          styles={{ description: { color: 'rgba(209, 213, 219, 1)' } }}
        />
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-dark-100 mb-2">
            Admin Dashboard
          </h1>
          <p className="text-dark-300">
            Platform metrics and revenue tracking
          </p>
        </div>

        {/* Platform Fee Stats */}
        <PlatformFeeStats stats={stats} loading={loading} />

        {/* Additional Sections (TODO) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
          {/* Placeholder for additional widgets */}
          <Card 
            styles={{ body: { padding: '0', height: '192px', display: 'flex', alignItems: 'center', justifyContent: 'center' } }}
            style={{
              background: 'rgba(31, 41, 55, 0.8)',
              border: '1px solid rgba(30, 58, 138, 0.3)',
              borderRadius: '12px',
            }}
            className="backdrop-blur-sm"
          >
            <Empty
              description="Order Analytics Coming Soon"
              styles={{ description: { color: 'rgba(156, 163, 175, 1)' } }}
            />
          </Card>

          <Card 
            styles={{ body: { padding: '0', height: '192px', display: 'flex', alignItems: 'center', justifyContent: 'center' } }}
            style={{
              background: 'rgba(31, 41, 55, 0.8)',
              border: '1px solid rgba(30, 58, 138, 0.3)',
              borderRadius: '12px',
            }}
            className="backdrop-blur-sm"
          >
            <Empty
              description="User Activity Coming Soon"
              styles={{ description: { color: 'rgba(156, 163, 175, 1)' } }}
            />
          </Card>
        </div>
      </div>
    </div>
  );
}
