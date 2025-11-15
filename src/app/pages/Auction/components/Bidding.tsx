import React, { useMemo, useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import useAuctionLive from "../../../hooks/useAuctionLive";
import { useAuth } from "../../../hooks/AuthContext";
import useWallet from "../../../hooks/useWallet";
import toast from "react-hot-toast";
import { userApi } from "../../../../api/user/api";
import {
  mapErrorMessage,
  extractApiError,
  isInsufficientFundsError,
  extractRequiredDeposit,
} from "../../../utils/errorMapping";

export default function Bidding() {
  const { id } = useParams();
  const auctionId = id ?? null;
  const { user } = useAuth();

  const {
    auction,
    loading,
    live,
    reconnecting,
    countdown,
    placeBid,
    pendingBid,
  } = useAuctionLive(auctionId, {
    resyncIntervalSeconds: 8,
    bidderId: user?.sub || null, // Pass user ID from auth context
  });

  const {
    myWallet,
    handleDeposit: depositToWallet,
  } = useWallet();

  // Use myWallet as wallet for compatibility
  const wallet = myWallet;

  const [input, setInput] = useState<string>("");
  const [placing, setPlacing] = useState(false);
  const [showDepositModal, setShowDepositModal] = useState(false);
  const [winnerName, setWinnerName] = useState<string>("");

  // Fetch winner name when auction ends
  useEffect(() => {
    const fetchWinnerName = async () => {
      if (auction?.status === "ended" && auction?.winnerId) {
        const winnerUser = await userApi.getUserById(auction.winnerId);
        if (winnerUser) {
          setWinnerName(winnerUser.fullName || winnerUser.email || `User ${auction.winnerId.substring(0, 8)}`);
        } else {
          setWinnerName(`User ${auction.winnerId.substring(0, 8)}`);
        }
      }
    };
    fetchWinnerName();
  }, [auction?.status, auction?.winnerId]);

  // Helper functions for wallet operations
  const formatVND = (amount: number) =>
    new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
      minimumFractionDigits: 0,
    }).format(amount);

  const calculateDeposit = (bidAmount: number, depositPercent: number): number => {
    return Math.ceil((bidAmount * depositPercent) / 100);
  };

  const checkSufficientBalance = (bidAmount: number, depositPercent: number) => {
    const required = calculateDeposit(bidAmount, depositPercent);
    const available = myWallet?.available ?? 0;
    return {
      sufficient: available >= required,
      required,
      available,
    };
  };

  const fetchBalance = async () => {
    // Wallet will auto-refresh via useEffect in useWallet hook
  };

  const deposit = async (amount: number) => {
    await depositToWallet(amount.toString());
  };

  // Use startingPrice if currentPrice is 0 (no bids yet)
  const rawCurrentPrice = auction?.currentPrice ?? 0;
  const startingPrice = (auction as any)?.startingPrice ?? (auction as any)?.product?.priceStart ?? 0;
  const currentPrice = rawCurrentPrice > 0 ? rawCurrentPrice : startingPrice;
  
  const minIncrement = auction?.minBidIncrement ?? 0;
  const nextMinBid = currentPrice + minIncrement;

  const canBid = useMemo(() => {
    if (!user) return { ok: false, reason: "Not logged in" };
    if (!user.role || user.role !== "member")
      return { ok: false, reason: "Insufficient role" };
    if (!live) return { ok: false, reason: "Auction not live" };
    if (reconnecting) return { ok: false, reason: "Reconnecting..." };
    // TODO: check user's balance via wallet API and return false+reason if insufficient
    return { ok: true, reason: "" };
  }, [user, live, reconnecting]);

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
      minimumFractionDigits: 0,
    }).format(amount);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseFloat(input);
    if (Number.isNaN(amount)) return toast.error("Invalid amount");
    if (amount < nextMinBid)
      return toast.error(`Minimum bid is ${formatCurrency(nextMinBid)}`);
    if (!canBid.ok) return toast.error(canBid.reason);

    // Check wallet balance and required deposit
    const depositPercent = (auction as any)?.bidDepositPercent ?? 10;
    const depositRequired = calculateDeposit(amount, depositPercent);
    const balanceCheck = checkSufficientBalance(amount, depositPercent);

    if (!balanceCheck.sufficient) {
      toast.error(
        `Insufficient funds. You need ${formatVND(
          depositRequired
        )} deposit, but only have ${formatVND(
          wallet?.available ?? 0
        )} available.`
      );
      setShowDepositModal(true);
      return;
    }

    setPlacing(true);
    try {
      // optimistic UI is handled inside hook via pendingBid
      await placeBid(amount);
      toast.success("Bid submitted — waiting for confirmation...");
      setInput("");
      fetchBalance(); // refresh wallet after bid
    } catch (err: any) {
      // Handle errors with mapping
      const apiError = extractApiError(err);
      const friendlyMessage = mapErrorMessage(apiError.code, apiError.message);

      if (isInsufficientFundsError(err)) {
        const required = extractRequiredDeposit(err) ?? depositRequired;
        toast.error(`${friendlyMessage} Required: ${formatVND(required)}`);
        setShowDepositModal(true);
      } else {
        toast.error(friendlyMessage);
      }
    } finally {
      setPlacing(false);
    }
  };

  const handleDeposit = async () => {
    const depositPercent = (auction as any)?.bidDepositPercent ?? 10;
    const amount = parseFloat(input);
    if (Number.isNaN(amount)) return;
    const depositRequired = calculateDeposit(amount, depositPercent);
    const shortfall =
      (wallet?.available ?? 0) < depositRequired
        ? depositRequired - (wallet?.available ?? 0)
        : depositRequired;

    try {
      await deposit(shortfall);
      toast.success(`Deposited ${formatVND(shortfall)} successfully!`);
      setShowDepositModal(false);
    } catch (err: any) {
      toast.error(`Deposit failed: ${err.message}`);
    }
  };

  const isFinalSecond = countdown <= 1000 && countdown > 0;
  const depositPercent = (auction as any)?.bidDepositPercent ?? 10;
  const depositRequired = input ? calculateDeposit(parseFloat(input) || 0, depositPercent) : 0;

  return (
    <div className="space-y-6">
      {/* Place Bid Card */}
      <div
        className={`bg-gradient-to-br from-white via-ocean-50/30 to-energy-50/20 rounded-2xl border-2 shadow-lg overflow-hidden transition-all ${
          isFinalSecond
            ? "border-red-400 animate-pulse shadow-red-200"
            : "border-ocean-200/50"
        }`}
      >
        {/* Header */}
        <div className={`p-6 ${
          isFinalSecond
            ? "bg-gradient-to-r from-red-500 to-orange-500"
            : "bg-gradient-to-r from-ocean-500 to-energy-500"
        } text-white`}>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <span>🔨</span>
            Place Your Bid
          </h2>
          {isFinalSecond && (
            <p className="text-sm mt-1 text-white/90">Final seconds! Place your bid now!</p>
          )}
        </div>

        <div className="p-6 space-y-6">
          {/* Current Info Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white/60 backdrop-blur-sm rounded-xl p-4 border border-ocean-200/30">
              <p className="text-xs text-muted-foreground mb-1">Current Price</p>
              <p className="text-xl font-bold text-ocean-700">
                {formatCurrency(currentPrice)}
              </p>
            </div>
            <div className="bg-white/60 backdrop-blur-sm rounded-xl p-4 border border-ocean-200/30">
              <p className="text-xs text-muted-foreground mb-1">Min Increment</p>
              <p className="text-xl font-bold text-energy-600">
                {formatCurrency(minIncrement)}
              </p>
            </div>
            <div className="bg-gradient-to-br from-ocean-100 to-energy-100 rounded-xl p-4 border-2 border-ocean-300/50">
              <p className="text-xs text-ocean-700 font-semibold mb-1">Next Min Bid</p>
              <p className="text-xl font-bold text-ocean-700">
                {formatCurrency(nextMinBid)}
              </p>
            </div>
          </div>

          {/* Wallet Balance */}
          {wallet && (
            <div className={`p-4 rounded-xl border-2 ${
              wallet.available >= nextMinBid * 0.1
                ? "bg-green-50 border-green-200"
                : "bg-red-50 border-red-200"
            }`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">💰</span>
                  <span className="text-sm font-medium text-muted-foreground">Your Balance</span>
                </div>
                <strong
                  className={`text-lg font-bold ${
                    wallet.available >= nextMinBid * 0.1
                      ? "text-green-700"
                      : "text-red-700"
                  }`}
                >
                  {formatVND(wallet.available)}
                </strong>
              </div>
            </div>
          )}

          {/* Auction Ended State */}
          {auction?.status === "ended" ? (
            <div className="space-y-4">
              <div className="bg-gradient-to-r from-gray-100 to-gray-200 rounded-xl p-6 text-center border-2 border-gray-300">
                <p className="text-lg font-semibold text-gray-700 mb-2">
                  Auction Ended
                </p>
                <p className="text-2xl font-bold text-ocean-700">
                  Final Price: {formatCurrency(currentPrice)}
                </p>
              </div>
              {auction.winnerId === user?.sub ? (
                <div className="bg-gradient-to-r from-green-100 to-emerald-100 rounded-xl p-6 border-2 border-green-400">
                  <p className="text-lg font-bold text-green-800 mb-4 text-center">
                    🎉 Congratulations! You Won! 🎉
                  </p>
                  <button className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-bold py-3 px-6 rounded-xl transition-all shadow-lg hover:shadow-xl">
                    Pay / Complete Order
                  </button>
                </div>
              ) : (
                <div className="bg-gray-100 rounded-xl p-6 border border-gray-300">
                  <p className="text-center text-gray-700">
                    <span className="font-semibold">Winner:</span> {winnerName || "Loading..."}
                  </p>
                </div>
              )}
            </div>
          ) : (
            /* Bid Form */
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-ocean-700">
                  Enter Your Bid Amount
                </label>
                <div className="relative">
                  <input
                    type="number"
                    value={input}
                    onChange={(ev) => setInput(ev.target.value)}
                    placeholder={nextMinBid.toFixed(2)}
                    className="w-full px-4 py-4 text-lg font-semibold rounded-xl border-2 border-ocean-200 focus:border-ocean-500 focus:ring-4 focus:ring-ocean-200/50 transition-all bg-white/80 backdrop-blur-sm disabled:opacity-50 disabled:cursor-not-allowed"
                    step="0.01"
                    min={nextMinBid}
                    disabled={!canBid.ok || placing}
                  />
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-muted-foreground font-medium">
                    VND
                  </div>
                </div>
                <p className={`text-xs px-2 ${
                  !canBid.ok ? "text-red-600 font-semibold" : "text-muted-foreground"
                }`}>
                  {!canBid.ok
                    ? `⚠️ ${canBid.reason}`
                    : input
                    ? `💳 Deposit required: ${formatVND(depositRequired)} (${depositPercent}%)`
                    : `Minimum bid: ${formatCurrency(nextMinBid)}`}
                </p>
              </div>

              <button
                type="submit"
                className={`w-full py-4 px-6 rounded-xl font-bold text-lg transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed ${
                  isFinalSecond
                    ? "bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 text-white"
                    : "bg-gradient-to-r from-ocean-500 to-energy-500 hover:from-ocean-600 hover:to-energy-600 text-white"
                }`}
                disabled={!canBid.ok || placing}
              >
                {placing
                  ? "⏳ Placing Bid..."
                  : pendingBid
                  ? "⏳ Bid Pending..."
                  : isFinalSecond
                  ? "⚡ Place Bid Now!"
                  : "🚀 Place Bid"}
              </button>

              {showDepositModal && (
                <button
                  type="button"
                  className="w-full py-3 px-6 rounded-xl font-semibold bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white transition-all shadow-md hover:shadow-lg"
                  onClick={handleDeposit}
                >
                  💳 Deposit Funds ({formatVND(depositRequired)})
                </button>
              )}
            </form>
          )}

          {/* Status Messages */}
          {reconnecting && (
            <div className="bg-yellow-50 border-2 border-yellow-400 rounded-xl p-4">
              <p className="text-center font-semibold text-yellow-800">
                ⚠️ Reconnecting... Bids are temporarily disabled
              </p>
            </div>
          )}
          {!live && !loading && (
            <div className="bg-gray-100 border border-gray-300 rounded-xl p-4">
              <p className="text-center text-gray-600 font-medium">
                ⚫ Auction is not live
              </p>
            </div>
          )}

          {/* Countdown */}
          <div className={`text-center p-4 rounded-xl font-bold text-lg ${
            isFinalSecond
              ? "bg-red-100 text-red-700 animate-pulse border-2 border-red-400"
              : "bg-ocean-50 text-ocean-700 border border-ocean-200"
          }`}>
            ⏰ Time left: {Math.ceil(countdown / 1000)}s
          </div>
        </div>
      </div>

      {/* Bidding History Card */}
      <div className="bg-gradient-to-br from-white via-ocean-50/30 to-energy-50/20 rounded-2xl border border-ocean-200/50 shadow-lg overflow-hidden">
        <div className="bg-gradient-to-r from-ocean-500 to-energy-500 p-6 text-white">
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <span>📜</span>
            Bidding History
          </h2>
          {auction?.bidHistory && auction.bidHistory.length > 0 && (
            <p className="text-sm mt-1 text-white/90">
              {auction.bidHistory.length} {auction.bidHistory.length === 1 ? 'bid' : 'bids'} total
            </p>
          )}
        </div>

        <div className="p-6">
          {auction?.bidHistory && auction.bidHistory.length > 0 ? (
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {auction.bidHistory.map((bid, index) => (
                <div
                  key={bid.bidId}
                  className={`p-4 rounded-xl border-2 transition-all ${
                    bid.isWinning
                      ? "bg-gradient-to-r from-green-50 to-emerald-50 border-green-400 shadow-md"
                      : bid.userId === user?.sub
                      ? "bg-gradient-to-r from-blue-50 to-cyan-50 border-blue-300"
                      : "bg-white/60 backdrop-blur-sm border-ocean-200/30"
                  }`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        {bid.isWinning && (
                          <span className="text-lg">🏆</span>
                        )}
                        <span className={`font-bold ${
                          bid.isWinning ? "text-green-700" : "text-ocean-700"
                        }`}>
                          {bid.userName || 'Anonymous'}
                        </span>
                        {bid.userId === user?.sub && (
                          <span className="px-2 py-0.5 text-xs font-bold bg-blue-500 text-white rounded-full">
                            You
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {new Date(bid.timestamp).toLocaleString('vi-VN', {
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                          second: '2-digit'
                        })}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`text-2xl font-bold ${
                        bid.isWinning ? "text-green-700" : "text-ocean-700"
                      }`}>
                        {formatCurrency(bid.amount)}
                      </div>
                      {index === 0 && (
                        <div className="text-xs text-energy-600 font-semibold mt-1">
                          Latest
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🎯</div>
              <p className="text-lg font-semibold text-muted-foreground mb-2">
                No bids yet
              </p>
              <p className="text-sm text-muted-foreground">
                Be the first to place a bid!
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
