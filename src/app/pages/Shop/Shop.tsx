import { Outlet, NavLink, useLocation } from "react-router-dom";
import { ShoppingBag, History, Gavel } from "lucide-react";

export default function Shop() {
  const location = useLocation();
  const path = location.pathname;

  const menuItems = [
    {
      to: "products",
      label: "Sản phẩm bán",
      icon: ShoppingBag,
      isActive: path.includes("/shop/products") || path.includes("/shop/productdetail"),
    },
    {
      to: "history",
      label: "Lịch sử mua bán",
      icon: History,
      isActive: path.includes("/shop/history"),
    },
    {
      to: "auction",
      label: "Quản lý đấu giá",
      icon: Gavel,
      isActive: path.includes("/shop/auction"),
    },
  ];

  return (
    <div className="flex bg-gradient-to-br from-slate-50 via-white to-blue-50">
      {/* Sidebar */}
      <aside className="fixed left-0 h-full w-64 bg-white/80 backdrop-blur-md border-r border-gray-200 shadow-sm flex flex-col z-30">
        <nav className="flex flex-col gap-1 mt-3 px-3">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                className={`relative group flex items-center gap-3 px-4 py-3 rounded-md text-[15px] font-medium transition-all duration-200 ${
                  item.isActive
                    ? "bg-gradient-to-r from-[#0F74C7] to-[#0F74C7] text-white shadow-sm"
                    : "hover:bg-blue-50 text-gray-700"
                }`}
              >
                {/* Thanh active bên trái */}
                {item.isActive && (
                  <span className="absolute left-0 top-0 h-full w-[4px] bg-blue-400 rounded-r-md"></span>
                )}

                <div
                  className={`w-9 h-9 flex items-center justify-center rounded-md transition-all ${
                    item.isActive
                      ? "bg-white/25 text-white"
                      : "bg-gray-100 text-gray-600 group-hover:bg-blue-100 group-hover:text-blue-700"
                  }`}
                >
                  <Icon size={18} />
                </div>

                <span
                  className={`transition-colors ${
                    item.isActive
                      ? "text-white font-semibold"
                      : "text-gray-700 group-hover:text-blue-700"
                  }`}
                >
                  {item.label}
                </span>
              </NavLink>
            );
          })}
        </nav>
      </aside>

      {/* Main content */}
      <main className="ml-64 flex-1 h-[calc(100vh-5rem)] overflow-y-auto p-8 scrollbar-hide">
        <div className="max-w-6xl mx-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
