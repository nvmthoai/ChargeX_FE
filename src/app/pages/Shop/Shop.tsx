import { useState } from "react";
import { Outlet, NavLink } from "react-router-dom";
import { Menu, ShoppingBag, History, Gavel } from "lucide-react";

export default function Shop() {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div className="flex min-h-[calc(100vh-4rem)] bg-gray-50">
      {/* Sidebar */}
      <aside
        className={`h-[calc(100vh-4rem)] w-64 bg-white border-r border-gray-200 p-4 transition-transform duration-300 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Header của sidebar */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-semibold text-gray-800 text-lg">Shop Menu</h2>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="text-gray-500 hover:text-gray-800 transition-colors"
          >
            <Menu size={18} />
          </button>
        </div>

        {/* Menu */}
        <nav className="flex flex-col gap-1">
          <NavLink
            to="products"
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-150
              ${
                isActive
                  ? "bg-blue-100 text-blue-700 font-semibold"
                  : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
              }`
            }
          >
            <ShoppingBag size={18} className="shrink-0" />
            Sản phẩm bán
          </NavLink>

          <NavLink
            to="history"
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-150
              ${
                isActive
                  ? "bg-blue-100 text-blue-700 font-semibold"
                  : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
              }`
            }
          >
            <History size={18} className="shrink-0" />
            Lịch sử mua bán
          </NavLink>

          <NavLink
            to="auction"
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-150
              ${
                isActive
                  ? "bg-blue-100 text-blue-700 font-semibold"
                  : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
              }`
            }
          >
            <Gavel size={18} className="shrink-0" />
            Sản phẩm đấu giá
          </NavLink>
        </nav>
      </aside>

      {/* Nội dung chính */}
      <main className="flex-1 p-6 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
}
