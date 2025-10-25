import { useState } from "react";
import { Clock3, MapPin, Phone, Star } from "lucide-react";
import type { Product } from "../../../../api/product/type";
import { useNavigate } from "react-router-dom";

export default function ProductInfo({ product }: { product: Product }) {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // ⭐ Render stars
  const renderStars = (rating: number) => {
    const rounded = Math.round(rating);
    return (
      <div className="flex">
        {Array.from({ length: 5 }).map((_, i) => (
          <Star
            key={i}
            size={18}
            className={`${
              i < rounded ? "text-[#83AD52] fill-[#83AD52]" : "text-gray-300"
            }`}
          />
        ))}
      </div>
    );
  };

  // 🛒 Handle Buy Now → chỉ điều hướng sang trang Checkout
  const handleBuyNow = async () => {
    try {
      setLoading(true);
      const userData = localStorage.getItem("user");
      const user = userData ? JSON.parse(userData) : null;

      if (!user?.sub) {
        alert("Bạn cần đăng nhập trước khi mua hàng!");
        return;
      }

      // 👉 chỉ navigate, không gọi API
      navigate(`/checkout?productId=${product.id}`);
    } catch (error) {
      console.error("❌ Buy Now error:", error);
      alert("Có lỗi xảy ra, vui lòng thử lại!");
    } finally {
      setLoading(false);
    }
  };

  const avgRating = 4.5;
  const reviews = [
    { id: 1, reviewer_id: 12, rating: 5, comment: "Giao nhanh, sản phẩm tốt" },
    { id: 2, reviewer_id: 45, rating: 4, comment: "Pin còn khá mới" },
  ];

  return (
    <div className="max-w-2xl space-y-6 p-6 bg-white rounded-lg shadow-md">
      {/* Product Info */}
      <div className="space-y-3 border-b border-gray-100 pb-6">
        <h1 className="text-4xl font-extrabold text-gray-900">
          {product.title}
        </h1>
        <p className="text-lg text-gray-700">{product.description}</p>

        <div className="flex justify-between text-sm text-gray-500 mt-4">
          <span className="flex items-center gap-1">
            <Clock3 className="w-4 h-4 text-blue-500" />
            {product.createdAt
              ? new Date(product.createdAt).toLocaleDateString("vi-VN", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                })
              : "—"}
          </span>
        </div>
      </div>

      {/* Seller Info */}
      <div className="bg-white space-y-4">
        <h2 className="text-2xl font-semibold text-gray-900">
          Seller Information
        </h2>
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-gray-300 flex items-center justify-center text-white font-bold text-xl">
            {product.seller.fullName[0].toUpperCase()}
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">
              {product.seller.fullName}
            </h3>
            <p className="text-sm text-gray-500 flex items-center gap-1">
              <MapPin size={14} /> TP. Hồ Chí Minh
            </p>
            <p className="text-sm text-gray-500 flex items-center gap-1">
              <Phone size={14} /> 0901 234 567
            </p>
          </div>
        </div>
      </div>

      {/* Buy Now */}
      <div className="flex gap-3">
        <button
          onClick={handleBuyNow}
          disabled={loading}
          className={`flex-1 bg-[#0F74C7] text-white px-4 py-2 rounded font-medium ${
            loading
              ? "opacity-60 cursor-not-allowed"
              : "hover:bg-[#3888ca] transition"
          }`}
        >
          {loading
            ? "Đang xử lý..."
            : `Buy Now • $${Number(product.price_buy_now).toLocaleString()}`}
        </button>
        <button className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-2 rounded font-medium">
          Add to Watchlist
        </button>
      </div>

      {/* Reviews */}
      <div className="bg-white p-6 space-y-6">
        <h2 className="text-2xl font-semibold text-gray-900">User Reviews</h2>
        <div className="flex items-end gap-2">
          <span className="text-3xl font-bold text-blue-600">{avgRating}</span>
          {renderStars(avgRating)}
          <span className="text-gray-600 text-sm">
            ({reviews.length} reviews)
          </span>
        </div>

        {reviews.map((r) => (
          <div key={r.id} className="border-t border-gray-300 pt-4">
            <div className="flex justify-between">
              <span className="font-semibold">User #{r.reviewer_id}</span>
              {renderStars(r.rating)}
            </div>
            <p className="text-sm text-gray-700 mt-1">{r.comment}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
