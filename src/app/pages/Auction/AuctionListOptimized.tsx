import { useState, useCallback, memo, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { useAuctions, auctionKeys } from "../../hooks/useAuctionQueries";
import { useQueryClient } from '@tanstack/react-query'
import { auctionApi } from '../../../api/auction'
import { Gavel, Clock, RefreshCw } from "lucide-react";

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

  const getStatusBadge = () => {
    switch (auction.status) {
      case "live":
        return (
          <span className="absolute top-3 right-3 px-3 py-1 bg-gradient-to-r from-energy-500 to-energy-600 text-white text-xs font-bold rounded-full shadow-lg flex items-center gap-1 animate-pulse">
            <span className="w-2 h-2 bg-white rounded-full"></span>
            Live
          </span>
        );
      case "scheduled":
        return (
          <span className="absolute top-3 right-3 px-3 py-1 bg-gradient-to-r from-ocean-500 to-ocean-600 text-white text-xs font-bold rounded-full shadow-lg flex items-center gap-1">
            <Clock className="w-3 h-3" />
            Scheduled
          </span>
        );
      case "ended":
        return (
          <span className="absolute top-3 right-3 px-3 py-1 bg-dark-500 text-white text-xs font-bold rounded-full shadow-lg">
            ✓ Ended
          </span>
        );
      default:
        return (
          <span className="absolute top-3 right-3 px-3 py-1 bg-red-500 text-white text-xs font-bold rounded-full shadow-lg">
            ✗ Cancelled
          </span>
        );
    }
  };

  return (
    <div className="group bg-white/90 backdrop-blur-sm rounded-2xl overflow-hidden shadow-lg border border-ocean-200/50 hover:shadow-2xl hover:scale-105 transition-all duration-300">
      {/* Image */}
      <div className="relative h-48 overflow-hidden bg-gradient-to-br from-ocean-100 to-energy-100">
        {auction.imageUrls && auction.imageUrls.length > 0 ? (
          <img
            src={auction.imageUrls[0]}
            alt={auction.title}
            loading="lazy"
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Gavel className="w-16 h-16 text-ocean-300" />
          </div>
        )}
        {getStatusBadge()}
      </div>

      {/* Content */}
      <div className="p-5">
        <h3 className="font-bold text-lg text-dark-900 mb-4 line-clamp-2 min-h-[56px] group-hover:text-ocean-600 transition-colors">
          {auction.title}
        </h3>

        <div className="space-y-3 mb-4">
          <div className="flex justify-between items-center p-3 bg-gradient-to-r from-ocean-50 to-energy-50 rounded-lg">
            <span className="text-sm text-dark-600 font-medium">Current Price:</span>
            <span className="text-lg font-bold bg-gradient-to-r from-ocean-600 to-energy-600 bg-clip-text text-transparent">
              {formatCurrency(auction.currentPrice || 0)}
            </span>
          </div>

          {auction.status === "live" || auction.status === "scheduled" ? (
            <div className={`flex justify-between items-center p-3 rounded-lg ${
              auction.status === "live" 
                ? "bg-gradient-to-r from-energy-100 to-energy-200" 
                : "bg-gradient-to-r from-ocean-50 to-ocean-100"
            }`}>
              <span className="text-sm text-dark-700 font-medium flex items-center gap-2">
                <Clock className="w-4 h-4" />
                {auction.status === "live" ? "Time Left:" : "Starts In:"}
              </span>
              <span className={`text-sm font-bold ${
                auction.status === "live" ? "text-energy-700" : "text-ocean-700"
              }`}>
                {formatCountdown(countdown)}
              </span>
            </div>
          ) : (
            <>
              <div className="flex justify-between items-center text-sm">
                <span className="text-dark-600">Start Time:</span>
                <span className="text-dark-800 font-medium">{formatDateTime(auction.startTime)}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-dark-600">End Time:</span>
                <span className="text-dark-800 font-medium">{formatDateTime(auction.endTime)}</span>
              </div>
            </>
          )}
        </div>

        <button
          onClick={() => onJoin(auction)}
          disabled={auction.status === "ended" || auction.status === "cancelled"}
          className={`w-full py-3 px-4 rounded-xl font-semibold transition-all duration-300 ${
            auction.status === "live"
              ? "bg-gradient-to-r from-energy-500 to-energy-600 hover:from-energy-600 hover:to-energy-700 text-white shadow-lg shadow-energy-500/30 hover:shadow-xl hover:scale-105"
              : auction.status === "scheduled"
              ? "bg-gradient-to-r from-ocean-500 to-ocean-600 hover:from-ocean-600 hover:to-ocean-700 text-white shadow-lg shadow-ocean-500/30 hover:shadow-xl hover:scale-105"
              : "bg-dark-200 text-dark-600 cursor-not-allowed"
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
    <div className="min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <div>
              <h1 className="text-4xl sm:text-5xl font-bold bg-gradient-to-r from-ocean-600 to-energy-600 bg-clip-text text-transparent mb-2">
                Live Auctions
              </h1>
              <p className="text-dark-800 text-lg font-medium">Join live auctions and place your bids!</p>
            </div>

            <button
              onClick={() => refetch()}
              disabled={isLoading}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-ocean-50 to-energy-50 rounded-xl border border-ocean-200 text-ocean-700 hover:from-ocean-100 hover:to-energy-100 hover:scale-105 transition-all shadow-md disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 bg-gradient-to-r from-ocean-50/90 via-energy-50/80 to-ocean-50/90 backdrop-blur-sm rounded-xl p-2 shadow-lg border border-ocean-200/50">
            {(["all", "live", "scheduled"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setFilter(tab)}
                className={`flex-1 px-4 py-2 rounded-lg font-semibold transition-all ${
                  filter === tab
                    ? "bg-gradient-to-r from-ocean-500 to-ocean-600 text-white shadow-lg"
                    : "text-dark-900 font-medium hover:bg-ocean-50"
                }`}
              >
                {tab === "all" ? "All Auctions" : tab === "live" ? "🔴 Live Now" : "📅 Scheduled"}
              </button>
            ))}
          </div>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-16 h-16 border-4 border-ocean-500 border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-dark-800 text-lg font-medium">Loading auctions...</p>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && auctions.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-24 h-24 bg-gradient-to-r from-ocean-100 to-energy-100 rounded-full flex items-center justify-center mb-6">
              <Gavel className="w-12 h-12 text-ocean-500" />
            </div>
            <h3 className="text-2xl font-bold text-dark-900 mb-2">No auctions found</h3>
            <p className="text-dark-800 mb-6 font-medium">Check back later for new auctions!</p>
            <button 
              onClick={() => refetch()} 
              className="px-6 py-3 bg-gradient-to-r from-ocean-500 to-ocean-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl hover:scale-105 transition-all"
            >
              Try Again
            </button>
          </div>
        )}

        {/* Auctions Grid */}
        {!isLoading && auctions.length > 0 && (
          <>
            <div className="mb-6 flex justify-between items-center">
              <p className="text-dark-800 font-medium">
                Found <span className="font-bold text-ocean-600">{data?.meta.total || 0}</span> auction{(data?.meta.total || 0) !== 1 ? 's' : ''}
                {filter !== 'all' && (
                  <span className="ml-2 px-2 py-1 bg-ocean-100 text-ocean-700 rounded-full text-sm font-medium">
                    {filter}
                  </span>
                )}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {auctions.map((auction, index) => (
                <div 
                  key={auction.auctionId} 
                  onMouseEnter={() => prefetchAuction(auction.auctionId)}
                  className="animate-fadeIn"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
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
