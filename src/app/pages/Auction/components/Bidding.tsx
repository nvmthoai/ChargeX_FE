
import React, { useState } from "react";

export default function Bidding() {

    interface Bid {
        name: string;
        time: string;
        amount: number;
    }

    // Dữ liệu mẫu cho lịch sử đấu giá
    const initialBids: Bid[] = [
        { name: "Alice Johnson", time: "2 minutes ago", amount: 38500.00 },
        { name: "Bob Smith", time: "5 minutes ago", amount: 38300.00 },
        { name: "Charlie Brown", time: "10 minutes ago", amount: 38000.00 },
        { name: "David Lee", time: "15 minutes ago", amount: 37800.00 },
        { name: "Eva Davis", time: "20 minutes ago", amount: 37500.00 },
    ];

    const [bids, setBids] = useState<Bid[]>(initialBids);
    const [currentBid, setCurrentBid] = useState<string>("");

    const highestBid = bids.length > 0 ? bids[0].amount : 0;
    const minimumBid = highestBid + 100;

    const handleBidChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setCurrentBid(event.target.value);
    };

    const handlePlaceBid = (event: React.FormEvent) => {
        event.preventDefault();
        const newBidAmount = parseFloat(currentBid);
        if (newBidAmount >= minimumBid) {
            const newBid: Bid = {
                name: "Your Name", // Thay thế bằng tên người dùng hiện tại
                time: "just now",
                amount: newBidAmount,
            };
            setBids([newBid, ...bids]);
            setCurrentBid("");
            alert(`Đấu giá thành công với số tiền: $${newBidAmount.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`);
        } else {
            alert(`Giá của bạn phải cao hơn ít nhất $100 so với giá cao nhất hiện tại. Giá tối thiểu là $${minimumBid.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}.`);
        }
    };

    // Hàm định dạng tiền tệ
    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: "USD",
            minimumFractionDigits: 2,
        }).format(amount);
    };

    return (
        <div className="product-bidding-container">
            {/* --- Phần đặt giá --- */}
            <div className="auction-card place-bid-card">
                <h2 className="card-title">Place Your Bid</h2>
                <form onSubmit={handlePlaceBid} className="place-bid-form">
                    <div className="bid-input-wrapper">
                        <input
                            type="number"
                            value={currentBid}
                            onChange={handleBidChange}
                            placeholder={minimumBid.toFixed(2)}
                            className="bid-input"
                            step="0.01"
                            min={minimumBid}
                        />
                        <p className="bid-helper-text">
                            Your bid must be at least $100.00 higher than the current highest bid.
                        </p>
                    </div>
                    <button type="submit" className="btn">
                        Place Bid
                    </button>
                </form>
            </div>

            {/* --- Phần lịch sử đấu giá --- */}
            <div className="auction-card bidding-history">
                <h2 className="card-title">Bidding History</h2>
                <div className="history-list">
                    {bids.map((bid, index) => (
                        <div key={index} className="history-item">
                            <div className="bidder-info">
                                <p className="bidder-name">{bid.name}</p>
                                <p className="bid-time">{bid.time}</p>
                            </div>
                            <p className="bid-amount">{formatCurrency(bid.amount)}</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}