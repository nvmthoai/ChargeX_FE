import React, { useState, useEffect, useRef } from "react";
import { useAuction } from "../hooks/useAuction";
import { userApi } from "../api/user/api";

interface AuctionRoomProps {
  auctionId: string;
  userId?: string;
}

export const AuctionRoom: React.FC<AuctionRoomProps> = ({
  auctionId,
  userId,
}) => {
  const {
    auctionState,
    auctionDetail,
    isConnected,
    isLoading,
    error,
    placeBid,
    buyNow,
    refresh,
  } = useAuction({
    auctionId,
    userId,
    autoConnect: true,
  });

  const [bidAmount, setBidAmount] = useState<string>("");
  const [timeRemaining, setTimeRemaining] = useState<string>("");
  const [ownerName, setOwnerName] = useState<string>("");
  const [winnerName, setWinnerName] = useState<string>("");
  const offsetRef = useRef<number>(0);

  // Fetch owner name
  useEffect(() => {
    const fetchOwnerName = async () => {
      if (!auctionDetail) return;
      
      const sellerId = auctionDetail.sellerId || auctionDetail.product.sellerId;
      if (!sellerId) {
        setOwnerName("Người bán");
        return;
      }
      
      const user = await userApi.getUserById(sellerId);
      if (user) {
        setOwnerName(user.fullName || user.email || "Người bán");
      } else {
        // Fallback to showing partial user ID if API fails
        setOwnerName(`User ${sellerId.substring(0, 8)}`);
      }
    };
    
    fetchOwnerName();
  }, [auctionDetail]);

  // Fetch winner name
  useEffect(() => {
    const fetchWinnerName = async () => {
      if (!auctionDetail?.winnerId) {
        setWinnerName("");
        return;
      }
      
      const user = await userApi.getUserById(auctionDetail.winnerId);
      if (user) {
        setWinnerName(user.fullName || user.email || "Người thắng");
      } else {
        // Fallback to showing partial user ID if API fails
        setWinnerName(`User ${auctionDetail.winnerId.substring(0, 8)}`);
      }
    };
    
    fetchWinnerName();
  }, [auctionDetail?.winnerId]);

  // Update offset whenever serverNow changes (from WebSocket events or initial load)
  useEffect(() => {
    if (!auctionDetail?.endTime) return

    const serverNowStr = (auctionDetail as any).serverNow
    if (serverNowStr) {
      offsetRef.current = Date.parse(serverNowStr) - Date.now()
    }
  }, [auctionDetail?.serverNow])

  // Calculate time remaining - runs every second
  useEffect(() => {
    if (!auctionDetail?.endTime) return

    const endTs = Date.parse(auctionDetail.endTime)

    const tick = () => {
      const now = Date.now() + offsetRef.current
      const distance = endTs - now

      if (distance < 0) {
        setTimeRemaining('Đã kết thúc')
        return
      }

      const hours = Math.floor(distance / (1000 * 60 * 60))
      const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60))
      const seconds = Math.floor((distance % (1000 * 60)) / 1000)

      setTimeRemaining(
        `${hours}:${minutes.toString().padStart(2, '0')}:${seconds
          .toString()
          .padStart(2, '0')}`
      )
    }

    // Run immediately and then on interval
    tick()
    const interval = setInterval(tick, 1000)

    return () => clearInterval(interval)
  }, [auctionDetail?.endTime])

  const handlePlaceBid = () => {
    const amount = parseFloat(bidAmount);
    if (isNaN(amount) || amount <= 0) {
      alert("Vui lòng nhập số tiền hợp lệ");
      return;
    }

    if (
      auctionDetail &&
      amount < auctionDetail.currentPrice + auctionDetail.minBidIncrement
    ) {
      alert(
        `Giá đặt phải lớn hơn hoặc bằng ${formatPrice(
          auctionDetail.currentPrice + auctionDetail.minBidIncrement
        )}`
      );
      return;
    }

    placeBid(amount);
    setBidAmount("");
  };

  const handleBuyNow = async () => {
    if (window.confirm("Bạn có chắc muốn mua ngay sản phẩm này?")) {
      await buyNow();
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  };

  const formatDate = (date: string) => {
    // Ensure input ISO string parsed as UTC then shown in local timezone
    try {
      const dt = new Date(date)
      return dt.toLocaleString('vi-VN', { hour12: false })
    } catch (e) {
      return date
    }
  };

  if (isLoading) {
    return <div className="loading-container">Đang tải...</div>;
  }

  if (error) {
    return (
      <div className="error-container">
        <h3>Lỗi</h3>
        <p>{error}</p>
        <button onClick={refresh}>Thử lại</button>
      </div>
    );
  }

  if (!auctionDetail) {
    return <div className="error-container">Không tìm thấy phiên đấu giá</div>;
  }

  const currentPrice = auctionState?.currentPrice ?? auctionDetail.currentPrice;
  const isLive = auctionDetail.status === "live";
  const hasEnded = auctionDetail.status === "ended";

  return (
    <div className="auction-room-container">
      {/* Connection Status */}
      <div
        className={`connection-status ${
          isConnected ? "connected" : "disconnected"
        }`}
      >
        {isConnected ? "🟢 Đã kết nối" : "🔴 Mất kết nối"}
      </div>

      {/* Product Info */}
      <div className="auction-product-info">
        <div className="product-images">
          {(auctionDetail.product.images || auctionDetail.product.imageUrls || []).map((img: string, idx: number) => (
            <img key={idx} src={img} alt={`Product ${idx + 1}`} />
          ))}
        </div>
        <div>
          <h1>{auctionDetail.product.title}</h1>
          {ownerName && (
            <div className="owner-info">
              <strong>Người sở hữu:</strong> {ownerName}
            </div>
          )}
          <p>{auctionDetail.product.description}</p>
        </div>
      </div>

      {/* Auction Status */}
      <div className="auction-status-panel">
        <div className="status-badge">
          <span className={`badge ${auctionDetail.status}`}>
            {auctionDetail.status === "live" && "🔴 Đang diễn ra"}
            {auctionDetail.status === "scheduled" && "⏰ Sắp diễn ra"}
            {auctionDetail.status === "ended" && "✅ Đã kết thúc"}
            {auctionDetail.status === "cancelled" && "❌ Đã hủy"}
          </span>
        </div>

        {isLive && (
          <div className="time-remaining">
            <h3>Thời gian còn lại</h3>
            <div className="countdown">{timeRemaining}</div>
          </div>
        )}
      </div>

      {/* Price Info */}
      <div className="auction-price-panel">
        <div className="current-price">
          <h2>Giá hiện tại</h2>
          <div className="price-value">{formatPrice(currentPrice)}</div>
          <div className="bid-count">{auctionDetail.bidCount} lượt đặt giá</div>
        </div>

        <div className="price-details">
          <div className="detail-row">
            <span>Giá khởi điểm:</span>
            <span>{formatPrice(auctionDetail.startingPrice)}</span>
          </div>
          <div className="detail-row">
            <span>Bước giá:</span>
            <span>{formatPrice(auctionDetail.minBidIncrement)}</span>
          </div>
          {auctionDetail.buyNowPrice && (
            <div className="detail-row">
              <span>Giá mua ngay:</span>
              <span>{formatPrice(auctionDetail.buyNowPrice)}</span>
            </div>
          )}
          <div className="detail-row">
            <span>Bắt đầu:</span>
            <span>{formatDate(auctionDetail.startTime)}</span>
          </div>
          <div className="detail-row">
            <span>Kết thúc:</span>
            <span>{formatDate(auctionDetail.endTime)}</span>
          </div>
        </div>
      </div>

      {/* Bidding Panel */}
      {isLive && !hasEnded && (
        <div className="bidding-panel">
          <h3>Đặt giá</h3>
          <div className="bid-input-group">
            <input
              type="number"
              value={bidAmount}
              onChange={(e) => setBidAmount(e.target.value)}
              placeholder={`Tối thiểu: ${formatPrice(
                currentPrice + auctionDetail.minBidIncrement
              )}`}
              min={currentPrice + auctionDetail.minBidIncrement}
              step={auctionDetail.minBidIncrement}
            />
            <button onClick={handlePlaceBid} disabled={!isConnected}>
              Đặt giá
            </button>
          </div>

          <div className="quick-bid-buttons">
            <button
              onClick={() =>
                setBidAmount(
                  (currentPrice + auctionDetail.minBidIncrement).toString()
                )
              }
            >
              +{formatPrice(auctionDetail.minBidIncrement)}
            </button>
            <button
              onClick={() =>
                setBidAmount(
                  (currentPrice + auctionDetail.minBidIncrement * 2).toString()
                )
              }
            >
              +{formatPrice(auctionDetail.minBidIncrement * 2)}
            </button>
            <button
              onClick={() =>
                setBidAmount(
                  (currentPrice + auctionDetail.minBidIncrement * 5).toString()
                )
              }
            >
              +{formatPrice(auctionDetail.minBidIncrement * 5)}
            </button>
          </div>

          {auctionDetail.buyNowPrice && (
            <div className="buy-now-section">
              <button className="buy-now-button" onClick={handleBuyNow}>
                Mua ngay - {formatPrice(auctionDetail.buyNowPrice)}
              </button>
            </div>
          )}
        </div>
      )}

      {/* Winner Info */}
      {hasEnded && auctionDetail.winnerId && (
        <div className="winner-panel">
          <h3>🏆 Người thắng cuộc</h3>
          <p>Người thắng: {winnerName || "Đang tải..."}</p>
          <p>Giá cuối: {formatPrice(currentPrice)}</p>
        </div>
      )}
    </div>
  );
};

export default AuctionRoom;
