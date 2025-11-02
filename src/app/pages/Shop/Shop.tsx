import { Outlet, NavLink } from "react-router-dom";
import { ShoppingBag, History, Gavel } from "lucide-react";

export default function Shop() {
  const menuItems = [
    { to: "products", label: "Sản phẩm bán", icon: ShoppingBag },
    { to: "history", label: "Lịch sử mua bán", icon: History },
    { to: "auction", label: "Sản phẩm đấu giá", icon: Gavel },
  ];

  return (
    <div className="flex bg-gradient-to-br from-slate-50 via-white to-blue-50">
      {/* Sidebar */}
      <aside className="fixed left-0 h-full w-64 bg-white/80 backdrop-blur-md border-r border-gray-200 shadow-sm flex flex-col z-30">
        {/* Nav Items */}
        <nav className="flex flex-col gap-1 mt-3 px-3">
          {menuItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end
              className={({ isActive }) =>
                `relative group flex items-center gap-3 px-4 py-3 rounded-md text-[15px] font-medium transition-all duration-200 ${
                  isActive
                    ? "bg-gradient-to-r from-blue-500 to-sky-400 text-white shadow-sm"
                    : "hover:bg-blue-50 text-gray-700"
                }`
              }
            >
              {({ isActive }) => (
                <>
                  {/* Thanh active bên trái */}
                  {isActive && (
                    <span className="absolute left-0 top-0 h-full w-[4px] bg-blue-400 rounded-r-md"></span>
                  )}

                  <div
                    className={`w-9 h-9 flex items-center justify-center rounded-md transition-all ${
                      isActive
                        ? "bg-white/25 text-white"
                        : "bg-gray-100 text-gray-600 group-hover:bg-blue-100 group-hover:text-blue-700"
                    }`}
                  >
                    <item.icon size={18} />
                  </div>

                  <span
                    className={`transition-colors ${
                      isActive
                        ? "text-white font-semibold"
                        : "text-gray-700 group-hover:text-blue-700"
                    }`}
                  >
                    {item.label}
                  </span>
                </>
              )}
            </NavLink>
          ))}
        </nav>
      </aside>

      {/* Main content */}
      <main className="ml-64 flex-1 h-[calc(100vh-5rem)] overflow-y-auto p-8">
        <div className="max-w-6xl mx-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
