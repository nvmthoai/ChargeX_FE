import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
    User,
    MapPin,
    Shield,
    FileCheck,
    Wallet,
    ShoppingBag,
    Gavel
} from "lucide-react";

export default function ProfileSideBar() {
    const [Option, setOption] = useState("");
    const location = useLocation();

    useEffect(() => {
        setOption(location.pathname);
    }, [location]);

    const ListOption = [
        { name: "Profile Details", link: "detail", icon: User },
        { name: "Address", link: "address", icon: MapPin },
        { name: "Security Settings", link: "security", icon: Shield },
        { name: "Know your customer", link: "kyc", icon: FileCheck },
        { name: "Wallet", link: "wallet", icon: Wallet },
        { name: "Orders History", link: "orders", icon: ShoppingBag },
        { name: "My Auctions", link: "auctions", icon: Gavel },
    ];

    return (
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg border border-ocean-100/50 p-4 h-fit sticky top-24">
            <div className="space-y-2">
                {ListOption.map((option) => {
                    const isActive = Option?.includes(option.link);
                    const Icon = option.icon;

                    return (
                        <Link
                            to={option.link}
                            key={option.link}
                            onClick={() => setOption(option.link)}
                            className="block"
                        >
                            <div
                                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${isActive
                                        ? "bg-gradient-to-r from-ocean-400 to-ocean-500 text-white shadow-md shadow-ocean-400/20"
                                        : "text-dark-700 font-medium hover:bg-ocean-50/60 hover:text-ocean-500"
                                    }`}
                            >
                                <Icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-ocean-500'}`} />
                                <span className="font-medium">{option.name}</span>
                            </div>
                        </Link>
                    );
                })}
            </div>
        </div>
    );
}
