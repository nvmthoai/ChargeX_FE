import { useMemo } from "react";
import { useParams } from "react-router-dom";
import useAuctionLive from "../../../hooks/useAuctionLive";

export default function Product() {
  const { id } = useParams();
  const auctionId = id ?? null;
  const { auction, countdown, loading, live } = useAuctionLive(auctionId, {
    resyncIntervalSeconds: 8,
  });

  // Try to read product info from auction snapshot.
  const product = (auction as any)?.product ?? (auction as any)?.item ?? null;
  const title =
    product?.title ?? auction?.id ? `Auction #${auction?.id}` : "Live Auction";

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
    }).format(amount);

  const formatCountdown = useMemo(() => {
    const total = Math.max(0, countdown);
    const seconds = Math.floor(total / 1000) % 60;
    const minutes = Math.floor(total / 1000 / 60) % 60;
    const hours = Math.floor(total / 1000 / 60 / 60);
    return `${String(hours).padStart(2, "0")}h ${String(minutes).padStart(
      2,
      "0"
    )}m ${String(seconds).padStart(2, "0")}s`;
  }, [countdown]);

  const isFinalSecond = countdown <= 1000 && countdown > 0;

  return (
    <div className="product-bidding-container">
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
            {product?.title ?? `Item #${auction?.id ?? ""}`}
          </h2>
          {product?.description && (
            <p className="item-desc">{product.description}</p>
          )}
          <p className="bid-info">
            Current Bid:{" "}
            <span>{formatCurrency(auction?.currentPrice ?? 0)}</span>
          </p>
          {product?.price_start && (
            <p className="starting-bid">
              Starting Bid:{" "}
              <span>{formatCurrency(Number(product.price_start))}</span>
            </p>
          )}
          <p className="current-bid-label">
            Status: {loading ? "Loading..." : live ? "Live" : "Offline"}
          </p>
          <p className="current-bid-amount">
            {formatCurrency(auction?.currentPrice ?? 0)}
          </p>
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
