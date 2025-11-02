import React from "react";
import { useAuctionList } from "../hooks/useAuctionList";
import type { AuctionSummary } from "../api/auction";

export const AuctionList: React.FC = () => {
  const {
    auctions,
    total,
    page,
    pageSize,
    isLoading,
    error,
    hasMore,
    nextPage,
    prevPage,
    refresh,
    setStatus,
  } = useAuctionList({
    pageSize: 20,
    autoFetch: true,
  });

  const handleStatusFilter = (
    status?: "scheduled" | "live" | "ended" | "cancelled"
  ) => {
    setStatus(status);
  };

  if (error) {
    return (
      <div className="error-container">
        <h3>Lỗi</h3>
        <p>{error}</p>
        <button onClick={refresh}>Thử lại</button>
      </div>
    );
  }

  return (
    <div className="auction-list-container">
      <div className="auction-list-header">
        <h2>Danh sách đấu giá</h2>
        <div className="filter-buttons">
          <button onClick={() => handleStatusFilter()}>Tất cả</button>
          <button onClick={() => handleStatusFilter("live")}>
            Đang diễn ra
          </button>
          <button onClick={() => handleStatusFilter("scheduled")}>
            Sắp diễn ra
          </button>
          <button onClick={() => handleStatusFilter("ended")}>
            Đã kết thúc
          </button>
        </div>
        <button onClick={refresh} disabled={isLoading}>
          {isLoading ? "Đang tải..." : "Làm mới"}
        </button>
      </div>

      {isLoading && auctions.length === 0 ? (
        <div className="loading">Đang tải...</div>
      ) : (
        <>
          <div className="auction-grid">
            {auctions.map((auction: AuctionSummary) => (
              <AuctionCard key={auction.auctionId} auction={auction} />
            ))}
          </div>

          {auctions.length === 0 && (
            <div className="empty-state">
              <p>Không có phiên đấu giá nào</p>
            </div>
          )}

          <div className="pagination">
            <button onClick={prevPage} disabled={page === 1 || isLoading}>
              Trang trước
            </button>
            <span>
              Trang {page} / {Math.ceil(total / pageSize)} (Tổng: {total})
            </span>
            <button onClick={nextPage} disabled={!hasMore || isLoading}>
              Trang sau
            </button>
          </div>
        </>
      )}
    </div>
  );
};

interface AuctionCardProps {
  auction: AuctionSummary;
}

const AuctionCard: React.FC<AuctionCardProps> = ({ auction }) => {
  const getStatusBadge = (status: string) => {
    const badges: Record<string, { text: string; color: string }> = {
      live: { text: "Đang diễn ra", color: "#22c55e" },
      scheduled: { text: "Sắp diễn ra", color: "#3b82f6" },
      ended: { text: "Đã kết thúc", color: "#6b7280" },
      cancelled: { text: "Đã hủy", color: "#ef4444" },
    };
    const badge = badges[status] || { text: status, color: "#6b7280" };
    return <span style={{ color: badge.color }}>{badge.text}</span>;
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleString("vi-VN");
  };

  return (
    <div className="auction-card">
      <div className="auction-card-header">
        <h3>{auction.title}</h3>
        <div className="auction-status">{getStatusBadge(auction.status)}</div>
      </div>

      <div className="auction-card-body">
        <div className="auction-info">
          <div className="info-row">
            <span className="label">Giá hiện tại:</span>
            <span className="value price">
              {formatPrice(auction.currentPrice)}
            </span>
          </div>
          <div className="info-row">
            <span className="label">Bước giá:</span>
            <span className="value">
              {formatPrice(auction.minBidIncrement)}
            </span>
          </div>
          <div className="info-row">
            <span className="label">Bắt đầu:</span>
            <span className="value">{formatDate(auction.startTime)}</span>
          </div>
          <div className="info-row">
            <span className="label">Kết thúc:</span>
            <span className="value">{formatDate(auction.endTime)}</span>
          </div>
        </div>
      </div>

      <div className="auction-card-footer">
        <a href={`/auction/${auction.auctionId}`}>
          <button>Xem chi tiết</button>
        </a>
      </div>
    </div>
  );
};

export default AuctionList;
