import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import useApiService from "../../hooks/useApi";
import toast from "react-hot-toast";

interface AuctionItem {
  auctionId: string;
  productId: string;
  title: string;
  currentPrice: number;
  minBidIncrement: number;
  status: "scheduled" | "live" | "ended" | "cancelled";
  startTime: string;
  endTime: string;
  imageUrls?: string[];
}

interface AuctionListResponse {
  items: AuctionItem[];
  meta: {
    total: number;
    page: number;
    pageSize: number;
  };
}

export default function AuctionList() {
  const navigate = useNavigate();
  const { callApi } = useApiService();
  const [auctions, setAuctions] = useState<AuctionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "live" | "scheduled">("live");

  useEffect(() => {
    fetchAuctions();
  }, [filter]);

  const fetchAuctions = async () => {
    try {
      setLoading(true);
      const params: any = {
        page: 1,
        pageSize: 20,
      };
      
      if (filter !== "all") {
        params.status = filter;
      }

      const response = await callApi("get", "/auction/joinable", { params });
      
      console.log("📦 Raw API response:", response);
      
      // Handle different response formats
      let data: AuctionListResponse;
      
      if (!response) {
        console.warn("⚠️ Empty response from API");
        setAuctions([]);
        return;
      }
      
      // Check if response is already the expected format
      if (response.items && Array.isArray(response.items)) {
        data = response;
      }
      // Check if response is wrapped in a data property
      else if (response.data && response.data.items) {
        data = response.data;
      }
      // Check if response is an array (direct list of auctions)
      else if (Array.isArray(response)) {
        data = {
          items: response,
          meta: { total: response.length, page: 1, pageSize: response.length }
        };
      }
      // Response doesn't match expected format
      else {
        console.error("❌ Unexpected response format:", response);
        toast.error("Invalid response format from server");
        setAuctions([]);
        return;
      }
      
      console.log("✅ Parsed auctions:", data.items);
      setAuctions(data.items || []);
    } catch (error: any) {
      console.error("❌ Failed to fetch auctions:", error);
      const errorMessage = error?.response?.data?.message || error?.message || "Failed to load auctions";
      toast.error(errorMessage);
      setAuctions([]);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);

  const formatDateTime = (dateStr: string) => {
    return new Date(dateStr).toLocaleString("vi-VN", {
      dateStyle: "short",
      timeStyle: "short",
    });
  };

  const getStatusBadge = (status: string) => {
    const badges: Record<string, { class: string; label: string }> = {
      live: { class: "bg-green-500 text-white", label: "🔴 Live" },
      scheduled: { class: "bg-blue-500 text-white", label: "📅 Scheduled" },
      ended: { class: "bg-gray-500 text-white", label: "✓ Ended" },
      cancelled: { class: "bg-red-500 text-white", label: "✗ Cancelled" },
    };
    const badge = badges[status] || badges.scheduled;
    return (
      <span className={`px-3 py-1 rounded-full text-sm font-medium ${badge.class}`}>
        {badge.label}
      </span>
    );
  };

  const handleJoinAuction = (auction: AuctionItem) => {
    if (!auction.auctionId) {
      toast.error("Invalid auction ID");
      return;
    }
    navigate(`/auction/${auction.auctionId}`);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-800 mb-4">Live Auctions</h1>
        <p className="text-gray-600">Join live auctions and place your bids!</p>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-4 mb-6 border-b border-gray-200">
        {["all", "live", "scheduled"].map((tab) => (
          <button
            key={tab}
            onClick={() => setFilter(tab as typeof filter)}
            className={`px-6 py-3 font-medium transition-colors ${
              filter === tab
                ? "text-blue-600 border-b-2 border-blue-600"
                : "text-gray-600 hover:text-blue-600"
            }`}
          >
            {tab === "all" ? "All Auctions" : tab === "live" ? "🔴 Live Now" : "📅 Scheduled"}
          </button>
        ))}
      </div>

      {/* Loading State */}
      {loading && (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Loading auctions...</p>
        </div>
      )}

      {/* Empty State */}
      {!loading && auctions.length === 0 && (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <p className="text-xl text-gray-600">No auctions found</p>
          <p className="text-gray-500 mt-2">Check back later for new auctions!</p>
        </div>
      )}

      {/* Auction Grid */}
      {!loading && auctions.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {auctions.map((auction) => (
            <div
              key={auction.auctionId}
              className="bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow overflow-hidden border border-gray-200"
            >
              {/* Image */}
              <div className="relative h-48 bg-gray-200">
                {auction.imageUrls && auction.imageUrls.length > 0 ? (
                  <img
                    src={auction.imageUrls[0]}
                    alt={auction.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                    <span className="text-4xl">📦</span>
                  </div>
                )}
                <div className="absolute top-3 right-3">
                  {getStatusBadge(auction.status)}
                </div>
              </div>

              {/* Content */}
              <div className="p-4">
                <h3 className="text-lg font-semibold text-gray-800 mb-2 truncate">
                  {auction.title}
                </h3>
                
                <div className="space-y-2 mb-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Current Price:</span>
                    <span className="font-bold text-green-600">
                      {formatCurrency(auction.currentPrice || 0)}
                    </span>
                  </div>
                  
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Start Time:</span>
                    <span className="text-gray-800">{formatDateTime(auction.startTime)}</span>
                  </div>
                  
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">End Time:</span>
                    <span className="text-gray-800">{formatDateTime(auction.endTime)}</span>
                  </div>
                </div>

                {/* Action Button */}
                <button
                  onClick={() => handleJoinAuction(auction)}
                  disabled={auction.status === "ended" || auction.status === "cancelled"}
                  className={`w-full py-2 rounded-lg font-medium transition-colors ${
                    auction.status === "live"
                      ? "bg-orange-500 hover:bg-orange-600 text-white"
                      : auction.status === "scheduled"
                      ? "bg-blue-500 hover:bg-blue-600 text-white"
                      : "bg-gray-300 text-gray-500 cursor-not-allowed"
                  }`}
                >
                  {auction.status === "live"
                    ? "🔴 Join Live Auction"
                    : auction.status === "scheduled"
                    ? "📅 View Details"
                    : auction.status === "ended"
                    ? "✓ Ended"
                    : "Cancelled"}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
