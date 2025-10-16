import { useEffect, useState } from "react";

export default function Product() {

    const information = {
        title: "Tesla Model 3 Long Range",
        year: "2022",
        imageUrl: "",
        startingBid: 35000,
        currentBid: 38500,
        endTime: "00h 45m 32s",
    };

    // Hàm tính thời gian còn lại
    const calculateTimeLeft = () => {
        const difference = +information.endTime - +new Date();
        let timeLeft = { hours: 0, minutes: 0, seconds: 0 };

        if (difference > 0) {
            timeLeft = {
                hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
                minutes: Math.floor((difference / 1000 / 60) % 60),
                seconds: Math.floor((difference / 1000) % 60),
            };
        }
        return timeLeft;
    };

    const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());

    // Cập nhật bộ đếm mỗi giây
    useEffect(() => {
        const timer = setInterval(() => {
            setTimeLeft(calculateTimeLeft());
        }, 1000);

        // Xóa interval khi component unmount
        return () => clearInterval(timer);
    }, [information.endTime]);

    // Hàm định dạng số có 2 chữ số (ví dụ: 7 -> "07")
    const formatTimeUnit = (unit: number) => unit.toString().padStart(2, "0");

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
            <h1 className="auction-title">Live Auction: {information.title} ({information.year})</h1>
            <div className="auction-card product-card">
                <div className="card-image">
                    <img src={information.imageUrl} alt={`${information.title} (${information.year})`} />
                </div>
                <div className="card-details">
                    <h2 className="item-title">
                        {information.title} ({information.year})
                    </h2>
                    <p className="bid-info">
                        Starting Bid: <span>{formatCurrency(information.startingBid)}</span>
                    </p>
                    <p className="current-bid-label">Current Highest Bid:</p>
                    <p className="current-bid-amount">{formatCurrency(information.currentBid)}</p>
                    <div className="countdown-timer">
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
                        <span>
                            {formatTimeUnit(timeLeft.hours)}h {formatTimeUnit(timeLeft.minutes)}m{" "}
                            {formatTimeUnit(timeLeft.seconds)}s
                        </span>
                    </div>
                </div>
            </div>
        </div>
    )
}
