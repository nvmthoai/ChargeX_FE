import { useState } from "react";
import { Clock3, MapPin, Phone, Gavel } from "lucide-react";
import type { Product } from "../../../../api/product/type";
import { Link, useNavigate } from "react-router-dom";

export default function ProductInfo({ product }: { product: Product }) {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const userData = localStorage.getItem("user");
  const user = userData ? JSON.parse(userData) : null;
  const isOwner = user?.sub && product?.seller?.userId === user.sub;

  // 🛒 Handle Buy Now
  const handleBuyNow = async () => {
    try {
      setLoading(true);
      if (!user?.sub) {
        alert("Bạn cần đăng nhập trước khi mua hàng!");
        return;
      }
      navigate(`/checkout?productId=${product.id}`);
    } catch (error) {
      console.error("❌ Buy Now error:", error);
      alert("Có lỗi xảy ra, vui lòng thử lại!");
    } finally {
      setLoading(false);
    }
  };

  // const avgRating = 4.5;
  // const reviews = [
  //   { id: 1, reviewer_id: 12, rating: 5, comment: "Giao nhanh, sản phẩm tốt" },
  //   { id: 2, reviewer_id: 45, rating: 4, comment: "Pin còn khá mới" },
  // ];

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

      {/* ⚡ Auction Info */}
      {product.is_auction && (
        <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div className="flex items-center gap-2 mb-3">
            <Gavel className="text-yellow-600" />
            <h3 className="text-lg font-semibold text-yellow-700">
              Auction Information
            </h3>
          </div>
          <div className="p-5 bg-gradient-to-br from-yellow-50 to-white border border-yellow-200 rounded-xl shadow-sm">
            <div className="grid grid-cols-2 gap-y-3 text-sm text-gray-800">
              <div className="font-medium text-gray-500">Start Price</div>
              <div className="font-semibold text-gray-900">
                ${(product.price_start).toLocaleString()}
              </div>

              <div className="font-medium text-gray-500">Current Price</div>
              <div className="font-bold text-green-600 text-base">
                ${(product.price_now ?? product.price_start).toLocaleString()}
              </div>

              <div className="font-medium text-gray-500">Buy Now Price</div>
              <div className="font-semibold text-blue-600">
                ${(product.price_buy_now ?? 0).toLocaleString()}
              </div>

              <div className="font-medium text-gray-500">End Time</div>
              <div className="font-semibold text-gray-900">
                {product.end_time
                  ? new Date(product.end_time).toLocaleString("vi-VN", {
                    day: "2-digit",
                    month: "2-digit",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })
                  : "—"}
              </div>
            </div>

            <div className="mt-4 border-t border-yellow-100 pt-3 text-xs text-gray-500 flex items-center gap-1">
              <Clock3 size={12} className="text-yellow-600" />
              Bidding is open until the listed end time.
            </div>
          </div>

        </div>
      )}

      {/* Seller Info (ẩn nếu user là chủ sản phẩm) */}
      {!isOwner && (
        <Link className="" to={`/shop-detail/${product.seller.userId}`}>
        <div className="bg-white space-y-4 cursor-pointer">
          <h2 className="text-2xl font-semibold text-gray-900">
            Seller Information
          </h2>
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-gray-300 flex items-center justify-center text-white font-bold text-xl">
              {product.seller.fullName[0].toUpperCase()}
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 ">
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
        </Link>
      )}

      {/* Buy Now + Wishlist (ẩn nếu là sản phẩm của user) */}
      {!isOwner && (
        <div className="flex gap-3 mt-5">
          <button
            onClick={handleBuyNow}
            disabled={loading}
            className={`flex-1 bg-[#0F74C7] text-white px-4 py-2 rounded font-medium ${loading
                ? "opacity-60 cursor-not-allowed"
                : "hover:bg-[#3888ca] transition"
              }`}
          >
            {loading
              ? "Đang xử lý..."
              : `Buy Now • $${(product.price_buy_now).toLocaleString()}`}
          </button>
          <button className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-2 rounded font-medium">
            Add to Watchlist
          </button>
        </div>
      )}

      {/* Specifications */}
      <div className="pt-6">
        <h3 className="text-2xl font-semibold mb-4 text-gray-900">
          Specifications
        </h3>
        <div className="overflow-hidden rounded-lg border border-gray-200">
          <table className="w-full border-collapse">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left text-sm font-medium text-gray-500 px-4 py-3 w-1/2">
                  Attribute
                </th>
                <th className="text-left text-sm font-medium text-gray-500 px-4 py-3 w-1/2">
                  Value
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-gray-700 text-sm">
              <tr>
                <td className="px-4 py-2 font-medium">Battery Capacity</td>
                <td className="px-4 py-2">
                  {product.nominal_voltage_v ?? "52"} V
                </td>
              </tr>
              <tr>
                <td className="px-4 py-2 font-medium">SOH (State of Health)</td>
                <td className="px-4 py-2">{product.soh_percent ?? "95"}%</td>
              </tr>
              <tr>
                <td className="px-4 py-2 font-medium">Cycle Count</td>
                <td className="px-4 py-2">{product.cycle_count ?? "320"} cycles</td>
              </tr>
              <tr>
                <td className="px-4 py-2 font-medium">Weight</td>
                <td className="px-4 py-2">{product.weight_kg ?? "2"} kg</td>
              </tr>
              <tr>
                <td className="px-4 py-2 font-medium">Condition</td>
                <td className="px-4 py-2">{product.condition_grade ?? "Excellent"}</td>
              </tr>
              <tr>
                <td className="px-4 py-2 font-medium">Dimension</td>
                <td className="px-4 py-2">{product.dimension ?? "32 × 15 × 10 cm"}</td>
              </tr>
              <tr>
                <td className="px-4 py-2 font-medium">Estimated Range</td>
                <td className="px-4 py-2">≈ 60 km per charge</td>
              </tr>
              <tr>
                <td className="px-4 py-2 font-medium">Location</td>
                <td className="px-4 py-2">Ho Chi Minh City, Vietnam</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Reviews */}
      {/* <div className="bg-white p-6 space-y-6">
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
      </div> */}
    </div>
  );
}
