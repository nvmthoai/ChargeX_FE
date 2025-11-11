import { useState, useCallback, memo, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { useAuctions, auctionKeys } from "../../hooks/useAuctionQueries";
import { useQueryClient } from '@tanstack/react-query'
import { auctionApi } from '../../../api/auction'
import "./AuctionList.css"

interface AuctionItem {
  auctionId: string;
  productId: string;
  title: string;
  currentPrice: number;
  minBidIncrement: number;
  status: "scheduled" | "live" | "ended" | "cancelled";
  startTime: string;
  endTime: string;
  imageUrls?: string[];
  serverNow?: string;
  serverTime?: number;
}

// Memoized Auction Card to avoid unnecessary re-renders
const AuctionCard = memo(function AuctionCard({ auction, onJoin }: { auction: AuctionItem; onJoin: (a: AuctionItem) => void }) {
  const [countdown, setCountdown] = useState<number>(0);
  const offsetRef = useRef<number>(0);

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(amount);

  const formatDateTime = (dateStr: string) =>
    new Date(dateStr).toLocaleString("vi-VN", { dateStyle: "short", timeStyle: "short" });

  const formatCountdown = (ms: number) => {
    const totalSeconds = Math.ceil(ms / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m ${seconds}s`;
  };

  // Update offset when serverTime or serverNow changes
  useEffect(() => {
    if (!auction.endTime) return;
    // Prefer serverTime (number) over serverNow (ISO string) for accuracy
    let serverTimeMs: number;
    if (typeof auction.serverTime === "number" && auction.serverTime > 0) {
      serverTimeMs = auction.serverTime;
    } else if (auction.serverNow) {
      serverTimeMs = new Date(auction.serverNow).getTime();
    } else {
      serverTimeMs = Date.now();
    }
    offsetRef.current = Date.now() - serverTimeMs;
  }, [auction.serverTime, auction.serverNow, auction.endTime]);

  // Countdown timer effect
  useEffect(() => {
    if (auction.status !== "live" && auction.status !== "scheduled") {
      return;
    }

    if (!auction.endTime) return;

    const endTime = new Date(auction.endTime).getTime();

    const tick = () => {
      const nowServer = Date.now() - offsetRef.current;
      const remaining = Math.max(0, endTime - nowServer);
      setCountdown(remaining);
    };

    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [auction.endTime, auction.status]);

  return (
    <div className="auction-card">
      <div className="auction-card-image">
        {auction.imageUrls && auction.imageUrls.length > 0 ? (
          <img
            src={auction.imageUrls[0]}
            alt={auction.title}
            loading="lazy"
          />
        ) : (
          <div className="auction-card-image-placeholder">📦</div>
        )}
        <div className={`status-badge status-${auction.status}`}>
          {auction.status === "live" ? "🔴 Live" : auction.status === "scheduled" ? "📅 Scheduled" : auction.status === "ended" ? "✓ Ended" : "✗ Cancelled"}
        </div>
      </div>

      <div className="auction-card-content">
        <h3 className="auction-card-title">{auction.title}</h3>

        <div className="auction-card-info">
          <div className="info-row">
            <span className="info-label">Current Price:</span>
            <span className="info-value price">{formatCurrency(auction.currentPrice || 0)}</span>
          </div>

          {auction.status === "live" || auction.status === "scheduled" ? (
            <div className="info-row">
              <span className={`info-label ${auction.status === "live" ? "countdown-label" : ""}`}>
                {auction.status === "live" ? "⏱️ Time Left:" : "⏰ Starts In:"}
              </span>
              <span className="info-value countdown">{formatCountdown(countdown)}</span>
            </div>
          ) : (
            <>
              <div className="info-row">
                <span className="info-label">Start Time:</span>
                <span className="info-value">{formatDateTime(auction.startTime)}</span>
              </div>

              <div className="info-row">
                <span className="info-label">End Time:</span>
                <span className="info-value">{formatDateTime(auction.endTime)}</span>
              </div>
            </>
          )}
        </div>

        <button
          onClick={() => onJoin(auction)}
          disabled={auction.status === "ended" || auction.status === "cancelled"}
          className={`auction-card-action ${
            auction.status === "live"
              ? "action-live"
              : auction.status === "scheduled"
              ? "action-scheduled"
              : "action-ended"
          }`}
        >
          {auction.status === "live"
            ? "🔴 Join Live Auction"
            : auction.status === "scheduled"
            ? "📅 View Details"
            : auction.status === "ended"
            ? "✓ Ended"
            : "Cancelled"}
        </button>
      </div>
    </div>
  );
});

export default function AuctionListOptimized() {
  const navigate = useNavigate();
  const [filter, setFilter] = useState<"all" | "live" | "scheduled">("all");
  const queryClient = useQueryClient();

  const { data, isLoading, error, isError, refetch } = useAuctions(filter, 1, 20);
  const auctions = data?.items || [];

  if (isError && error) {
    console.error("❌ [AuctionList] Query error:", error);
  }

  const handleJoinAuction = useCallback((auction: AuctionItem) => {
    if (!auction.auctionId) {
      toast.error("Invalid auction ID");
      return;
    }
    navigate(`/auction/${auction.auctionId}`);
  }, [navigate]);

  const prefetchAuction = useCallback((id: string) => {
    queryClient.prefetchQuery({
      queryKey: auctionKeys.detail(id),
      queryFn: async () => auctionApi.getAuctionById(id),
    });
  }, [queryClient]);

  return (
    <div className="auction-list-container">
      <div className="auction-wrapper">
        <div className="auction-header">
          <div className="auction-header-content">
            <div className="auction-header-text">
              <h1>Live Auctions</h1>
              <p>Join live auctions and place your bids!</p>
            </div>

            <div className="header-actions">
              <button
                onClick={() => refetch()}
                disabled={isLoading}
                className="refresh-btn"
              >
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Refresh
              </button>
            </div>
          </div>
        </div>

        <div className="auction-tabs">
          {["all", "live", "scheduled"].map((tab) => (
            <button
              key={tab}
              onClick={() => setFilter(tab as typeof filter)}
              className={`tab-btn ${filter === tab ? "active" : ""}`}
            >
              {tab === "all" ? "All Auctions" : tab === "live" ? "🔴 Live Now" : "📅 Scheduled"}
            </button>
          ))}
        </div>

        {isLoading && (
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p className="loading-text">Loading auctions...</p>
          </div>
        )}

        {!isLoading && auctions.length === 0 && (
          <div className="empty-state-container">
            <div className="empty-state">
              <span className="empty-state-icon">📦</span>
              <h3>No auctions found</h3>
              <p>Check back later for new auctions!</p>
              <button onClick={() => refetch()} className="empty-state-btn">Try Again</button>
            </div>
          </div>
        )}

        {!isLoading && auctions.length > 0 && (
          <>
            <div style={{ marginBottom: "24px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <p style={{ fontSize: "14px", color: "var(--text-light)" }}>
                Found {data?.meta.total || 0} auction{(data?.meta.total || 0) !== 1 ? 's' : ''}{filter !== 'all' && ` (${filter})`}
              </p>
            </div>

            <div className="auction-grid">
              {auctions.map((auction) => (
                <div key={auction.auctionId} onMouseEnter={() => prefetchAuction(auction.auctionId)}>
                  <AuctionCard auction={auction as AuctionItem} onJoin={handleJoinAuction} />
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
