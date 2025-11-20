import { useEffect, useState } from "react";
import { getSellerOverview } from "../../../../api/dashboard";
import { auctionApi } from "../../../../api/auction";

function getSellerIdFromTokenOrStorage() {
  const byStorage = localStorage.getItem('userId');
  if (byStorage) return byStorage;

  // try stored user object
  try {
    const rawUser = localStorage.getItem('user');
    if (rawUser) {
      const parsed = JSON.parse(rawUser);
      if (parsed?.id) return parsed.id;
      if (parsed?.userId) return parsed.userId;
      if (parsed?.sub) return parsed.sub;
    }
  } catch (e) {
    // ignore parse errors
  }

  let token = localStorage.getItem('token');
  if (!token) return null;

  // strip common Bearer prefix
  if (String(token).toLowerCase().startsWith('bearer ')) token = String(token).slice(7);

  try {
    const parts = String(token).split('.');
    if (parts.length < 2) return null;
    const payload = JSON.parse(atob(parts[1]));
    return payload?.userId || payload?.id || payload?.sub || null;
  } catch (err) {
    console.warn('Failed to decode JWT to extract sellerId', err);
    return null;
  }
}

export default function ShopDashboard() {
  const [overview, setOverview] = useState<any>(null);
  const [recentAuctions, setRecentAuctions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [sellerId, setSellerId] = useState<string | null>(null);

  useEffect(() => {
    const sid = getSellerIdFromTokenOrStorage();
    setSellerId(sid);
  }, []);

  useEffect(() => {
    if (!sellerId) {
      setLoading(false);
      console.warn('ShopDashboard: no sellerId detected');
      return;
    }

    const fetch = async () => {
      try {
        setLoading(true);
        console.log('ShopDashboard: fetching overview for sellerId=', sellerId);
        const res = await getSellerOverview(sellerId);
        console.log('ShopDashboard: overview response raw=', res);
        const overviewData = res?.data || res;
        setOverview(overviewData || null);
      } catch (err) {
        console.error('Failed to fetch shop overview', err);
        setOverview(null);
      } finally {
        setLoading(false);
      }
    };

    fetch();

    // fetch recent auctions in parallel (do not block dashboard)
    (async () => {
      try {
        const resp = await auctionApi.getSellerAuctions(sellerId, 1, 5);
        console.log('ShopDashboard: recent auctions resp=', resp);
        const items = resp?.items || resp?.data?.items || resp?.data || resp || [];
        setRecentAuctions(Array.isArray(items) ? items : []);
      } catch (err) {
        console.error('Failed to fetch recent auctions', err);
        setRecentAuctions([]);
      }
    })();
  }, [sellerId]);

  if (loading) return <div className="p-6 text-center">Loading dashboard...</div>;

  if (!sellerId) return <div className="p-6">No seller identified. Please login.</div>;

  if (!overview) return <div className="p-6">No dashboard data</div>;

  const totalOrders = overview.orderCount ?? overview.totalOrders ?? 0;
  const totalRevenue = overview.totalRevenue ?? 0;
  const activeAuctions = overview.activeAuctions ?? 0;

  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="p-4 bg-white rounded shadow">
          <h3 className="text-sm text-gray-500">Total Orders</h3>
          <div className="text-2xl font-bold">{totalOrders}</div>
        </div>
        <div className="p-4 bg-white rounded shadow">
          <h3 className="text-sm text-gray-500">Total Revenue</h3>
          <div className="text-2xl font-bold">{Number(totalRevenue).toLocaleString()} VND</div>
        </div>
        <div className="p-4 bg-white rounded shadow">
          <h3 className="text-sm text-gray-500">Active Auctions</h3>
          <div className="text-2xl font-bold">{activeAuctions}</div>
        </div>
      </div>

      <div className="p-4 bg-white rounded shadow">
        <h4 className="font-semibold mb-2">Recent Auctions</h4>
        {recentAuctions.length === 0 ? (
          <div className="text-gray-500">No recent auctions. If you had auctions in the past, check "Auction Management" → "View Auction History".</div>
        ) : (
          <ul className="space-y-2">
            {recentAuctions.map((a: any) => (
              <li key={a.auctionId} className="flex justify-between items-center">
                <div>
                  <div className="font-medium">{a.title || a.productTitle || a.product?.title || a.productName || 'Untitled'}</div>
                  <div className="text-xs text-gray-500">Status: {a.status} • Ended: {a.endTime ? new Date(a.endTime).toLocaleString() : '—'}</div>
                </div>
                <div className="text-right">
                  <div className="font-semibold">{(a.currentPrice ?? a.currentBid ?? 0).toLocaleString()}</div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
