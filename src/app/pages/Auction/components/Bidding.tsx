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
    if (!user) return { ok: false, reason: "Vui lòng đăng nhập" };
    if (!user.role || user.role !== "member")
      return { ok: false, reason: "Không đủ quyền" };
    if (!live) return { ok: false, reason: "Phiên đấu giá chưa bắt đầu" };
    if (reconnecting) return { ok: false, reason: "Đang kết nối lại..." };
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
    if (Number.isNaN(amount)) return toast.error("Số tiền không hợp lệ");
    if (amount < nextMinBid)
      return toast.error(`Giá đặt tối thiểu là ${formatCurrency(nextMinBid)}`);
    if (!canBid.ok) return toast.error(canBid.reason);

    // Check wallet balance and required deposit
    const depositPercent = (auction as any)?.bidDepositPercent ?? 10;
    const depositRequired = calculateDeposit(amount, depositPercent);
    const balanceCheck = checkSufficientBalance(amount, depositPercent);

    if (!balanceCheck.sufficient) {
      toast.error(
        `Số dư không đủ. Bạn cần ${formatVND(
          depositRequired
        )} đặt cọc, nhưng chỉ có ${formatVND(
          wallet?.available ?? 0
        )} khả dụng.`
      );
      setShowDepositModal(true);
      return;
    }

    setPlacing(true);
    try {
      // optimistic UI is handled inside hook via pendingBid
      await placeBid(amount);
      toast.success("Đã gửi giá đặt — đang chờ xác nhận...");
      setInput("");
      fetchBalance(); // refresh wallet after bid
    } catch (err: any) {
      // Handle errors with mapping
      const apiError = extractApiError(err);
      const friendlyMessage = mapErrorMessage(apiError.code, apiError.message);

      if (isInsufficientFundsError(err)) {
        const required = extractRequiredDeposit(err) ?? depositRequired;
        toast.error(`${friendlyMessage} Cần: ${formatVND(required)}`);
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
      toast.success(`Đã nạp ${formatVND(shortfall)} thành công!`);
      setShowDepositModal(false);
    } catch (err: any) {
      toast.error(`Nạp tiền thất bại: ${err.message}`);
    }
  };

  const isFinalSecond = countdown <= 1000 && countdown > 0;

  return (
    <div className="space-y-6">
      {/* Place Bid Card */}
      <div
        className={`bg-white rounded-2xl shadow-lg border border-ocean-200/30 p-6 transition-all duration-300 ${
          isFinalSecond ? "ring-2 ring-red-500 animate-pulse" : ""
        }`}
      >
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-full bg-gradient-to-r from-ocean-500 to-energy-500 flex items-center justify-center">
            <span className="text-white font-bold text-lg">₫</span>
          </div>
          <h2 className="text-2xl font-bold bg-gradient-to-r from-ocean-600 to-energy-600 bg-clip-text text-transparent">
            Đặt giá của bạn
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 p-4 bg-gradient-to-r from-ocean-50/50 to-energy-50/50 rounded-xl border border-ocean-200/30">
          <div className="text-center">
            <p className="text-sm text-gray-600 mb-1">Giá hiện tại</p>
            <p className="text-xl font-bold text-ocean-600">
              {formatCurrency(currentPrice)}
            </p>
          </div>
          <div className="text-center">
            <p className="text-sm text-gray-600 mb-1">Bước giá tối thiểu</p>
            <p className="text-xl font-bold text-energy-600">
              {formatCurrency(minIncrement)}
            </p>
          </div>
          <div className="text-center">
            <p className="text-sm text-gray-600 mb-1">Giá đặt tối thiểu</p>
            <p className="text-xl font-bold text-ocean-700">
              {formatCurrency(nextMinBid)}
            </p>
          </div>
        </div>

        {wallet && (
          <div className="mb-6 p-4 bg-gray-50 rounded-xl border border-gray-200">
            <div className="flex items-center justify-between">
              <span className="text-gray-600 flex items-center gap-2">
                <span className="text-xl">💰</span>
                <span>Số dư khả dụng:</span>
              </span>
              <strong
                className={`text-lg font-bold ${
                  wallet.available >= nextMinBid * 0.1
                    ? "text-green-600"
                    : "text-red-600"
                }`}
              >
                {formatVND(wallet.available)}
              </strong>
            </div>
          </div>
        )}

        {auction?.status === "ended" ? (
          <div className="text-center p-6 bg-gray-50 rounded-xl border border-gray-200">
            <p className="text-lg mb-2">
              Phiên đấu giá đã kết thúc. Giá cuối cùng:{" "}
              <strong className="text-ocean-600 text-xl">{formatCurrency(currentPrice)}</strong>
            </p>
            {auction.winnerId === user?.sub ? (
              <div className="mt-4">
                <p className="text-green-600 font-semibold text-lg mb-4">
                  🎉 Chúc mừng! Bạn đã thắng phiên đấu giá này.
                </p>
                <button className="bg-gradient-to-r from-ocean-500 to-energy-500 hover:from-ocean-600 hover:to-energy-600 text-white font-semibold px-6 py-3 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl">
                  Thanh toán / Hoàn tất
                </button>
              </div>
            ) : (
              <p className="text-gray-600 mt-2">
                Người thắng: <strong>{winnerName || "Đang tải..."}</strong>
              </p>
            )}
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Nhập số tiền đặt giá
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-semibold text-lg">
                  ₫
                </span>
                <input
                  type="number"
                  value={input}
                  onChange={(ev) => setInput(ev.target.value)}
                  placeholder={nextMinBid.toLocaleString('vi-VN')}
                  className="w-full pl-10 pr-4 py-4 text-lg font-semibold border-2 border-ocean-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-ocean-500 focus:border-transparent transition-all disabled:bg-gray-100 disabled:cursor-not-allowed"
                  step="1000"
                  min={nextMinBid}
                  disabled={!canBid.ok || placing}
                />
              </div>
              <p className="text-sm text-gray-500">
                {!canBid.ok ? (
                  <span className="text-red-600">{canBid.reason}</span>
                ) : (
                  <>
                    Giá đặt của bạn sẽ được gửi đến server.{" "}
                    <span className="font-semibold text-ocean-600">
                      Đặt cọc cần:{" "}
                      {input
                        ? formatVND(
                            calculateDeposit(
                              parseFloat(input) || 0,
                              (auction as any)?.bidDepositPercent ?? 10
                            )
                          )
                        : "—"}
                    </span>
                  </>
                )}
              </p>
            </div>
            <button
              type="submit"
              className="w-full bg-gradient-to-r from-ocean-500 to-energy-500 hover:from-ocean-600 hover:to-energy-600 text-white font-semibold py-4 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              disabled={!canBid.ok || placing}
            >
              {placing ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Đang đặt giá...</span>
                </>
              ) : pendingBid ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Đang chờ xác nhận...</span>
                </>
              ) : (
                <>
                  <span className="text-xl">🔨</span>
                  <span>Đặt giá ngay</span>
                </>
              )}
            </button>
            {showDepositModal && (
              <button
                type="button"
                className="w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-3 rounded-xl transition-all duration-200 shadow-md hover:shadow-lg flex items-center justify-center gap-2"
                onClick={handleDeposit}
              >
                <span>💳</span>
                <span>Nạp tiền vào ví</span>
              </button>
            )}
          </form>
        )}

        {reconnecting && (
          <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-center">
            <p className="text-yellow-800 text-sm">
              ⚠️ Đang kết nối lại... Tạm thời không thể đặt giá
            </p>
          </div>
        )}
        {!live && !loading && (
          <div className="mt-4 p-3 bg-gray-100 border border-gray-200 rounded-lg text-center">
            <p className="text-gray-600 text-sm">Phiên đấu giá chưa bắt đầu</p>
          </div>
        )}
        {live && (
          <div className={`mt-4 p-4 rounded-xl text-center font-bold text-lg ${
            isFinalSecond 
              ? "bg-red-100 border-2 border-red-500 text-red-700 animate-pulse" 
              : "bg-ocean-50 border border-ocean-200 text-ocean-700"
          }`}>
            ⏰ Thời gian còn lại: {Math.ceil(countdown / 1000)} giây
          </div>
        )}
      </div>

      {/* Bidding History */}
      <div className="bg-white rounded-2xl shadow-lg border border-ocean-200/30 p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-full bg-gradient-to-r from-energy-500 to-ocean-500 flex items-center justify-center">
            <span className="text-white font-bold text-lg">📊</span>
          </div>
          <h2 className="text-2xl font-bold bg-gradient-to-r from-ocean-600 to-energy-600 bg-clip-text text-transparent">
            Lịch sử đặt giá
          </h2>
        </div>
        <div className="space-y-3">
          {auction?.bidHistory && auction.bidHistory.length > 0 ? (
            auction.bidHistory.map((bid) => (
              <div 
                key={bid.bidId} 
                className={`p-4 rounded-xl border transition-all ${
                  bid.isWinning 
                    ? 'bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-500 shadow-md' 
                    : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                }`}
              >
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    {bid.isWinning && <span className="text-2xl">🏆</span>}
                    <div>
                      <span className="font-semibold text-gray-800">
                        {bid.userName || 'Người dùng ẩn danh'}
                      </span>
                      {bid.userId === user?.sub && (
                        <span className="ml-2 px-2 py-0.5 text-xs bg-ocean-500 text-white rounded-full font-bold">
                          (Bạn)
                        </span>
                      )}
                    </div>
                  </div>
                  <span className="font-bold text-xl text-ocean-600">
                    {formatCurrency(bid.amount)}
                  </span>
                </div>
                <div className="text-xs text-gray-500 mt-2">
                  {new Date(bid.timestamp).toLocaleString('vi-VN')}
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-gray-500">
              <p className="text-lg">Chưa có lượt đặt giá nào.</p>
              <p className="text-sm mt-1">Hãy là người đầu tiên đặt giá!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
