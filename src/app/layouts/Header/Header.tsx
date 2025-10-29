import { Link, useLocation, useNavigate } from "react-router-dom";
import { Info, Gavel, ShoppingBag } from "lucide-react";
import { useAuth } from "../../hooks/AuthContext";
import { useState } from "react";
import { Button, Dropdown } from "antd";
import { WalletOutlined, LogoutOutlined } from "@ant-design/icons";
import WalletDisplay from "./WalletDisplay";
import DepositModal from "./DepositModal";
import useWallet from "../../hooks/useWallet";

export default function Header() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [depositModalOpen, setDepositModalOpen] = useState(false);
  const { handleDeposit, myWallet } = useWallet();

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
    <header className="mx-auto bg-[#e8f0f5] px-8 py-3 shadow-sm flex items-center justify-between">
      {/* Logo */}
      <Link to="/">
        <div className="flex items-center">
          <img
            src="/chargeX_Logo.png"
            alt="Logo"
            className="w-12 h-12 object-contain"
          />
        </div>
      </Link>

      {/* Menu */}
      <nav className="flex items-center gap-6">
        {menuItems.map((item) => {
          const active =
            location.pathname === item.to ||
            location.pathname.startsWith(`${item.to}/`);
          return (
            <Link
              key={item.to}
              to={item.to}
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                active
                  ? "bg-sky-300/80 text-gray-900 shadow-sm"
                  : "text-gray-600 hover:text-gray-900 hover:bg-white/60"
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
                  {myWallet && myWallet.available}
                </Button>
              </Dropdown>

              <Button
                type="primary"
                size="small"
                onClick={() => setDepositModalOpen(true)}
                className="bg-green-500 hover:bg-green-600"
              >
                Deposit
              </Button>
            </div>

            <Link
              to="/profile"
              className="flex items-center gap-3 bg-white rounded-full px-3 py-1.5 shadow-sm hover:bg-gray-50 transition-all"
            >
              <span className="text-sm font-semibold text-gray-700">
                Hello, {user.fullname || "User"} 👋
              </span>
              <img
                src={"https://i.pravatar.cc/40"}
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

      <DepositModal
        open={depositModalOpen}
        onClose={() => setDepositModalOpen(false)}
        onSubmit={handleDeposit}
      />
    </header>
  );
}
