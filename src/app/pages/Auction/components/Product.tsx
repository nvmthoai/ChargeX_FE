import { useMemo, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import useAuctionLive from "../../../hooks/useAuctionLive";

export default function Product() {
  const { id } = useParams();
  const auctionId = id ?? null;
  const [renderKey, setRenderKey] = useState(0);
  const [backupAuction, setBackupAuction] = useState<any>(null);
  
  const { auction, countdown, loading, live } = useAuctionLive(auctionId, {
    resyncIntervalSeconds: 8,
  });

  // Track auction changes and force re-render if needed
  useEffect(() => {
    if (auction && auction !== backupAuction) {
      setBackupAuction(auction);
      setRenderKey(prev => prev + 1);
    }
  }, [auction, backupAuction]);
  
  // Use backup auction if main auction is null but backup exists
  const displayAuction = auction || backupAuction;
  const auctionWithProduct = displayAuction;
  
  const product = {
    title: auctionWithProduct?.product?.title || auctionWithProduct?.title,
    description: auctionWithProduct?.product?.description || auctionWithProduct?.description,
    imageUrls: auctionWithProduct?.product?.imageUrls || auctionWithProduct?.imageUrls || [],
    price_start: auctionWithProduct?.startingPrice,
  };
  const title = product.title || (auctionId ? `Auction #${auctionId}` : "Live Auction");

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
      minimumFractionDigits: 0,
    }).format(amount);

  const formatCountdown = useMemo(() => {
    const totalSeconds = Math.max(0, countdown); // countdown is already in seconds
    const seconds = totalSeconds % 60;
    const minutes = Math.floor(totalSeconds / 60) % 60;
    const hours = Math.floor(totalSeconds / 3600);
    return `${String(hours).padStart(2, "0")}h ${String(minutes).padStart(
      2,
      "0"
    )}m ${String(seconds).padStart(2, "0")}s`;
  }, [countdown]);

  const isFinalSecond = countdown <= 1000 && countdown > 0;

  return (
    <div className="product-bidding-container" key={renderKey}>
      <h1 className="auction-title">{title}</h1>
      <div
        className={`auction-card product-card ${
          isFinalSecond ? "final-second" : ""
        }`}
      >
        <div className="card-image">
          {/* show image from auction snapshot if available */}
          {product?.imageUrls && product.imageUrls.length > 0 ? (
            // use first image
            <img
              src={product.imageUrls[0]}
              alt={product.title ?? "auction item"}
              className="w-60 h-40 object-cover rounded-lg"
            />
          ) : (
            <div className="w-60 h-40 bg-gray-200 flex items-center justify-center rounded-lg">
              <span className="text-gray-500">No image</span>
            </div>
          )}
        </div>
        <div className="card-details">
          <h2 className="item-title">
            {product?.title ?? `Item #${auctionId ?? ""}`}
          </h2>
          {product?.description && (
            <p className="item-desc">{product.description}</p>
          )}
          <p className="bid-info">
            Current Bid:{" "}
            <span>
              {formatCurrency(
                (auction?.currentPrice && auction.currentPrice > 0)
                  ? auction.currentPrice 
                  : (auction as any)?.startingPrice ?? (auction as any)?.product?.priceStart ?? 0
              )}
            </span>
          </p>
          {(product?.price_start || (auction as any)?.startingPrice) && (
            <p className="starting-bid">
              Starting Price:{" "}
              <span>
                {formatCurrency(
                  (auction as any)?.startingPrice ?? Number(product.price_start ?? 0)
                )}
              </span>
            </p>
          )}
          <p className="current-bid-label">
            Status: {loading ? "Loading..." : auction ? (live ? "Live" : "Offline") : "Connecting..."}
          </p>
          <p className="current-bid-amount">
            {formatCurrency(
              (auction?.currentPrice && auction.currentPrice > 0)
                ? auction.currentPrice 
                : (auction as any)?.startingPrice ?? 0
            )}
          </p>
          {!auction && !loading && (
            <p className="text-yellow-500">
              ⚠️ No auction data received yet. Check WebSocket connection.
            </p>
          )}
          <div className={`countdown-timer ${isFinalSecond ? "pulse" : ""}`}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="10"></circle>
              <polyline points="12 6 12 12 16 14"></polyline>
            </svg>
            <span>{formatCountdown}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
