import React, { useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import useAuctionLive from "../../../hooks/useAuctionLive";
import { useAuth } from "../../../hooks/AuthContext";
import useWallet from "../../../hooks/useWallet";
import toast from "react-hot-toast";
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
    isConnected,
    countdown,
    placeBid,
    pendingBid,
    resync,
  } = useAuctionLive(auctionId, {
    resyncIntervalSeconds: 8,
    bidderId: user?.sub || null, // Pass user ID from auth context
  });

  const {
    wallet,
    loading: walletLoading,
    deposit,
    calculateDeposit,
    checkSufficientBalance,
    formatCurrency: formatVND,
    fetchBalance,
  } = useWallet({ autoFetch: true, refreshIntervalSeconds: 30 });

  const [input, setInput] = useState<string>("");
  const [placing, setPlacing] = useState(false);
  const [showDepositModal, setShowDepositModal] = useState(false);

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

  return (
    <div className="product-bidding-container">
      <div
        className={`auction-card place-bid-card ${
          isFinalSecond ? "final-second" : ""
        }`}
      >
        <h2 className="card-title">Place Your Bid</h2>

        <div className="current-info">
          <p>
            Current Price: <strong>{formatCurrency(currentPrice)}</strong>
          </p>
          <p>
            Min Increment: <strong>{formatCurrency(minIncrement)}</strong>
          </p>
          <p>
            Next Min Bid: <strong>{formatCurrency(nextMinBid)}</strong>
          </p>
          {wallet && (
            <p className="mt-2 text-gray-600">
              💰 Your Balance:{" "}
              <strong
                className={
                  wallet.available >= nextMinBid * 0.1
                    ? "text-green-600"
                    : "text-red-600"
                }
              >
                {formatVND(wallet.available)}
              </strong>
            </p>
          )}
        </div>

        {auction?.status === "ended" ? (
          <div className="auction-ended">
            <p>
              Auction ended. Final price:{" "}
              <strong>{formatCurrency(currentPrice)}</strong>
            </p>
            {auction.winnerId === user?.sub ? (
              <div>
                <p className="winner">
                  You won! Complete payment to claim the item.
                </p>
                <button className="btn primary">Pay / Complete</button>
              </div>
            ) : (
              <p className="loser">
                Auction finished. Winner: {auction.winnerId ?? "N/A"}
              </p>
            )}
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="place-bid-form">
            <div className="bid-input-wrapper">
              <input
                type="number"
                value={input}
                onChange={(ev) => setInput(ev.target.value)}
                placeholder={nextMinBid.toFixed(2)}
                className="bid-input"
                step="0.01"
                min={nextMinBid}
                disabled={!canBid.ok || placing}
              />
              <p className="bid-helper-text">
                {!canBid.ok
                  ? canBid.reason
                  : `Your bid will be sent to the server. Deposit required: ${
                      input
                        ? formatVND(
                            calculateDeposit(
                              parseFloat(input) || 0,
                              (auction as any)?.bidDepositPercent ?? 10
                            )
                          )
                        : "—"
                    }`}
              </p>
            </div>
            <button
              type="submit"
              className="btn"
              disabled={!canBid.ok || placing}
            >
              {placing
                ? "Placing..."
                : pendingBid
                ? "Bid Pending..."
                : "Place Bid"}
            </button>
            {showDepositModal && (
              <button
                type="button"
                className="btn primary mt-2"
                onClick={handleDeposit}
              >
                💳 Deposit Funds
              </button>
            )}
          </form>
        )}

        {reconnecting && (
          <p className="reconnect-overlay">Reconnecting... bids are disabled</p>
        )}
        {!live && !loading && <p className="live-status">Not live</p>}
        <div className={`countdown ${isFinalSecond ? "pulse" : ""}`}>
          Time left: {Math.ceil(countdown / 1000)}s
        </div>
      </div>

      <div className="auction-card bidding-history">
        <h2 className="card-title">Bidding History</h2>
        <div className="history-list">
          {auction?.bidHistory && auction.bidHistory.length > 0 ? (
            <div className="space-y-2">
              {auction.bidHistory.map((bid) => (
                <div 
                  key={bid.bidId} 
                  className={`p-3 rounded ${bid.isWinning ? 'bg-green-100 border-2 border-green-500' : 'bg-gray-100'}`}
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <span className="font-semibold">
                        {bid.isWinning && '🏆 '}
                        {bid.userName || 'Anonymous'}
                      </span>
                      {bid.userId === user?.sub && (
                        <span className="ml-2 text-xs text-blue-600 font-bold">(You)</span>
                      )}
                    </div>
                    <span className="font-bold text-lg">{formatCurrency(bid.amount)}</span>
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    {new Date(bid.timestamp).toLocaleString('vi-VN')}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">No bids yet. Be the first to bid!</p>
          )}
        </div>
      </div>
    </div>
  );
}
