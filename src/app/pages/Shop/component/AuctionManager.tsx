
import { useEffect, useState } from "react";
import { Table, Tag, Spin, Button, Modal, Descriptions, message } from "antd";
import { EyeOutlined, CheckCircleOutlined, CloseCircleOutlined, ClockCircleOutlined } from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";
import { auctionApi } from "../../../../api/auction";
import { useNavigate } from 'react-router-dom';

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
  const navigate = useNavigate();
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

      // Call backend API via auctionApi
      try {
        const resp = await auctionApi.getSellerAuctions(sellerId, 1, 20);
        const auctionData = resp?.items || resp?.data?.items || [];

        if (auctionData.length > 0) {
          setAuctions(auctionData);
          setLoading(false);
          return;
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
      render: (_, record) => getStatusTag(record.status),
      width: 140
    },
    {
      title: "Current Price",
      key: "currentBid",
      render: (_, record) => (
        <div>
          <p className="font-semibold text-green-600">${record.currentBid.toFixed(2)}</p>
          <p className="text-xs text-gray-500">Reserve: ${record.reservePrice.toFixed(2)}</p>
        </div>
      ),
      width: 130
    },
    {
      title: "Bids",
      key: "totalBids",
      render: (_, record) => (
        <span className="text-gray-700 font-semibold">{record.totalBids}</span>
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
            <p className={`font-semibold ${isEnded ? "text-red-600" : "text-blue-600"}`}>
              {timeLeft}
            </p>
            <p className="text-xs text-gray-500">{formatDate(record.endTime)}</p>
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
              <p className="font-semibold text-gray-900">{record.currentWinner.username}</p>
              <p className="text-xs text-gray-500">{record.currentWinner.email}</p>
            </div>
          );
        }
        if (record.status === "failed") {
          return <span className="text-red-600 text-sm">Không có</span>;
        }
        if (record.status === "active" && record.currentWinner) {
          return (
            <div className="text-sm">
              <p className="text-gray-700">Đang dẫn: {record.currentWinner.username}</p>
            </div>
          );
        }
        return <span className="text-gray-500 text-sm">—</span>;
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
      <div className="border border-dashed border-gray-300 rounded-xl p-8 bg-white text-gray-500 text-center shadow-sm">
        <div className="flex justify-center items-center h-[400px]">
          <Spin size="large" />
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-end mb-4">
        <Button
          onClick={() => navigate('/shop/auction/history')}
          type="default"
        >
          View Auction History
        </Button>
      </div>
      <div className="border border-dashed border-gray-300 rounded-xl p-8 bg-white text-gray-500 text-center shadow-sm">
        {auctions.length > 0 ? (
          <div className="text-left">
            <Table
              columns={columns}
              dataSource={auctions}
              rowKey="auctionId"
              pagination={{ pageSize: 10 }}
              scroll={{ x: 1200 }}
              className="bg-transparent"
            />
          </div>
        ) : (
          <div className="p-12 text-center text-gray-500">
            <p>Chưa có đấu giá nào được đăng.</p>
          </div>
        )}
      </div>

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
