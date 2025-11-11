import { useState, useEffect, useCallback } from "react";
import { Table, Button, Input, Space, Tag, Spin } from "antd";
import "./AuctionLiveManagement.css";
import "../NavigationBar/NavigationBar.css";
import useAuction from "../../../hooks/useAuction";
import Pagination from "../../../components/Pagination/Pagination";

export default function AuctionLiveManagement() {
  const { getAuctions, createLive, loading } = useAuction();
  const [allAuctions, setAllAuctions] = useState<Record<string, any>[]>([]);
  const [auctions, setAuctions] = useState<Record<string, any>[]>([]);
  const [searchText, setSearchText] = useState("");
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0 });

  // Fetch summaries from backend. Do NOT include pagination in deps to avoid loop.
  const fetchAuctions = useCallback(async () => {
    const data = await getAuctions();
    if (!data || !Array.isArray(data)) return;

    let filtered = data as Array<Record<string, any>>;
    if (searchText) {
      filtered = filtered.filter((a) => String(a.title || '').toLowerCase().includes(searchText.toLowerCase()));
    }

    const withNames = filtered.map((a) => ({ ...a, sellerName: a.sellerName ?? a.sellerId ?? '' }));

    setAllAuctions(withNames);

    // Only update total if it changed to avoid re-render loops
    setPagination((p) => (p.total === withNames.length ? p : ({ ...p, total: withNames.length })));
  }, [getAuctions, searchText]);

  useEffect(() => {
    fetchAuctions();
  }, [fetchAuctions]);

  // Separate effect: compute current page slice whenever allAuctions or pagination.page/limit change
  useEffect(() => {
    const start = (pagination.page - 1) * pagination.limit;
    const end = start + pagination.limit;
    setAuctions(allAuctions.slice(start, end));
  }, [allAuctions, pagination.page, pagination.limit]);

  const handleGoLive = async (auctionId: string) => {
    const result = await createLive(auctionId);
    if (result) {
      // refresh data to reflect new live status
      await fetchAuctions();
    }
  };

  // handle page change
  const onPageChange = (page: number) => {
    setPagination((p) => ({ ...p, page }));
  };

  const auctionColumns = [
    {
      title: "Title",
      dataIndex: "title",
      key: "title",
    },
    {
      title: "Seller",
      dataIndex: "sellerName",
      key: "sellerName",
      render: (t: React.ReactNode, r: Record<string, any>) => String(t || (r.sellerId ? String(r.sellerId).slice(0,8) + '...' : '')),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status: string) => (
        <Tag color={status === "scheduled" ? "blue" : "orange"}>
          {status.toUpperCase()}
        </Tag>
      ),
    },
    {
      title: "Start Time",
      dataIndex: "startTime",
      key: "startTime",
      render: (time: string) => new Date(time).toLocaleString(),
    },
    {
      title: "End Time",
      dataIndex: "endTime",
      key: "endTime",
      render: (time: string) => new Date(time).toLocaleString(),
    },
    {
      title: "Current Price",
      dataIndex: "currentPrice",
      key: "currentPrice",
    },
    {
      title: "Action",
      key: "action",
      render: (_: React.ReactNode, record: Record<string, any>) => (
        <Button
          type="primary"
          onClick={() => handleGoLive(String(record.auctionId))}
          style={{ backgroundColor: "#fb8b24", borderColor: "#fb8b24" }}
        >
          Go Live
        </Button>
      ),
    },
  ];

  return (
    <div className="admin-container">
      <div className="section">
        <h2>Auctions</h2>
        <Space style={{ marginBottom: 16 }}>
          <Input
            placeholder="Search auctions..."
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            style={{ width: 200 }}
          />
        </Space>

        <Spin spinning={loading}>
          <Table
            columns={auctionColumns}
            dataSource={auctions}
            rowKey="auctionId"
            pagination={false}
          />
        </Spin>

        <Pagination
          currentPage={pagination.page}
          totalPages={Math.max(1, Math.ceil(pagination.total / pagination.limit))}
          onPageChange={onPageChange}
        />
      </div>
    </div>
  );
}
