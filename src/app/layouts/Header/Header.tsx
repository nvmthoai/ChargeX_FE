import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { Search } from "lucide-react";

export default function Header() {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);

  // 🧠 Lấy user từ localStorage khi trang load
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) setUser(JSON.parse(storedUser));
  }, []);

  // 🔴 Logout
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    navigate("/");
  };

  return (
    <header className="bg-white border-b border-gray-200 shadow-sm mx-auto px-8 py-3 flex items-center justify-between">
      {/* Left icon */}
      <div className="flex items-center gap-4">
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-400 to-pink-500 flex items-center justify-center text-white font-bold text-sm">
          ☎
        </div>
      </div>

      {/* Center nav with logo in middle */}
      <nav className="flex items-center gap-8 text-sm font-medium text-gray-600">
        <Link to="/about" className="hover:text-gray-900 transition-colors">
          About
        </Link>
        <Link to="/features" className="hover:text-gray-900 transition-colors">
          Features
        </Link>
        <Link to="/pricing" className="hover:text-gray-900 transition-colors">
          Pricing
        </Link>

        {/* Logo in the middle */}
        <div className="relative px-6">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-yellow-100/60 to-transparent skew-x-[-20deg] rounded-md" />
          <Link
            to="/"
            className="relative z-10 text-center text-sm font-semibold tracking-wide"
          >
            <span className="block text-[10px] text-gray-400">THIS IS</span>
            <span className="block text-lg font-bold text-gray-900">MY LOGO</span>
          </Link>
        </div>

        <Link to="/gallery" className="hover:text-gray-900 transition-colors">
          Gallery
        </Link>
        <Link to="/team" className="hover:text-gray-900 transition-colors">
          Team
        </Link>
      </nav>

      {/* Right actions */}
      <div className="flex items-center gap-4">
        <button className="text-gray-500 hover:text-gray-800 transition-colors">
          <Search size={18} />
        </button>

        {user ? (
          <>
            <Link
              to="/profile"
              className="border border-gray-300 text-gray-700 text-sm px-4 py-1.5 rounded-md hover:border-gray-800 hover:text-gray-900 transition-all"
            >
              Profile
            </Link>
            <button
              onClick={handleLogout}
              className="text-gray-500 hover:text-gray-800 text-sm"
            >
              Logout
            </button>
          </>
        ) : (
          <button
            onClick={() => navigate("/auth")}
            className="border border-gray-300 text-gray-700 text-sm px-4 py-1.5 rounded-md hover:border-gray-800 hover:text-gray-900 transition-all"
          >
            Login
          </button>
        )}
      </div>
    </header>
  );
}
