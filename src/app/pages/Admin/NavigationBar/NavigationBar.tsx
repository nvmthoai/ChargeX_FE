import { Link, Outlet, useLocation } from "react-router-dom";
// import { useAuth } from '../../hooks/AuthContext/AuthContext.jsx';
import "./NavigationBar.css";

export default function NavigationBar() {
  // const { user } = useAuth();
  const location = useLocation();
  console.log("NavigationBar", location.pathname);

  const menuItems = [
    { name: "MEMBER", icon: "user", path: "/admin/user-management" },
    { name: "KYC", icon: "id-card", path: "/admin/kyc-management" },
    {
      name: "TRANSACTION",
      icon: "dollar",
      path: "/admin/transaction-management",
    },
    { name: "POST", icon: "clipboard", path: "/admin/post-management" },
    {
      name: "REPORT",
      icon: "circle-exclamation",
      path: "/admin/report-management",
    },
    { name: "SETTING", icon: "gear", path: "/admin/profile" },
    { name: "AUCTION", icon: "gear", path: "/admin/auction-management" },
    { name: "AUCTION LIVE", icon: "gear", path: "/admin/auction-live-management" },
  ];

  return (
    <>
      <div className={`navigation-bar-container`}>
        <Link to="/admin">
          <div className="logo">ChargeX</div>
        </Link>
        <div className="items">
          {menuItems.map((item, index) => (
            <div
              key={index}
              className={`item ${
                location.pathname.includes(item.path) ? "located" : ""
              }`}
            >
              <Link to={`${item.path}`}>
                <i className={`fa-solid fa-${item.icon}`}></i>
                <span>{item.name}</span>
              </Link>
            </div>
          ))}
        </div>
      </div>
      <Outlet />
    </>
  );
}
