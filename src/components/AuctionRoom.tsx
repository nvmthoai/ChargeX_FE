import React, { useState, useEffect } from 'react';
import { useAuction } from '../hooks/useAuction';

interface AuctionRoomProps {
  auctionId: string;
  userId?: string;
}

export const AuctionRoom: React.FC<AuctionRoomProps> = ({ auctionId, userId }) => {
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

  const [bidAmount, setBidAmount] = useState<string>('');
  const [timeRemaining, setTimeRemaining] = useState<string>('');

  // Calculate time remaining
  useEffect(() => {
    if (!auctionDetail?.endTime) return;

    const interval = setInterval(() => {
      const now = new Date().getTime();
      const end = new Date(auctionDetail.endTime).getTime();
      const distance = end - now;

      if (distance < 0) {
        setTimeRemaining('Đã kết thúc');
        clearInterval(interval);
        return;
      }

      const hours = Math.floor(distance / (1000 * 60 * 60));
      const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((distance % (1000 * 60)) / 1000);

      setTimeRemaining(`${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`);
    }, 1000);

    return () => clearInterval(interval);
  }, [auctionDetail?.endTime]);

  const handlePlaceBid = () => {
    const amount = parseFloat(bidAmount);
    if (isNaN(amount) || amount <= 0) {
      alert('Vui lòng nhập số tiền hợp lệ');
      return;
    }

    if (auctionDetail && amount < auctionDetail.currentPrice + auctionDetail.minBidIncrement) {
      alert(`Giá đặt phải lớn hơn hoặc bằng ${formatPrice(auctionDetail.currentPrice + auctionDetail.minBidIncrement)}`);
      return;
    }

    placeBid(amount);
    setBidAmount('');
  };

  const handleBuyNow = async () => {
    if (window.confirm('Bạn có chắc muốn mua ngay sản phẩm này?')) {
      await buyNow();
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(price);
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleString('vi-VN');
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
  const isLive = auctionDetail.status === 'live';
  const hasEnded = auctionDetail.status === 'ended';

  return (
    <div className="auction-room-container">
      {/* Connection Status */}
      <div className={`connection-status ${isConnected ? 'connected' : 'disconnected'}`}>
        {isConnected ? '🟢 Đã kết nối' : '🔴 Mất kết nối'}
      </div>

      {/* Product Info */}
      <div className="auction-product-info">
        <h1>{auctionDetail.product.title}</h1>
        <div className="product-images">
          {auctionDetail.product.images.map((img: string, idx: number) => (
            <img key={idx} src={img} alt={`Product ${idx + 1}`} />
          ))}
        </div>
        <p>{auctionDetail.product.description}</p>
      </div>

      {/* Auction Status */}
      <div className="auction-status-panel">
        <div className="status-badge">
          <span className={`badge ${auctionDetail.status}`}>
            {auctionDetail.status === 'live' && '🔴 Đang diễn ra'}
            {auctionDetail.status === 'scheduled' && '⏰ Sắp diễn ra'}
            {auctionDetail.status === 'ended' && '✅ Đã kết thúc'}
            {auctionDetail.status === 'cancelled' && '❌ Đã hủy'}
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
              placeholder={`Tối thiểu: ${formatPrice(currentPrice + auctionDetail.minBidIncrement)}`}
              min={currentPrice + auctionDetail.minBidIncrement}
              step={auctionDetail.minBidIncrement}
            />
            <button onClick={handlePlaceBid} disabled={!isConnected}>
              Đặt giá
            </button>
          </div>

          <div className="quick-bid-buttons">
            <button
              onClick={() => setBidAmount((currentPrice + auctionDetail.minBidIncrement).toString())}
            >
              +{formatPrice(auctionDetail.minBidIncrement)}
            </button>
            <button
              onClick={() => setBidAmount((currentPrice + auctionDetail.minBidIncrement * 2).toString())}
            >
              +{formatPrice(auctionDetail.minBidIncrement * 2)}
            </button>
            <button
              onClick={() => setBidAmount((currentPrice + auctionDetail.minBidIncrement * 5).toString())}
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
          <p>User ID: {auctionDetail.winnerId}</p>
          <p>Giá cuối: {formatPrice(currentPrice)}</p>
        </div>
      )}
    </div>
  );
};

export default AuctionRoom;
