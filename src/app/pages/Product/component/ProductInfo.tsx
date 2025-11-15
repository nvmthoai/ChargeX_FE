import { useState, useEffect } from "react";
import { Clock3, MapPin, Phone, Gavel } from "lucide-react";
import type { Product } from "../../../../api/product/type";
import AddToCart from "../../Order/AddToCart";
import useAddress from "../../../hooks/useAddress";
import { Link, useNavigate } from "react-router-dom";

export default function ProductInfo({ product }: { product: Product }) {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const userData = localStorage.getItem("user");
  const user = userData ? JSON.parse(userData) : null;
  const isOwner = user?.sub && product?.seller?.userId === user.sub;

  const { addresses } = useAddress();
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
  useEffect(() => {
    if (addresses && addresses.length > 0) {
      const defaultAddr = addresses.find((a: any) => a.isDefault);
      if (defaultAddr) setSelectedAddressId(defaultAddr.addressId);
    }
  }, [addresses]);

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

  const handleAddToCart = async (): Promise<boolean> => {
    try {
      console.log("Thực hiện tác vụ!");
      setLoading(true);
      const success = await AddToCart(product, selectedAddressId, addresses);

      if (success) {
        console.log("✅ Tác vụ đã hoàn thành!");
        return true;
      } else {
        console.warn("⚠️ Tác vụ không thành công!");
        return false;
      }
    } catch (error) {
      console.error("❌ Lỗi trong quá trình thực hiện tác vụ:", error);
      return false;
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
    <div className="max-w-2xl space-y-6 p-6 bg-gradient-to-br from-white/95 via-ocean-50/20 to-energy-50/20 rounded-lg shadow-md border border-ocean-200/30">
      {/* Product Info */}
      <div className="space-y-3 border-b border-gray-100 pb-6">
        <h1 className="text-4xl font-extrabold text-gray-900">
          {product.title}
        </h1>
        <p className="text-lg text-gray-700">{product.description}</p>

        <div className="flex justify-between text-sm text-dark-800 font-medium mt-4">
          <span className="flex items-center gap-1">
            <Clock3 className="w-4 h-4 text-[#0F74C7]" />
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
              <div className="font-semibold text-dark-800">Start Price</div>
              <div className="font-semibold text-gray-900">
                {(product.price_start).toLocaleString()} VND
              </div>

              <div className="font-medium text-gray-500">Current Price</div>
              <div className="font-bold text-green-600 text-base">
                {(product.price_now ?? product.price_start).toLocaleString()} VND
              </div>

              <div className="font-medium text-gray-500">Buy Now Price</div>
              <div className="font-semibold text-blue-600">
                {(product.price_buy_now ?? 0).toLocaleString()} VND
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

            <div className="mt-4 border-t border-yellow-100 pt-3 text-xs text-dark-800 font-medium flex items-center gap-1">
              <Clock3 size={12} className="text-yellow-600" />
              Bidding is open until the listed end time.
            </div>
          </div>

        </div>
      )}

      {/* Seller Info (ẩn nếu user là chủ sản phẩm) */}
      {!isOwner && (
        <Link className="" to={`/shop-detail/${product.seller.userId}`}>
          <div className="bg-gradient-to-br from-white/95 via-ocean-50/20 to-energy-50/20 space-y-4 cursor-pointer rounded-lg border border-ocean-200/30 p-4">
            <h2 className="text-2xl font-semibold text-gray-900">
              Seller Information
            </h2>
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-gray-300 flex items-center justify-center text-white font-bold text-xl">
                {product.seller.fullName[0].toUpperCase()}
                {/* <img
                  src={product.seller.image || "/default_avatar.png"}
                  alt="Seller Avatar"
                  className="w-16 h-16 rounded-full object-cover"
                /> */}
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 ">
                  {product.seller.fullName}
                </h3>
                <p className="text-sm text-dark-800 font-medium flex items-center gap-1">
                  <MapPin size={14} /> TP. Hồ Chí Minh
                </p>
                <p className="text-sm text-dark-800 font-medium flex items-center gap-1">
                  <Phone size={14} /> 0901 234 567
                </p>
              </div>
            </div>
          </div>
        </Link>
      )}

      {/* Buy Now + Watchlist */}
      <div
        className={`flex gap-3 mt-5 ${isOwner ? "opacity-60 pointer-events-none select-none" : ""
          }`}
      >
        <button
          onClick={handleBuyNow}
          disabled={loading}
          className={`flex-1 bg-[#0F74C7] text-white px-4 py-2 rounded font-medium transition ${loading ? "opacity-60 cursor-not-allowed" : "hover:bg-[#3888ca]"
            }`}
        >
          {loading
            ? "Đang xử lý..."
            : `Buy Now ${Number(product.price_buy_now).toLocaleString()} VND`}
        </button>

        <button
          onClick={handleAddToCart}
          className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-2 rounded font-medium"
        >
          Add to Watchlist
        </button>
      </div>

      {/* Nếu là sản phẩm của chính user, hiển thị cảnh báo nhỏ bên dưới */}
      {isOwner && (
        <p className="text-sm text-red-500 mt-2 italic">
          ⚠️ Bạn không thể mua hoặc thêm sản phẩm của chính mình.
        </p>
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
                <th className="text-left text-sm font-semibold text-dark-800 px-4 py-3 w-1/2">
                  Attribute
                </th>
                <th className="text-left text-sm font-semibold text-dark-800 px-4 py-3 w-1/2">
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
          <span className="text-dark-800 text-sm font-medium">
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
