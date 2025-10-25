import { Outlet, NavLink } from "react-router-dom";
import { ShoppingBag, History, Gavel } from "lucide-react";

export default function Shop() {
  const menuItems = [
    { to: "products", label: "Sản phẩm bán", icon: ShoppingBag },
    { to: "history", label: "Lịch sử mua bán", icon: History },
    { to: "auction", label: "Sản phẩm đấu giá", icon: Gavel },
  ];

  return (
    <div className="flex bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Sidebar cố định bên trái, không di chuyển khi cuộn */}
      <aside className="fixed top-20 left-0 h-[calc(100vh-5rem)] w-64 bg-white border-r border-gray-200 shadow-md flex flex-col justify-between z-30">
        <nav className="flex flex-col gap-2 mt-4 px-4">
          {menuItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end
              className={({ isActive }) =>
                `group flex items-center gap-3 px-4 py-3 rounded-xl text-[15px] font-medium transition-all duration-200 ${
                  isActive
                    ? "bg-gradient-to-r from-blue-500 to-blue-400 shadow-md"
                    : "hover:bg-gray-100"
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <div
                    className={`w-9 h-9 flex items-center justify-center rounded-xl transition-colors duration-200 ${
                      isActive
                        ? "bg-white/20 text-white"
                        : "bg-gray-100 text-gray-600 group-hover:bg-gray-200 group-hover:text-gray-800"
                    }`}
                  >
                    <item.icon size={18} />
                  </div>
                  <span
                    className={`transition-colors duration-200 ${
                      isActive
                        ? "text-white font-semibold"
                        : "text-gray-700 group-hover:text-gray-900"
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

      {/* Main content — chỉ phần này được cuộn */}
      <main className="ml-64 flex-1 h-[calc(100vh-5rem)] overflow-y-auto p-8">
        <Outlet />
      </main>
    </div>
  );
}
