import { useEffect, useState } from "react";
import { getSellerOverview } from "../../../../api/dashboard";

export default function ShopDashboard() {
  const [overview, setOverview] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        setLoading(true);
        const sellerId = localStorage.getItem('userId');
        if (!sellerId) return;
        const res = await getSellerOverview(sellerId);
        setOverview(res?.data || res);
      } catch (e) {
        console.error('Failed to fetch shop overview', e);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  if (loading) return <div className="p-6 text-center">Loading dashboard...</div>;

  if (!overview) return <div className="p-6">No dashboard data</div>;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="p-4 bg-white rounded shadow">
        <h3 className="text-sm text-gray-500">Total Orders</h3>
        <div className="text-2xl font-bold">{overview.totalOrders ?? 0}</div>
      </div>
      <div className="p-4 bg-white rounded shadow">
        <h3 className="text-sm text-gray-500">Total Revenue</h3>
        <div className="text-2xl font-bold">{overview.totalRevenue?.toLocaleString() ?? 0} VND</div>
      </div>
      <div className="p-4 bg-white rounded shadow">
        <h3 className="text-sm text-gray-500">Active Auctions</h3>
        <div className="text-2xl font-bold">{overview.activeAuctions ?? 0}</div>
      </div>
    </div>
  );
}
