import Bidding from "./components/Bidding";
import Product from "./components/Product";
import { useParams } from "react-router-dom";
import useAuctionLive from "../../hooks/useAuctionLive";
import { Gavel, Clock, TrendingUp, Users } from "lucide-react";

export default function Auction() {
  const { id } = useParams();
  const auctionId = id ?? null;
  const { auction, countdown, loading, live } = useAuctionLive(auctionId, {
    resyncIntervalSeconds: 8,
  });

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
      minimumFractionDigits: 0,
    }).format(amount);

  const formatCountdown = () => {
    const total = Math.max(0, countdown);
    const hours = Math.floor(total / 3600);
    const minutes = Math.floor((total % 3600) / 60);
    const seconds = Math.floor(total % 60);
    return { hours, minutes, seconds, total };
  };

  const countdownData = formatCountdown();
  const isFinalMinute = countdownData.total <= 60 && countdownData.total > 0;
  const isEnded = auction?.status === "ended";

  return (
    <div className="min-h-screen bg-gradient-to-br from-ocean-50 via-white to-energy-50/30 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-gradient-to-r from-ocean-500 to-energy-500 rounded-xl">
              <Gavel className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-ocean-600 to-energy-600 bg-clip-text text-transparent">
                Live Auction
              </h1>
              <p className="text-sm text-muted-foreground">
                {auction?.product?.title || "Auction Details"}
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Product Info */}
          <div className="lg:col-span-2 space-y-6">
            <Product />
            <Bidding />
          </div>

          {/* Right Column - Auction Stats */}
          <div className="space-y-6">
            {/* Countdown Timer Card */}
            <div className={`bg-gradient-to-br from-white via-ocean-50/30 to-energy-50/20 rounded-2xl border-2 shadow-lg overflow-hidden ${
              isFinalMinute && !isEnded
                ? "border-red-400 animate-pulse"
                : isEnded
                ? "border-gray-300"
                : "border-ocean-200/50"
            }`}>
              <div className={`p-6 text-center ${
                isFinalMinute && !isEnded
                  ? "bg-gradient-to-r from-red-500 to-orange-500"
                  : isEnded
                  ? "bg-gradient-to-r from-gray-400 to-gray-500"
                  : "bg-gradient-to-r from-ocean-500 to-energy-500"
              } text-white`}>
                <Clock className="w-8 h-8 mx-auto mb-3" />
                <h3 className="text-lg font-semibold mb-2">
                  {isEnded ? "Auction Ended" : "Time Remaining"}
                </h3>
                {!isEnded && (
                  <div className="flex items-center justify-center gap-2 text-3xl font-bold">
                    <div className="bg-white/20 rounded-lg px-3 py-2 min-w-[60px]">
                      {String(countdownData.hours).padStart(2, "0")}
                    </div>
                    <span>:</span>
                    <div className="bg-white/20 rounded-lg px-3 py-2 min-w-[60px]">
                      {String(countdownData.minutes).padStart(2, "0")}
                    </div>
                    <span>:</span>
                    <div className="bg-white/20 rounded-lg px-3 py-2 min-w-[60px]">
                      {String(countdownData.seconds).padStart(2, "0")}
                    </div>
                  </div>
                )}
              </div>
              <div className="p-4 bg-white/50">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Status:</span>
                  <span className={`font-semibold ${
                    live ? "text-green-600" : "text-gray-500"
                  }`}>
                    {loading ? "Loading..." : live ? "🟢 Live" : "⚫ Offline"}
                  </span>
                </div>
              </div>
            </div>

            {/* Current Price Card */}
            <div className="bg-gradient-to-br from-white via-ocean-50/30 to-energy-50/20 rounded-2xl border border-ocean-200/50 shadow-lg p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-ocean-100 rounded-lg">
                  <TrendingUp className="w-5 h-5 text-ocean-600" />
                </div>
                <h3 className="text-lg font-semibold text-ocean-700">Current Price</h3>
              </div>
              <div className="text-3xl font-bold text-energy-600 mb-2">
                {formatCurrency(auction?.currentPrice ?? auction?.startingPrice ?? 0)}
              </div>
              {auction?.startingPrice && (
                <div className="text-sm text-muted-foreground">
                  Starting: {formatCurrency(auction.startingPrice)}
                </div>
              )}
            </div>

            {/* Auction Info Card */}
            <div className="bg-gradient-to-br from-white via-ocean-50/30 to-energy-50/20 rounded-2xl border border-ocean-200/50 shadow-lg p-6">
              <h3 className="text-lg font-semibold text-ocean-700 mb-4 flex items-center gap-2">
                <Users className="w-5 h-5" />
                Auction Details
              </h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Min Increment:</span>
                  <span className="font-semibold text-ocean-700">
                    {formatCurrency(auction?.minBidIncrement ?? 0)}
                  </span>
                </div>
                {auction?.reservePrice && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Reserve Price:</span>
                    <span className="font-semibold text-ocean-700">
                      {formatCurrency(auction.reservePrice)}
                    </span>
                  </div>
                )}
                {auction?.bidHistory && auction.bidHistory.length > 0 && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Total Bids:</span>
                    <span className="font-semibold text-ocean-700">
                      {auction.bidHistory.length}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
