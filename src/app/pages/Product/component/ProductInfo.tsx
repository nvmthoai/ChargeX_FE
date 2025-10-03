import { useState, useEffect } from "react";
import { Clock3, MapPin, Phone, Star } from "lucide-react";


interface Product {
  id: number;
  seller_id: number;
  title: string;
  description: string;
  price_start: number;
  price_buy_now: number;
  soh_percent: number;
  cycle_count: number;
  nominal_voltage_v: number;
  condition_grade: string;
  weight_kg: number;
  dimensions: string;
}

interface Seller {
  id: number;
  email: string;
  phone: string;
}

interface Review {
  id: number;
  reviewer_id: number;
  reviewee_id: number;
  rating: number;
  comment: string;
  created_at: string;
}

interface Auction {
  id: number;
  product_id: number;
  auction_request_id: number;
  start_time: string;
  end_time: string;
  reserve_price: number;
  current_price: number;
  current_winner_bid_id: number;
  min_bid_increment: number;
  anti_sniping_seconds: number;
  bid_deposit_percent: number;
  status: string;
}

export default function ProductInfo() {
  const [product, setProduct] = useState<Product | null>(null);
  const [seller, setSeller] = useState<Seller | null>(null);
  const [auction, setAuction] = useState<Auction | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [bid, setBid] = useState<number | null>(null);

  useEffect(() => {
    fetch("/product.json")
      .then((res) => res.json())
      .then((data) => {
        const product = data.product_listings[0];
        const auction = data.auctions.find((a: Auction) => a.product_id === product.id);
        const seller = data.accounts.find((acc: Seller) => acc.id === product.seller_id);
        const reviews = data.reviews.filter((r: Review) => r.reviewee_id === product.seller_id);

        setProduct(product);
        setAuction(auction);
        setSeller(seller);
        setReviews(reviews);

        if (auction) {
          setBid(auction.current_price + auction.min_bid_increment);
        }
      })
      .catch((err) => console.error("Error fetching product:", err));
  }, []);

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

  if (!product || !seller || !auction) {
    return <div className="p-6">Loading product details...</div>;
  }

  const avgRating =
    reviews.length > 0 ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length : 0;

  return (
    <div className="max-w-2xl space-y-6 p-6 bg-white">
      {/* Product Info */}
      <div>
        <h2 className="text-4xl text-neutral-900 font-bold">
          {product.title} (2022)
        </h2>
        <p className="text-xl text-neutral-600 font-semibold mt-2">
          Lot #{product.id}
        </p>
      </div>

      {/* Current Bid + Timer */}
      <div className="p-4 bg-gray-100 rounded-lg space-y-3">
        <div className="flex justify-between items-center">
          <span>Current Bid:</span>
          <span className="text-[#83AD52] font-bold text-4xl">
            ${auction.current_price.toLocaleString()}
          </span>
        </div>
        <div className="flex justify-between items-center">
          <span className="flex gap-1">
            <Clock3 />
            Time Remaining:
          </span>
          <span className="font-medium text-black">
            {new Date(auction.end_time).toLocaleString()}
          </span>
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium ">Your Bid</label>
          <div className="flex gap-2">
            <input
              type="number"
              value={bid ?? ""}
              onChange={(e) => setBid(Number(e.target.value))}
              className="border border-gray-300 rounded px-3 py-2 flex-1"
            />
            <button className="bg-[#83AD52] hover:bg-[#93af73] text-white px-4 py-2 rounded">
              Place Bid
            </button>
          </div>
          <p className="text-sm text-gray-500">
            Next minimum bid: $
            {(auction.current_price + auction.min_bid_increment).toLocaleString()}
          </p>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3">
        <button className="flex-1 bg-[#0F74C7] hover:bg-[#3888ca] text-white px-4 py-2 rounded font-medium">
          Buy Now • ${product.price_buy_now.toLocaleString()}
        </button>
        <button className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-2 rounded font-medium">
          Add to Watchlist
        </button>
      </div>

      {/* Specifications */}
      <div className="border-t pt-6">
        <h3 className="text-3xl font-semibold mb-4">Specifications</h3>
        <table className="w-full border-collapse">
          <tbody>
            <tr>
              <td className="py-2 px-3 font-medium">SOH</td>
              <td>{product.soh_percent}%</td>
            </tr>
            <tr>
              <td className="py-2 px-3 font-medium">Cycle Count</td>
              <td>{product.cycle_count}</td>
            </tr>
            <tr>
              <td className="py-2 px-3 font-medium">Nominal Voltage</td>
              <td>{product.nominal_voltage_v} V</td>
            </tr>
            <tr>
              <td className="py-2 px-3 font-medium">Condition</td>
              <td>{product.condition_grade}</td>
            </tr>
            <tr>
              <td className="py-2 px-3 font-medium">Weight</td>
              <td>{product.weight_kg} kg</td>
            </tr>
            <tr>
              <td className="py-2 px-3 font-medium">Dimensions</td>
              <td>{product.dimensions}</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Seller Info */}
      <div className="bg-white rounded-lg p-6 space-y-4">
        <h2 className="text-3xl font-semibold text-gray-900">Seller Information</h2>
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-gray-300 flex items-center justify-center">
            <span className="text-xl font-bold text-white">
              {seller.email[0].toUpperCase()}
            </span>
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-gray-900">{seller.email}</h3>
            <div className="flex items-center text-gray-600 text-sm mt-1">
              <MapPin size={14} className="mr-1" />
              {seller.phone}
            </div>
          </div>
        </div>
        <button className="flex items-center justify-center gap-2 border rounded-md px-4 py-2 text-gray-700 hover:bg-gray-100 w-full">
          <Phone size={16} />
          Contact Seller
        </button>
      </div>

      {/* User Reviews */}
      <div className="bg-white p-6 space-y-6">
        <h2 className="text-3xl font-semibold text-gray-900">User Reviews</h2>
        <div className="flex items-end gap-2 text-gray-700">
          <span className="text-3xl font-bold text-blue-600">
            {avgRating.toFixed(1)}
          </span>
          {renderStars(avgRating)}
          <span className="text-gray-600 text-sm">
            ({reviews.length} reviews)
          </span>
        </div>
        <div className="space-y-6">
          {reviews.map((r) => (
            <div key={r.id} className="border-t border-gray-300 pt-4">
              <div className="flex items-center justify-between">
                <span className="font-semibold">User #{r.reviewer_id}</span>
                {renderStars(r.rating)}
              </div>
              <p className="text-xs text-gray-500">
                {new Date(r.created_at).toLocaleDateString()}
              </p>
              <p className="text-sm text-gray-700 mt-2">{r.comment}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
