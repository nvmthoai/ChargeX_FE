import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/AuthContext";
import {
  Users,
  Shield,
  Gavel,
  Radio,
  Wallet,
  AlertCircle,
  LogOut,
  Home,
  Sparkles
} from "lucide-react";

export default function AdminNavigationBar() {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    { name: "Members", icon: Users, path: "/admin/user-management" },
    { name: "KYC", icon: Shield, path: "/admin/kyc-management" },
    { name: "Auctions", icon: Gavel, path: "/admin/auction-management" },
    { name: "Live Auctions", icon: Radio, path: "/admin/auction-live-management" },
    { name: "Withdrawals", icon: Wallet, path: "/admin/withdraw-request-management" },
    { name: "Disputes", icon: AlertCircle, path: "/admin/disputes-request-management" },
  ];

  const isActive = (path: string) => {
    return location.pathname === path || location.pathname.startsWith(path + "/");
  };

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 backdrop-blur-xl bg-dark-900/95 border-r border-ocean-800/30 shadow-xl z-50 flex flex-col">
      {/* Logo Section */}
      <div className="p-6 border-b border-ocean-800/30">
        <Link to="/admin" className="flex items-center gap-3 group">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-ocean-400 to-energy-400 rounded-xl blur opacity-30 group-hover:opacity-50 transition-opacity"></div>
            <div className="relative p-2 bg-gradient-to-r from-ocean-500 to-energy-500 rounded-xl">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
          </div>
          <div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-ocean-400 to-energy-400 bg-clip-text text-transparent">
              ChargeX Admin
            </h1>
            <p className="text-xs text-dark-300 font-medium">Dashboard</p>
          </div>
        </Link>
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 overflow-y-auto p-4 space-y-2">
        {menuItems.map((item) => {
          const active = isActive(item.path);
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`relative flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 group focus:outline-none focus:ring-4 ${
                active
                  ? "bg-gradient-to-r from-ocean-500 to-ocean-600 text-white shadow-lg shadow-ocean-500/40 scale-105 focus:ring-ocean-500/50"
                  : "text-dark-200 hover:text-ocean-400 hover:bg-dark-800 focus:ring-ocean-400/40"
              }`}
            >
              {active && (
                <span className="absolute inset-0 bg-gradient-to-r from-ocean-400/20 to-energy-400/20 rounded-xl blur-xl"></span>
              )}
              <item.icon
                className={`w-5 h-5 relative z-10 ${active ? "text-white animate-pulse" : "text-dark-300 group-hover:text-ocean-400"}`}
              />
              <span className={`font-medium relative z-10 ${active ? "text-white" : "text-dark-200 group-hover:text-ocean-400"}`}>
                {item.name}
              </span>
              {active && (
                <div className="ml-auto w-2 h-2 bg-white rounded-full animate-pulse relative z-10"></div>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Footer Actions */}
      <div className="p-4 border-t border-ocean-800/30 space-y-2">
        <Link
          to="/"
          className="flex items-center gap-3 px-4 py-3 rounded-xl text-dark-200 hover:text-ocean-400 hover:bg-dark-800 transition-all group"
        >
          <Home className="w-5 h-5 text-dark-300 group-hover:text-ocean-400" />
          <span className="font-medium">Back to Site</span>
        </Link>
        <button
          onClick={() => {
            logout();
            navigate("/");
          }}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-400 hover:text-red-300 hover:bg-red-900/20 transition-all group"
        >
          <LogOut className="w-5 h-5 group-hover:scale-110 transition-transform" />
          <span className="font-medium">Logout</span>
        </button>
      </div>
    </aside>
  );
}

