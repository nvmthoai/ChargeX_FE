import { useEffect, useState } from "react";
import "./ProfileWallet.css";

export default function ProfileWallet() {

    const [selectedCardId, setSelectedCardId] = useState("");
    const [userBalance, setUserBalance] = useState(0);

    useEffect(() => {
        setUserBalance(0);
    },[])

    const cards = [
        { id: "1", name: "VISA", type: "CREDIT", number: "**** **** **** 8763" },
        { id: "2", name: "VISA", type: "CREDIT", number: "**** **** **** 1792" },
    ]

    const transactions = [
        { title: "Money Transfer Joana", date: "12/10/2015 14:48", amount: 120000, type: "Transfer", positive: true },
        { title: "Design eBook", date: "08/10/2015 10:05", amount: 4000, type: "Books", positive: false },
        { title: "Neon99", date: "29/09/2015 12:10", amount: 12000, type: "Food", positive: false },
        { title: "Wages", date: "14/09/2015 11:38", amount: 26000, type: "Wages", positive: true },
        { title: "Pig&Heifer", date: "26/09/2015 14:40", amount: 10000, type: "Food", positive: false },
        { title: "Apple Store", date: "26/09/2015 14:40", amount: 10000, type: "Phone", positive: false },
        { title: "Money Transfer Joana", date: "12/10/2015 14:48", amount: 120000, type: "Transfer", positive: true },
        { title: "Design eBook", date: "08/10/2015 10:05", amount: 4000, type: "Books", positive: false },
        { title: "Neon99", date: "29/09/2015 12:10", amount: 12000, type: "Food", positive: false },
        { title: "Wages", date: "14/09/2015 11:38", amount: 26000, type: "Wages", positive: true },
        { title: "Pig&Heifer", date: "26/09/2015 14:40", amount: 10000, type: "Food", positive: false },
        { title: "Apple Store", date: "26/09/2015 14:40", amount: 10000, type: "Phone", positive: false },
        { title: "Money Transfer Joana", date: "12/10/2015 14:48", amount: 120000, type: "Transfer", positive: true },
        { title: "Design eBook", date: "08/10/2015 10:05", amount: 4000, type: "Books", positive: false },
        { title: "Neon99", date: "29/09/2015 12:10", amount: 12000, type: "Food", positive: false },
        { title: "Wages", date: "14/09/2015 11:38", amount: 26000, type: "Wages", positive: true },
        { title: "Pig&Heifer", date: "26/09/2015 14:40", amount: 10000, type: "Food", positive: false },
        { title: "Apple Store", date: "26/09/2015 14:40", amount: 10000, type: "Phone", positive: false },
    ];

    return (
        <div className="profilewallet-container profile-content">
            <div className="wallet-section">
                <div className="title">My Wallet</div>

                <div className="cards">
                    {cards.map((c, index) => (
                        <div key={index} className={`card ${c.id == selectedCardId ? "selected" : ""}`} onClick={() => setSelectedCardId(c.id)}>
                            <div className="card-header">
                                <span className="logo">{c.name}</span>
                                <span className="type">{c.type}</span>
                            </div>
                            <p>{c.number}</p>
                        </div>
                    ))}

                    <button className="add-card">
                        <span>+</span>
                    </button>
                </div>

                <div className="space"></div>
            </div>

            <div className="balance-section">
                <div className="balance-header">
                    <div className="flex justify-between items-center">
                        <div className="title">Balance</div>
                        <div className="balance">{userBalance.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}</div>
                    </div>
                    <div className="sub-title">Transactions</div>
                </div>

                <div className="transactions">
                    <div>
                        {transactions.map((t, index) => (
                            <div key={index} className={`item ${t.positive ? "positive" : "negative"}`}>
                                <div className="info">
                                    <span className="content">{t.title}</span>
                                    <span className="date">{t.date}</span>
                                </div>
                                <div className="amount">{t.amount?.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}</div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="space"></div>
            </div>
        </div>
    )
}
