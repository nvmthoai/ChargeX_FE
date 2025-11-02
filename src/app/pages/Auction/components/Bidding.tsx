import React, { useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import useAuctionLive from "../../../hooks/useAuctionLive";
import { useAuth } from "../../../hooks/AuthContext";
import toast from "react-hot-toast";

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
  });

  const [input, setInput] = useState<string>("");
  const [placing, setPlacing] = useState(false);

  const currentPrice = auction?.currentPrice ?? 0;
  const minIncrement = auction?.minIncrement ?? 0;
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
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
    }).format(amount);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseFloat(input);
    if (Number.isNaN(amount)) return toast.error("Invalid amount");
    if (amount < nextMinBid)
      return toast.error(`Minimum bid is ${formatCurrency(nextMinBid)}`);
    if (!canBid.ok) return toast.error(canBid.reason);

    setPlacing(true);
    try {
      // optimistic UI is handled inside hook via pendingBid
      await placeBid(amount);
      toast.success("Bid submitted — waiting for confirmation...");
      setInput("");
      // server will emit auction:bid — resync will also update state
    } catch (err: any) {
      // rollback handled by hook; show error
      const msg = err?.message ?? "Bid failed";
      toast.error(msg);
    } finally {
      setPlacing(false);
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
        </div>

        {auction?.status === "ended" ? (
          <div className="auction-ended">
            <p>
              Auction ended. Final price:{" "}
              <strong>
                {formatCurrency(auction.finalPrice ?? currentPrice)}
              </strong>
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
                  : "Your bid will be sent to the server for confirmation."}
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
          {/* History should come from auction.participants or separate API — placeholder */}
          <p>Live updates will appear here.</p>
        </div>
      </div>
    </div>
  );
}
