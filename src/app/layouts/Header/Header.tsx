import { Link, useLocation, useNavigate } from "react-router-dom";
import { Info, Gavel, ShoppingBag } from "lucide-react";
import { useAuth } from "../../hooks/AuthContext";
import { useState } from "react";
import { Button, Dropdown } from "antd";
import { WalletOutlined, LogoutOutlined } from "@ant-design/icons";
import WalletDisplay from "./WalletDisplay";
import DepositModal from "./DepositModal";
import WithdrawalModal from "./WithdrawalModal";
import useWallet from "../../hooks/useWallet";
import useUser from "../../hooks/useUser";

export interface Bank {
  id: number;
  name: string;
  code: string;
  bin: string;
  shortName: string;
  logo: string;
  transferSupported: number;
  lookupSupported: number;
}

export default function Header() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [depositModalOpen, setDepositModalOpen] = useState(false);

  const [banks, setBanks] = useState<Bank[]>([]);
  const [loadingBanks, setLoadingBanks] = useState(false);
  const {
    handleDeposit,
    handleWithdrawls,
    myWallet,
    setWithdrawalModalOpen,
    withdrawalModalOpen,
  } = useWallet();
  const { userDetail } = useUser();

  // Hide header on authentication pages (login / register / verify otp) and admin pages
  const isAuthRoute = location.pathname.startsWith("/auth") || location.pathname.startsWith("/verify-otp");
  const isAdminRoute = location.pathname.startsWith("/admin");
  if (isAuthRoute || isAdminRoute) {
    return null;
  }

  const handleWithdrawalOpen = async () => {
    setWithdrawalModalOpen(true);
    setLoadingBanks(true);
    try {
      const response = await fetch("https://api.vietqr.io/v2/banks");
      const data = await response.json();
      if (data.code === "00" && data.data) {
        setBanks(data.data);
      }
    } catch (error) {
      console.error("Failed to fetch banks:", error);
    } finally {
      setLoadingBanks(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const menuItems = [
    { to: "/", label: "Home", icon: ShoppingBag },
    { to: "/auction", label: "Auction", icon: Gavel },
    { to: "/shop", label: "Shop", icon: ShoppingBag },
    { to: "/about", label: "About", icon: Info },
  ];

  const userMenuItems = [
    {
      key: "profile",
      label: "Profile",
      onClick: () => navigate("/profile"),
    },
    {
      key: "logout",
      label: "Logout",
      icon: <LogoutOutlined />,
      onClick: handleLogout,
    },
  ];

  return (
    <header className="sticky top-0 z-50 w-full backdrop-blur-xl bg-gradient-to-r from-white via-ocean-50/40 to-energy-50/30 border-b border-ocean-200/20 shadow-md shadow-ocean-500/10">
      <div className="max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3 group">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-ocean-400 to-energy-400 rounded-xl blur opacity-30 group-hover:opacity-50 transition-opacity"></div>
              <img
                src="/chargeX_Logo.png"
                alt="ChargeX Logo"
                className="relative w-12 h-12 object-contain transform group-hover:scale-105 transition-transform"
              />
            </div>
            <div className="hidden sm:block">
              <h1 className="text-xl font-bold bg-gradient-to-r from-ocean-600 to-energy-600 bg-clip-text text-transparent">
                ChargeX
              </h1>
              <p className="text-xs text-dark-800 font-medium">EV Marketplace</p>
            </div>
          </Link>

          {/* Menu */}
          <nav className="hidden md:flex items-center gap-2">
            {menuItems.map((item) => {
              const active =
                location.pathname === item.to ||
                location.pathname.startsWith(`${item.to}/`);
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                    active
                      ? "bg-gradient-to-r from-ocean-400 to-ocean-500 text-white shadow-md shadow-ocean-400/20 font-semibold"
                      : "text-dark-700 hover:text-ocean-600 hover:bg-ocean-50/60 focus:text-ocean-600"
                  }`}
                >
                  <item.icon size={16} />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* User Section */}
          <div className="flex items-center gap-4">
        {user ? (
          <>
            <div className="flex items-center gap-3">
              <Dropdown
                menu={{ items: [] }}
                trigger={["click"]}
                dropdownRender={() => (
                  <div className="bg-white rounded-lg shadow-lg p-4 w-80">
                    {myWallet && <WalletDisplay wallet={myWallet} />}
                  </div>
                )}
              >
                <Button
                  type="text"
                  icon={<WalletOutlined className="text-blue-500" />}
                  className="text-sm font-semibold text-gray-700 hover:bg-white/60"
                >
                  ${myWallet && myWallet.available}
                </Button>
              </Dropdown>

              <Link to='/cart'>
                <Button
                  type="primary"
                  size="small"
                  className="bg-green-500 hover:bg-green-600"
                >
                  <i className="fa-solid fa-cart-shopping"/>
                </Button>
              </Link>

              <Button
                type="primary"
                size="small"
                onClick={() => setDepositModalOpen(true)}
                className="bg-green-500 hover:bg-green-600"
              >
                Deposit
              </Button>

              <Button
                type="default"
                size="small"
                onClick={handleWithdrawalOpen}
                className="rounded-lg"
              >
                Withdraw
              </Button>
            </div>

            <Link
              to="/profile"
              className="flex items-center gap-3 bg-white rounded-full px-3 py-1.5 shadow-sm hover:bg-gray-50 transition-all"
            >
              <span className="text-sm font-semibold text-gray-700">
                Hello, {userDetail?.user?.fullName || "User"} 👋
              </span>
              <img
                src={userDetail?.user?.image || "/default_avatar.png"}
                alt="avatar"
                className="w-8 h-8 rounded-full object-cover"
              />
            </Link>

            <Dropdown menu={{ items: userMenuItems }} trigger={["click"]}>
              <Button type="text" className="text-sm text-gray-500">
                ⋮
              </Button>
            </Dropdown>
          </>
        ) : (
          <button
            onClick={() => navigate("/auth")}
            className="px-4 py-1.5 bg-white rounded-full shadow text-sm font-medium text-gray-700 hover:text-gray-900 transition"
          >
            Login
          </button>
        )}
          </div>
        </div>
      </div>
      <DepositModal
        open={depositModalOpen}
        onClose={() => setDepositModalOpen(false)}
        onSubmit={handleDeposit}
      />
      <WithdrawalModal
        open={withdrawalModalOpen}
        onClose={() => setWithdrawalModalOpen(false)}
        onSubmit={handleWithdrawls}
        banks={banks}
        loadingBanks={loadingBanks}
      />
    </header>
  );
}
