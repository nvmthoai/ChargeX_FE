import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import "./ProfileSideBar.css";

export default function ProfileSideBar() {
    console.log("ProfileSideBar console");

    const [Option, setOption] = useState("");
    const location = useLocation();

    useEffect(() => {
        setOption(location.pathname);
    }, [location])

    const ListOption = [
        { name: "Profile Details", link: "detail" },
        { name: "Address", link: "address" },
        { name: "Security Settings", link: "security" },
        { name: "Notification Preferences", link: "notification" },
        { name: "Linked Accounts", link: "linked-account" },
        { name: "Know your customer", link: "kyc" },
        { name: "Wallet", link: "wallet" },
        { name: "Orders History", link: "orders" },
        { name: "My Auctions", link: "auctions" },
    ];

    return (
        <div className="profilesidebar-container">
            {ListOption.map((option) => (
                <Link
                    to={option.link}
                    key={option.link}
                    onClick={() => setOption(option.link)}
                >
                    <div className={`option ${Option?.includes(option.link) ? "active" : ""}`}>
                        <div className="option-name">{option.name}</div>
                    </div>
                </Link>
            ))}
        </div>
    )
}
