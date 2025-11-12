import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button, Tag, Spin, Empty, message } from "antd";
import { EyeOutlined, ShoppingOutlined, ClockCircleOutlined } from "@ant-design/icons";
import { auctionApi } from "../../../../api/auction";
import { useAuth } from "../../../hooks/AuthContext";
import axiosInstance from "../../../config/axios";
import "./MyAuctions.css";
import dayjs from "dayjs";

interface AuctionWonItem {
  auctionId: string;
  productId: string;
  title: string;
  status: string;
  startTime: string;
  endTime: string;
  currentPrice: number;
  minBidIncrement: number;
  winnerId?: string | null;
  orderId?: string | null;
  imageUrls?: string[];
}

type AuctionStatus = 'scheduled' | 'live' | 'ended' | 'cancelled'

interface AuctionSummaryLoose {
  auctionId: string;
  productId: string;
  title: string;
  status: string;
  startTime: string;
  endTime: string;
  currentPrice: number;
  minBidIncrement: number;
  imageUrls?: string[];
}

interface UserAuction extends AuctionSummaryLoose {
  wonByUser?: boolean;
  orderId?: string | null;
  status: AuctionStatus;
}

export default function MyAuctions() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [auctions, setAuctions] = useState<UserAuction[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "won" | "participated" | "ended">("all");
  const [paymentLoading, setPaymentLoading] = useState<string | null>(null);

  // Fetch auctions where user participated or won
  useEffect(() => {
    const fetchMyAuctions = async () => {
      if (!user?.sub) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        console.log("📦 [MyAuctions] Fetching won auctions for user:", user.sub);

        // Use backend endpoint that returns auctions the user won (includes orderId when available)
        const resp = await auctionApi.getUserWonAuctions(user.sub, 1, 100);
        const items = resp?.items || [];

        const mapped: UserAuction[] = (items as AuctionWonItem[]).map((it) => ({
          auctionId: it.auctionId,
          productId: it.productId,
          title: it.title,
          status: (['scheduled','live','ended','cancelled'].includes(it.status) ? it.status : 'ended') as AuctionStatus,
          startTime: it.startTime,
          endTime: it.endTime,
          currentPrice: it.currentPrice,
          minBidIncrement: it.minBidIncrement,
          imageUrls: it.imageUrls,
          wonByUser: it.winnerId === user.sub,
          orderId: it.orderId ?? null
        }));

        setAuctions(mapped);
      } catch (err: unknown) {
        console.error("❌ Failed to fetch won auctions:", err);
        message.error("Failed to load auction list!");
      } finally {
        setLoading(false);
      }
    };

    fetchMyAuctions();
  }, [user?.sub]);

  // Fetch orderId for a won auction to proceed to payment
  const fetchOrderIdForAuction = async (auctionId: string): Promise<string | null> => {
    try {
      console.log("📦 [MyAuctions] Fetching order for auction:", auctionId);
      const res = await axiosInstance.get("/orders", { params: { auctionId } });
      const data = res.data?.data?.data || res.data?.data || res.data;

      if (Array.isArray(data) && data.length > 0) {
        console.log("✅ [MyAuctions] Order found:", data[0].orderId);
        return data[0].orderId || null;
      }

      console.warn("⚠️ [MyAuctions] No order found for auction:", auctionId);
      return null;
    } catch (err: unknown) {
      console.error("❌ [MyAuctions] Failed to fetch orderId:", err);
      message.error("Failed to fetch order information. Please try again.");
      return null;
    }
  };

  // Handle payment button click
  const handlePayNow = async (auction: UserAuction) => {
    if (!auction.auctionId) return;

    setPaymentLoading(auction.auctionId);
    try {
      let orderId: string | null | undefined = auction.orderId ?? null;

      // If orderId is not cached, fetch it from API
      if (!orderId) {
        console.log("🔍 [MyAuctions] Fetching orderId for auction:", auction.auctionId);
        orderId = await fetchOrderIdForAuction(auction.auctionId);
      }

      if (orderId) {
        console.log("🔗 [MyAuctions] Navigating to payment with orderId:", orderId);
        message.success("Proceeding to payment...");

        // Small delay to let user see the success message
        setTimeout(() => {
          navigate(`/payment?orderId=${orderId}`);
        }, 500);
      } else {
        console.warn("⚠️ [MyAuctions] Cannot proceed to payment: orderId not found");
        message.error("Cannot find order. Please contact support.");
      }
    } catch (error: unknown) {
      console.error("❌ [MyAuctions] Error during payment:", error);
      message.error("An error occurred. Please try again.");
    } finally {
      setPaymentLoading(null);
    }
  };

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
      minimumFractionDigits: 0,
    }).format(amount);

  const formatCountdown = (endTime: string) => {
    const end = new Date(endTime).getTime();
    const now = Date.now();
    const distance = Math.max(0, end - now);

    if (distance <= 0) return "Kết thúc";

    const seconds = Math.floor((distance / 1000) % 60);
    const minutes = Math.floor((distance / 1000 / 60) % 60);
    const hours = Math.floor(distance / 1000 / 60 / 60);

    if (hours > 0) return `${hours}h ${minutes}m`;
    if (minutes > 0) return `${minutes}m ${seconds}s`;
    return `${seconds}s`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "live":
        return "green";
      case "scheduled":
        return "blue";
      case "ended":
        return "default";
      case "cancelled":
        return "red";
      default:
        return "default";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "live":
        return "Live";
      case "scheduled":
        return "Upcoming";
      case "ended":
        return "Ended";
      case "cancelled":
        return "Cancelled";
      default:
        return status;
    }
  };

  const filteredAuctions = auctions.filter((auction) => {
    const isEnded = auction.status === "ended";
    const isWon = auction.wonByUser;

    switch (filter) {
      case "won":
        return isEnded && isWon;
      case "participated":
        return !isEnded;
      case "ended":
        return isEnded;
      default:
        return true;
    }
  });

  if (loading) {
    return (
      <div className="my-auctions-container">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div className="my-auctions-container">
      <div className="auctions-header">
        <h2>My Auctions</h2>
        <p className="subtitle">View auctions you participated in or won</p>
      </div>

      <div className="filter-tabs">
        <button
          className={`filter-btn ${filter === "all" ? "active" : ""}`}
          onClick={() => setFilter("all")}
        >
          All ({auctions.length})
        </button>
        <button
          className={`filter-btn ${filter === "won" ? "active" : ""}`}
          onClick={() => setFilter("won")}
        >
          Won ({auctions.filter((a) => a.wonByUser && a.status === "ended").length})
        </button>
        <button
          className={`filter-btn ${filter === "participated" ? "active" : ""}`}
          onClick={() => setFilter("participated")}
        >
          Participating ({auctions.filter((a) => a.status !== "ended").length})
        </button>
        <button
          className={`filter-btn ${filter === "ended" ? "active" : ""}`}
          onClick={() => setFilter("ended")}
        >
          Ended ({auctions.filter((a) => a.status === "ended").length})
        </button>
      </div>

      {filteredAuctions.length === 0 ? (
        <Empty
          description="No auctions found"
          style={{ marginTop: "40px" }}
        />
      ) : (
        <div className="auctions-grid">
          {filteredAuctions.map((auction) => (
            <div key={auction.auctionId} className="auction-card-item">
              {/* Image */}
              <div className="card-image-wrapper">
                {auction.imageUrls && auction.imageUrls[0] ? (
                  <img
                    src={auction.imageUrls[0]}
                    alt={auction.title}
                    className="card-image"
                  />
                ) : (
                  <div className="card-image-placeholder">
                    <ShoppingOutlined />
                  </div>
                )}
                <div className="status-badge">
                  <Tag color={getStatusColor(auction.status)}>
                    {getStatusLabel(auction.status)}
                  </Tag>
                </div>
              </div>

              {/* Info */}
              <div className="card-info">
                <h3 className="card-title">{auction.title}</h3>

                {/* Price & Bid */}
                <div className="card-details">
                  <div className="detail-item">
                    <span className="label">Current Price:</span>
                    <span className="value price">
                      {formatCurrency(auction.currentPrice)}
                    </span>
                  </div>
                  <div className="detail-item">
                    <span className="label">Min Increment:</span>
                    <span className="value">
                      {formatCurrency(auction.minBidIncrement)}
                    </span>
                  </div>
                </div>

                {/* Time */}
                <div className="time-info">
                  {auction.status === "ended" ? (
                    <span className="end-date">
                      Ended: {dayjs(auction.endTime).format("DD/MM/YYYY HH:mm")}
                    </span>
                  ) : (
                    <div className="countdown-box">
                      <ClockCircleOutlined />
                      <span>Remaining: {formatCountdown(auction.endTime)}</span>
                    </div>
                  )}
                </div>

                {/* Winner Badge */}
                {auction.wonByUser && auction.status === "ended" && (
                  <div className="winner-badge">
                    🏆 You won this auction!
                  </div>
                )}

                {/* Actions */}
                <div className="card-actions">
                  <Button
                    type="primary"
                    size="small"
                    icon={<EyeOutlined />}
                    onClick={() => navigate(`/auction/${auction.auctionId}`)}
                    className="btn-view"
                  >
                    View Details
                  </Button>

                  {auction.wonByUser && auction.status === "ended" && (
                    <Button
                      type="primary"
                      danger={false}
                      size="small"
                      loading={paymentLoading === auction.auctionId}
                      disabled={paymentLoading !== null}
                      onClick={() => handlePayNow(auction)}
                      className="btn-pay"
                    >
                      {paymentLoading === auction.auctionId ? "Processing..." : "Pay Now"}
                    </Button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
