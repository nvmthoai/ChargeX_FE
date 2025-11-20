import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuction } from "../hooks/useAuction";
import { userApi } from "../api/user/api";
import { auctionApi } from "../api/auction";

interface AuctionRoomProps {
  auctionId: string;
  userId?: string;
}

export const AuctionRoom: React.FC<AuctionRoomProps> = ({
  auctionId,
  userId,
}) => {
  const navigate = useNavigate();
  const {
    auctionState,
    auctionDetail,
    isConnected,
    isLoading,
    error,
    placeBid,
    buyNow,
    refresh,
    pendingBid,
  } = useAuction({
    auctionId,
    userId,
    autoConnect: true,
  });

  const [bidAmount, setBidAmount] = useState<string>("");
  const [timeRemaining, setTimeRemaining] = useState<string>("");
  const [ownerName, setOwnerName] = useState<string>("");
  const [winnerName, setWinnerName] = useState<string>("");
  const [fetchingOrder, setFetchingOrder] = useState<boolean>(false);
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

  const handlePayment = async () => {
    if (!auctionDetail?.auctionId) {
      alert("Không thể tìm thấy thông tin phiên đấu giá");
      return;
    }

    setFetchingOrder(true);
    try {
      const order = await auctionApi.getOrderByAuctionId(auctionDetail.auctionId);
      if (order && order.orderId) {
        // Navigate to payment page with order ID
        navigate(`/payment/${order.orderId}`, {
          state: {
            auctionId: auctionDetail.auctionId,
            amount: currentPrice,
            productTitle: auctionDetail.product.title
          }
        });
      } else {
        alert("Không thể tìm thấy đơn hàng cho phiên đấu giá này. Vui lòng liên hệ hỗ trợ.");
      }
    } catch (err: any) {
      console.error("Error fetching order:", err);
      alert("Lỗi khi tải thông tin đơn hàng: " + (err.message || "Vui lòng thử lại"));
    } finally {
      setFetchingOrder(false);
    }
  };

  // Seller accept handler (for auctions ended but reserve not met)
  const handleSellerAccept = async () => {
    if (!auctionDetail?.auctionId) return;
    try {
      const sellerId = auctionDetail.sellerId || auctionDetail.product.sellerId;
      const res = await auctionApi.sellerAccept(auctionDetail.auctionId, sellerId);
      if (res && res.orderId) {
        // navigate to payment
        navigate(`/payment/${res.orderId}`, { state: { auctionId: auctionDetail.auctionId, amount: currentPrice } });
      } else {
        alert('Chấp nhận thất bại hoặc không trả về orderId');
      }
    } catch (e: any) {
      console.error('sellerAccept failed', e)
      alert('Chấp nhận thất bại: ' + (e?.message || 'Vui lòng thử lại'))
    }
  }

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
  const reservePrice = (auctionDetail as any).reservePrice ?? 0
  const reserveMet = Number(currentPrice || 0) >= Number(reservePrice || 0)
  const isPending = pendingBid != null

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

      {/* Buy Now row - always visible if buyNowPrice exists, disabled unless live */}
      {auctionDetail.buyNowPrice && (
        <div className="buy-now-global" style={{ marginTop: 16 }}>
          <button
            className="buy-now-global-button"
            onClick={async () => {
              if (!isLive) {
                alert('Mua ngay chỉ khả dụng khi phiên đang diễn ra')
                return
              }
              if (window.confirm('Bạn có chắc muốn mua ngay sản phẩm này?')) {
                await buyNow()
              }
            }}
            disabled={!isLive}
            style={{
              backgroundColor: isLive ? '#ff6b6b' : '#ccc',
              color: isLive ? 'white' : '#666',
              padding: '10px 16px',
              border: 'none',
              borderRadius: 6,
              cursor: isLive ? 'pointer' : 'not-allowed',
              fontWeight: '600'
            }}
          >
            {isLive ? `Mua ngay - ${formatPrice(auctionDetail.buyNowPrice)}` : `Mua ngay (chỉ khi đang diễn ra)`}
          </button>
        </div>
      )}

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
              disabled={!isConnected || isPending}
            />
            <button onClick={handlePlaceBid} disabled={!isConnected || isPending}>
              {isPending ? 'Đang chờ...' : 'Đặt giá'}
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
        </div>
      )}

      {/* Winner Info */}
      {hasEnded && auctionDetail.winnerId && (
        <div className="winner-panel">
          <h3>🏆 Người thắng cuộc</h3>
          <p>Người thắng: {winnerName || "Đang tải..."}</p>
          <p>Giá cuối: {formatPrice(currentPrice)}</p>

          {/* Payment / reserve-not-met handling */}
          {auctionDetail.winnerId === userId && (
            <div style={{ marginTop: '15px' }}>
              {!reserveMet ? (
                <div style={{ padding: 12, background: '#fff4e5', borderRadius: 6 }}>
                  <strong>ℹ️ Bạn có giá cao nhất nhưng chưa đạt giá dự trữ.</strong>
                  <p style={{ margin: '8px 0 0' }}>
                    Người bán có thể chấp nhận bán. Nếu người bán chấp nhận, bạn sẽ nhận được đơn hàng để thanh toán.
                  </p>
                </div>
              ) : (
                <div className="payment-section">
                  <button
                    onClick={handlePayment}
                    disabled={fetchingOrder}
                    style={{
                      backgroundColor: '#28a745',
                      color: 'white',
                      padding: '10px 20px',
                      border: 'none',
                      borderRadius: '5px',
                      cursor: fetchingOrder ? 'not-allowed' : 'pointer',
                      opacity: fetchingOrder ? 0.6 : 1,
                      fontSize: '16px',
                      fontWeight: 'bold',
                      width: '100%'
                    }}
                  >
                    {fetchingOrder ? 'Đang tải...' : '💳 Thanh toán ngay'}
                  </button>
                  <p style={{ color: '#666', fontSize: '14px', marginTop: '10px' }}>
                    Vui lòng hoàn tất thanh toán để nhận sản phẩm
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Seller accept button when ended, reserve not met, and current user is seller */}
          {hasEnded && !reserveMet && (auctionDetail.sellerId || auctionDetail.product.sellerId) === userId && (
            <div style={{ marginTop: 12 }}>
              <button
                onClick={handleSellerAccept}
                style={{ backgroundColor: '#007bff', color: 'white', padding: '10px 16px', border: 'none', borderRadius: 6 }}
              >
                Chấp nhận bán
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AuctionRoom;
