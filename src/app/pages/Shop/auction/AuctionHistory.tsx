import { useEffect, useState } from "react";
import { Table, Tag, Spin, message, Select } from "antd";
import type { ColumnsType } from "antd/es/table";
import { auctionApi } from "../../../../api/auction";

interface AuctionInfo {
  auctionId: string;
  productId: string;
  productName: string;
  startPrice: number;
  buyNowPrice?: number;
  reservePrice: number;
  currentBid: number;
  currentWinner?: {
    userId: string;
    username: string;
    email: string;
  };
  status: "pending" | "active" | "ended" | "sold" | "failed";
  endTime: string;
  createdAt: string;
  totalBids: number;
  images?: string[];
}

export default function AuctionHistory() {
  const [auctions, setAuctions] = useState<AuctionInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [total, setTotal] = useState(0);
  const [statusFilter, setStatusFilter] = useState<string | undefined>(undefined);

  useEffect(() => {
    fetchHistory(page, pageSize, statusFilter);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, pageSize, statusFilter]);

  const fetchHistory = async (p = 1, ps = 10, status?: string) => {
    try {
      setLoading(true);
      const sellerId = localStorage.getItem("userId");
      if (!sellerId) {
        message.warning("Please login to view auction history");
        setLoading(false);
        return;
      }
      const resp = await auctionApi.getSellerAuctions(sellerId, p, ps);
      const items = resp?.items || resp?.data?.items || resp?.data || resp || [];

      // Filter for history statuses
      const filtered = Array.isArray(items)
        ? items.filter((a: any) => ["ended", "sold", "failed"].includes(a.status))
        : [];

      // If status filter applied, refine
      const final = status ? filtered.filter((a: any) => a.status === status) : filtered;

      setAuctions(final);
      // try to infer total
      const metaTotal = resp?.meta?.total || (Array.isArray(items) ? items.length : final.length);
      setTotal(metaTotal);
    } catch (error) {
      console.error("Failed to load auction history", error);
      message.error("Failed to load auction history");
    } finally {
      setLoading(false);
    }
  };

  const columns: ColumnsType<AuctionInfo> = [
    {
      title: "Product",
      key: "productName",
      render: (_, record) => (
        <div className="flex items-center gap-2">
          <img
            src={record.images?.[0] || "https://via.placeholder.com/50"}
            alt={record.productName}
            className="w-12 h-12 rounded object-cover"
          />
          <div>
            <p className="font-semibold text-gray-900">{record.productName}</p>
            <p className="text-xs text-gray-500">{record.auctionId}</p>
          </div>
        </div>
      ),
      width: 280
    },
    {
      title: "Status",
      key: "status",
      render: (_, record) => {
        const map: Record<string, { color: string; label: string }> = {
          sold: { color: "green", label: "Sold" },
          failed: { color: "red", label: "Failed" },
          ended: { color: "default", label: "Ended" }
        };
        const cfg = map[record.status] || { color: "default", label: record.status };
        return <Tag color={cfg.color}>{cfg.label}</Tag>;
      },
      width: 120
    },
    {
      title: "Final Price",
      key: "currentBid",
      render: (_, record) => (
        <div>
          <p className="font-semibold text-green-600">{Number(record.currentBid).toLocaleString()}</p>
          <p className="text-xs text-gray-500">Reserve: {Number(record.reservePrice).toLocaleString()}</p>
        </div>
      ),
      width: 150
    },
    {
      title: "Bids",
      key: "totalBids",
      render: (_, record) => <span className="text-gray-700 font-semibold">{record.totalBids}</span>,
      width: 80
    },
    {
      title: "Ended At",
      key: "endTime",
      render: (_, record) => (
        <div>
          <p className="text-sm">{new Date(record.endTime).toLocaleString()}</p>
        </div>
      ),
      width: 200
    }
  ];

  if (loading) return <div className="p-6 text-center"><Spin size="large" /></div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">Auction History</h3>
        <div className="flex items-center gap-2">
          <Select
            placeholder="Filter by status"
            allowClear
            style={{ width: 180 }}
            onChange={(val) => {
              setStatusFilter(val as string | undefined);
              setPage(1);
            }}
            options={[
              { label: "Sold", value: "sold" },
              { label: "Failed", value: "failed" },
              { label: "Ended", value: "ended" }
            ]}
          />
        </div>
      </div>

      <Table
        columns={columns}
        dataSource={auctions}
        rowKey="auctionId"
        pagination={{
          current: page,
          pageSize: pageSize,
          total: total,
          onChange: (p, ps) => {
            setPage(p);
            setPageSize(ps || pageSize);
          }
        }}
        scroll={{ x: 1000 }}
      />
    </div>
  );
}
