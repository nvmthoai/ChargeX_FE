import { useEffect, useState } from "react";
import { Card, Table, Tag, Empty, Spin, Button, Modal, Descriptions, message } from "antd";
import { EyeOutlined, CheckCircleOutlined, CloseCircleOutlined, ClockCircleOutlined } from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";

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

export default function AuctionManager() {
  const [auctions, setAuctions] = useState<AuctionInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAuction, setSelectedAuction] = useState<AuctionInfo | null>(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);

  useEffect(() => {
    fetchSellerAuctions();
  }, []);

  const fetchSellerAuctions = async () => {
    try {
      setLoading(true);

      // Get seller ID from localStorage
      const sellerId = localStorage.getItem('userId');

      if (!sellerId) {
        message.warning("Please login to view your auctions");
        setLoading(false);
        return;
      }

      // Call backend API
      try {
        const res = await fetch(`/auction/seller/${sellerId}/managed?page=1&pageSize=20`);

        if (res.ok) {
          const response = await res.json();
          const auctionData = response.items || [];

          if (auctionData.length > 0) {
            setAuctions(auctionData);
            return;
          }
        }
      } catch (apiError) {
        console.warn("API call failed, using mock data:", apiError);
      }

      // Fallback: Mock data for development
      const mockAuctions: AuctionInfo[] = [
        {
          auctionId: "auction-001",
          productId: "prod-001",
          productName: "iPhone 15 Pro Max",
          startPrice: 100,
          buyNowPrice: 800,
          reservePrice: 700,
          currentBid: 750,
          currentWinner: {
            userId: "user-123",
            username: "john_doe",
            email: "john@example.com"
          },
          status: "sold",
          endTime: new Date(Date.now() - 86400000).toISOString(),
          createdAt: new Date(Date.now() - 604800000).toISOString(),
          totalBids: 12,
          images: ["https://via.placeholder.com/300"]
        },
        {
          auctionId: "auction-002",
          productId: "prod-002",
          productName: "Samsung Galaxy S24",
          startPrice: 80,
          reservePrice: 600,
          currentBid: 550,
          status: "failed",
          endTime: new Date(Date.now() - 172800000).toISOString(),
          createdAt: new Date(Date.now() - 1209600000).toISOString(),
          totalBids: 5,
          images: ["https://via.placeholder.com/300"]
        },
        {
          auctionId: "auction-003",
          productId: "prod-003",
          productName: "MacBook Pro 16",
          startPrice: 500,
          reservePrice: 1800,
          currentBid: 1950,
          currentWinner: {
            userId: "user-456",
            username: "jane_smith",
            email: "jane@example.com"
          },
          status: "active",
          endTime: new Date(Date.now() + 259200000).toISOString(),
          createdAt: new Date(Date.now() - 432000000).toISOString(),
          totalBids: 28,
          images: ["https://via.placeholder.com/300"]
        }
      ];
      setAuctions(mockAuctions);
    } catch (err) {
      console.error("Error fetching auctions:", err);
      message.error("Failed to load auctions");
    } finally {
      setLoading(false);
    }
  };

  const getStatusTag = (status: string) => {
    const statusConfig: Record<string, { color: string; icon: React.ReactNode; label: string }> = {
      active: {
        color: "blue",
        icon: <ClockCircleOutlined />,
        label: "Active"
      },
      sold: {
        color: "green",
        icon: <CheckCircleOutlined />,
        label: "Sold"
      },
      failed: {
        color: "red",
        icon: <CloseCircleOutlined />,
        label: "Failed (Below Reserve)"
      },
      pending: {
        color: "orange",
        icon: <ClockCircleOutlined />,
        label: "Pending"
      },
      ended: {
        color: "default",
        icon: <CheckCircleOutlined />,
        label: "Ended"
      }
    };

    const config = statusConfig[status] || statusConfig.pending;
    return <Tag icon={config.icon} color={config.color}>{config.label}</Tag>;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  const calculateTimeLeft = (endTime: string) => {
    const now = new Date().getTime();
    const end = new Date(endTime).getTime();
    const diff = end - now;

    if (diff <= 0) return "Ended";

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
    const minutes = Math.floor((diff / 1000 / 60) % 60);

    if (days > 0) return `${days}d ${hours}h`;
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
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
            <p className="font-semibold text-dark-100">{record.productName}</p>
            <p className="text-xs text-dark-400">{record.auctionId}</p>
          </div>
        </div>
      ),
      width: 280
    },
    {
      title: "Status",
      key: "status",
      render: (_, record) => getStatusTag(record.status),
      width: 140
    },
    {
      title: "Current Bid",
      key: "currentBid",
      render: (_, record) => (
        <div>
          <p className="font-semibold text-green-400">${record.currentBid.toFixed(2)}</p>
          <p className="text-xs text-dark-400">Reserve: ${record.reservePrice.toFixed(2)}</p>
        </div>
      ),
      width: 130
    },
    {
      title: "Bids",
      key: "totalBids",
      render: (_, record) => (
        <span className="text-dark-200 font-semibold">{record.totalBids}</span>
      ),
      width: 80
    },
    {
      title: "Time",
      key: "endTime",
      render: (_, record) => {
        const timeLeft = calculateTimeLeft(record.endTime);
        const isEnded = new Date(record.endTime).getTime() <= new Date().getTime();
        return (
          <div>
            <p className={`font-semibold ${isEnded ? "text-red-400" : "text-ocean-400"}`}>
              {timeLeft}
            </p>
            <p className="text-xs text-dark-400">{formatDate(record.endTime)}</p>
          </div>
        );
      },
      width: 150
    },
    {
      title: "Winner",
      key: "winner",
      render: (_, record) => {
        if (record.status === "sold" && record.currentWinner) {
          return (
            <div>
              <p className="font-semibold text-dark-100">{record.currentWinner.username}</p>
              <p className="text-xs text-dark-400">{record.currentWinner.email}</p>
            </div>
          );
        }
        if (record.status === "failed") {
          return <span className="text-red-400 text-sm">No winner</span>;
        }
        if (record.status === "active" && record.currentWinner) {
          return (
            <div className="text-sm">
              <p className="text-dark-200">Leading: {record.currentWinner.username}</p>
            </div>
          );
        }
        return <span className="text-dark-400 text-sm">—</span>;
      },
      width: 160
    },
    {
      title: "Action",
      key: "action",
      render: (_, record) => (
        <Button
          type="primary"
          size="small"
          icon={<EyeOutlined />}
          onClick={() => {
            setSelectedAuction(record);
            setDetailModalOpen(true);
          }}
        >
          Details
        </Button>
      ),
      width: 100
    }
  ];

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[400px]">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-dark-100 mb-2">Auction Management</h2>
        <p className="text-dark-300">Monitor your active auctions and view auction results</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-blue-500/10 to-blue-600/10 border border-blue-500/20">
          <div>
            <p className="text-dark-300 text-sm mb-1">Total Auctions</p>
            <p className="text-3xl font-bold text-blue-400">{auctions.length}</p>
          </div>
        </Card>

        <Card className="bg-gradient-to-br from-green-500/10 to-green-600/10 border border-green-500/20">
          <div>
            <p className="text-dark-300 text-sm mb-1">Sold</p>
            <p className="text-3xl font-bold text-green-400">
              {auctions.filter(a => a.status === "sold").length}
            </p>
          </div>
        </Card>

        <Card className="bg-gradient-to-br from-orange-500/10 to-orange-600/10 border border-orange-500/20">
          <div>
            <p className="text-dark-300 text-sm mb-1">Active</p>
            <p className="text-3xl font-bold text-orange-400">
              {auctions.filter(a => a.status === "active").length}
            </p>
          </div>
        </Card>

        <Card className="bg-gradient-to-br from-red-500/10 to-red-600/10 border border-red-500/20">
          <div>
            <p className="text-dark-300 text-sm mb-1">Failed</p>
            <p className="text-3xl font-bold text-red-400">
              {auctions.filter(a => a.status === "failed").length}
            </p>
          </div>
        </Card>
      </div>

      {/* Auctions Table */}
      <Card className="border border-ocean-800/20">
        {auctions.length > 0 ? (
          <Table
            columns={columns}
            dataSource={auctions}
            rowKey="auctionId"
            pagination={{ pageSize: 10 }}
            scroll={{ x: 1200 }}
            className="bg-transparent"
          />
        ) : (
          <Empty description="No auctions yet" />
        )}
      </Card>

      {/* Detail Modal */}
      <Modal
        title={`Auction Details - ${selectedAuction?.productName}`}
        open={detailModalOpen}
        onCancel={() => setDetailModalOpen(false)}
        footer={null}
        width={700}
      >
        {selectedAuction && (
          <div className="space-y-4">
            {/* Product Image */}
            <div className="flex justify-center">
              <img
                src={selectedAuction.images?.[0] || "https://via.placeholder.com/400"}
                alt={selectedAuction.productName}
                className="max-w-sm rounded-lg"
              />
            </div>

            {/* Auction Information */}
            <Descriptions column={2} bordered>
              <Descriptions.Item label="Status" span={2}>
                {getStatusTag(selectedAuction.status)}
              </Descriptions.Item>
              <Descriptions.Item label="Auction ID">
                {selectedAuction.auctionId}
              </Descriptions.Item>
              <Descriptions.Item label="Product ID">
                {selectedAuction.productId}
              </Descriptions.Item>
              <Descriptions.Item label="Starting Price">
                <span className="text-ocean-400 font-semibold">${selectedAuction.startPrice.toFixed(2)}</span>
              </Descriptions.Item>
              <Descriptions.Item label="Reserve Price">
                <span className="text-orange-400 font-semibold">${selectedAuction.reservePrice.toFixed(2)}</span>
              </Descriptions.Item>
              <Descriptions.Item label="Current Bid" span={2}>
                <span className="text-green-400 font-bold text-lg">${selectedAuction.currentBid.toFixed(2)}</span>
              </Descriptions.Item>
              {selectedAuction.buyNowPrice && (
                <Descriptions.Item label="Buy Now Price" span={2}>
                  <span className="text-energy-400 font-semibold">${selectedAuction.buyNowPrice.toFixed(2)}</span>
                </Descriptions.Item>
              )}
              <Descriptions.Item label="Total Bids">
                {selectedAuction.totalBids}
              </Descriptions.Item>
              <Descriptions.Item label="Created">
                {formatDate(selectedAuction.createdAt)}
              </Descriptions.Item>
              <Descriptions.Item label="Ends At" span={2}>
                {formatDate(selectedAuction.endTime)}
              </Descriptions.Item>

              {/* Winner Information */}
              {selectedAuction.status === "sold" && selectedAuction.currentWinner && (
                <>
                  <Descriptions.Item label="Winning Bid" span={2}>
                    <span className="text-green-400 font-bold">${selectedAuction.currentBid.toFixed(2)}</span>
                  </Descriptions.Item>
                  <Descriptions.Item label="Winner Name">
                    {selectedAuction.currentWinner.username}
                  </Descriptions.Item>
                  <Descriptions.Item label="Winner Email">
                    {selectedAuction.currentWinner.email}
                  </Descriptions.Item>
                  <Descriptions.Item label="Result" span={2}>
                    <Tag icon={<CheckCircleOutlined />} color="green">
                      Reserve Met & Sold Successfully
                    </Tag>
                  </Descriptions.Item>
                </>
              )}

              {/* Failed Auction Information */}
              {selectedAuction.status === "failed" && (
                <>
                  <Descriptions.Item label="Final Bid" span={2}>
                    <span className="text-red-400 font-bold">${selectedAuction.currentBid.toFixed(2)}</span>
                  </Descriptions.Item>
                  <Descriptions.Item label="Difference" span={2}>
                    <span className="text-red-400">
                      ${(selectedAuction.reservePrice - selectedAuction.currentBid).toFixed(2)} below reserve
                    </span>
                  </Descriptions.Item>
                  <Descriptions.Item label="Result" span={2}>
                    <Tag icon={<CloseCircleOutlined />} color="red">
                      Auction Failed - Reserve Price Not Met
                    </Tag>
                  </Descriptions.Item>
                </>
              )}

              {/* Active Auction Information */}
              {selectedAuction.status === "active" && selectedAuction.currentWinner && (
                <>
                  <Descriptions.Item label="Current Leader">
                    {selectedAuction.currentWinner.username}
                  </Descriptions.Item>
                  <Descriptions.Item label="Leader Email">
                    {selectedAuction.currentWinner.email}
                  </Descriptions.Item>
                  <Descriptions.Item label="Time Remaining" span={2}>
                    <span className="text-ocean-400 font-semibold">
                      {calculateTimeLeft(selectedAuction.endTime)}
                    </span>
                  </Descriptions.Item>
                </>
              )}
            </Descriptions>
          </div>
        )}
      </Modal>
    </div>
  );
}
