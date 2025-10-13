import { useState } from "react";
import { Clock3, MapPin, Phone, Star } from "lucide-react";
import type { Product } from "../../../../api/product/type";

export default function ProductInfo({ product }: { product: Product }) {
  const [bid, setBid] = useState<number>(
    Number(product.price_now ?? product.price_start) + 10
  );

  const renderStars = (rating: number) => {
    const rounded = Math.round(rating);
    return (
      <div className="flex">
        {Array.from({ length: 5 }).map((_, i) => (
          <Star
            key={i}
            size={18}
            className={`${i < rounded ? "text-[#83AD52] fill-[#83AD52]" : "text-gray-300"}`}
          />
        ))}
      </div>
    );
  };

  const avgRating = 4.5; 
  const reviews = [
    { id: 1, reviewer_id: 12, rating: 5, comment: "Giao nhanh, sản phẩm tốt" },
    { id: 2, reviewer_id: 45, rating: 4, comment: "Pin còn khá mới" },
  ];

  return (
    <div className="max-w-2xl space-y-6 p-6 item bg-white rounded-lg">
      {/* Product Info */}
      <div className="space-y-3 border-b border-gray-100 pb-6">
        {/* Title */}
        <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight leading-snug">
          {product.title}
        </h1>

        {/* Description */}
        <p className="text-lg text-gray-700 leading-relaxed max-w-prose">
          {product.description}
        </p>

        {/* Sub-info */}
        <div className="flex items-center justify-between text-sm text-gray-500 mt-4">
          <span className="flex items-center gap-1">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-4 h-4 text-blue-500"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
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


      {/* Current Bid + Timer */}
      {product.is_auction && (
        <div className="p-4 bg-gray-100 rounded-lg space-y-3">
          <div className="flex justify-between items-center">
            <span>Current Bid:</span>
            <span className="text-[#83AD52] font-bold text-4xl">
              ${Number(product.price_now ?? product.price_start).toLocaleString()}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="flex gap-1">
              <Clock3 /> Time Remaining:
            </span>
            <span className="font-medium text-black">
              {product.end_time
                ? new Date(product.end_time).toLocaleString()
                : "—"}
            </span>
          </div>

          {/* Bid Input */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Your Bid</label>
            <div className="flex gap-2">
              <input
                type="number"
                value={bid}
                onChange={(e) => setBid(Number(e.target.value))}
                className="border border-gray-300 rounded px-3 py-2 flex-1"
              />
              <button className="bg-[#83AD52] hover:bg-[#93af73] text-white px-4 py-2 rounded">
                Place Bid
              </button>
            </div>
            <p className="text-sm text-gray-500">
              Next minimum bid: ${(bid + 10).toLocaleString()}
            </p>
          </div>
        </div>
      )}

      {/* Seller Info */}
      <div className="bg-white space-y-4">
        <h2 className="text-2xl font-semibold text-gray-900">Seller Information</h2>
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-gray-300 flex items-center justify-center text-white font-bold text-xl">
            {product.seller.fullName[0].toUpperCase()}
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">{product.seller.fullName}</h3>
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
        <button className="flex-1 bg-[#0F74C7] hover:bg-[#3888ca] text-white px-4 py-2 rounded font-medium">
          Buy Now • ${Number(product.price_buy_now).toLocaleString()}
        </button>
        <button className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-2 rounded font-medium">
          Add to Watchlist
        </button>
      </div>



      {/* Specifications */}
      <div className="pt-6">
        <h3 className="text-2xl font-semibold mb-4 text-gray-900">Specifications</h3>

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
                <td className="px-4 py-2">{product.nominal_voltage_v ?? "52"} V</td>
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
      <div className="bg-white p-6 space-y-6">
        <h2 className="text-2xl font-semibold text-gray-900">User Reviews</h2>
        <div className="flex items-end gap-2">
          <span className="text-3xl font-bold text-blue-600">{avgRating}</span>
          {renderStars(avgRating)}
          <span className="text-gray-600 text-sm">({reviews.length} reviews)</span>
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
