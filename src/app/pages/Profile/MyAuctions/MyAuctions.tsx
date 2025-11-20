import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Gavel, Eye, Clock, Trophy, Search, Calendar } from "lucide-react";
import { auctionApi } from "../../../../api/auction";
import { useAuth } from "../../../hooks/AuthContext";
import axiosInstance from "../../../config/axios";
import dayjs from "dayjs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type AuctionStatus = 'scheduled' | 'live' | 'ended' | 'cancelled'

interface AuctionSummaryLoose {
  auctionId: string;
  productId: string;
  title: string;
  status: string;
  startTime: string;
  endTime: string;
  currentPrice: number;
  minBidIncrement: number;
  imageUrls?: string[];
}

interface UserAuction extends AuctionSummaryLoose {
  wonByUser?: boolean;
  orderId?: string | null;
  status: AuctionStatus;
}

export default function MyAuctions() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [auctions, setAuctions] = useState<UserAuction[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "won" | "participated" | "ended">("all");
  const [searchText, setSearchText] = useState("");
  const [paymentLoading, setPaymentLoading] = useState<string | null>(null);

  useEffect(() => {
    const fetchMyAuctions = async () => {
      if (!user?.sub) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        // Use auction history API which returns both won and lost participation
        const resp = await auctionApi.getUserAuctionHistory(user.sub, 1, 100, 'all');
        const items = resp?.items || resp?.data?.items || resp?.data || resp || [];

        const mapped: UserAuction[] = (items as any[]).map((it) => ({
          auctionId: it.auctionId || it.auctionId,
          productId: it.productId,
          title: it.title || (it.product?.title ?? ''),
          status: (['scheduled','live','ended','cancelled'].includes(it.status) ? it.status : 'ended') as AuctionStatus,
          startTime: it.startTime,
          endTime: it.endTime,
          currentPrice: it.currentPrice ?? it.finalPrice ?? 0,
          minBidIncrement: it.minBidIncrement ?? 0,
          imageUrls: it.imageUrls || it.product?.imageUrls || it.image_urls || [],
          wonByUser: (it.userResult === 'won') || (it.winnerId === user.sub),
          orderId: it.orderId ?? null
        }));

        setAuctions(mapped);
      } catch (err: unknown) {
        console.error("Failed to fetch auction history:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchMyAuctions();
  }, [user?.sub]);

  const fetchOrderIdForAuction = async (auctionId: string): Promise<string | null> => {
    try {
      const res = await axiosInstance.get("/orders", { params: { auctionId } });
      const data = res.data?.data?.data || res.data?.data || res.data;
      if (Array.isArray(data) && data.length > 0) {
        return data[0].orderId || null;
      }
      return null;
    } catch (err: unknown) {
      console.error("Failed to fetch orderId:", err);
      return null;
    }
  };

  const handlePayNow = async (auction: UserAuction) => {
    if (!auction.auctionId) return;

    setPaymentLoading(auction.auctionId);
    try {
      let orderId: string | null | undefined = auction.orderId ?? null;
      if (!orderId) {
        orderId = await fetchOrderIdForAuction(auction.auctionId);
      }
      if (orderId) {
        navigate(`/payment?orderId=${orderId}`);
      }
    } catch (error: unknown) {
      console.error("Error during payment:", error);
    } finally {
      setPaymentLoading(null);
    }
  };

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
      minimumFractionDigits: 0,
    }).format(amount);

  const formatCountdown = (endTime: string) => {
    const end = new Date(endTime).getTime();
    const now = Date.now();
    const distance = Math.max(0, end - now);
    if (distance <= 0) return "Ended";
    const seconds = Math.floor((distance / 1000) % 60);
    const minutes = Math.floor((distance / 1000 / 60) % 60);
    const hours = Math.floor(distance / 1000 / 60 / 60);
    if (hours > 0) return `${hours}h ${minutes}m`;
    if (minutes > 0) return `${minutes}m ${seconds}s`;
    return `${seconds}s`;
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      live: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
      scheduled: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
      ended: "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400",
      cancelled: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
    };
    return colors[status] || "bg-gray-100 text-gray-800";
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      live: "Live",
      scheduled: "Upcoming",
      ended: "Ended",
      cancelled: "Cancelled",
    };
    return labels[status] || status;
  };

  const filteredAuctions = auctions.filter((auction) => {
    const matchesSearch = auction.title.toLowerCase().includes(searchText.toLowerCase());
    const isEnded = auction.status === "ended";
    const isWon = auction.wonByUser;

    if (!matchesSearch) return false;

    switch (filter) {
      case "won":
        return isEnded && isWon;
      case "participated":
        return !isEnded;
      case "ended":
        return isEnded;
      default:
        return true;
    }
  });

  const wonCount = auctions.filter((a) => a.wonByUser && a.status === "ended").length;
  const participatingCount = auctions.filter((a) => a.status !== "ended").length;
  const endedCount = auctions.filter((a) => a.status === "ended").length;

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-ocean-300 border-t-ocean-600"></div>
          <p className="mt-4 text-sm text-muted-foreground">Loading auctions...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-ocean-600 to-energy-600 bg-clip-text text-transparent">
          My Auctions
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          View auctions you participated in or won
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search auctions..."
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          <Button
            variant={filter === "all" ? "default" : "outline"}
            size="sm"
            onClick={() => setFilter("all")}
          >
            All ({auctions.length})
          </Button>
          <Button
            variant={filter === "won" ? "default" : "outline"}
            size="sm"
            onClick={() => setFilter("won")}
          >
            Won ({wonCount})
          </Button>
          <Button
            variant={filter === "participated" ? "default" : "outline"}
            size="sm"
            onClick={() => setFilter("participated")}
          >
            Participating ({participatingCount})
          </Button>
          <Button
            variant={filter === "ended" ? "default" : "outline"}
            size="sm"
            onClick={() => setFilter("ended")}
          >
            Ended ({endedCount})
          </Button>
        </div>
      </div>

      {/* Auctions Grid */}
      {filteredAuctions.length === 0 ? (
        <Card className="border-ocean-200/30">
          <CardContent className="p-12 text-center">
            <div className="inline-flex flex-col items-center gap-3 text-muted-foreground">
              <div className="w-16 h-16 rounded-full bg-ocean-50 dark:bg-ocean-900/30 flex items-center justify-center">
                <Gavel className="w-8 h-8 text-ocean-400" />
              </div>
              <p className="text-base font-medium">No auctions found</p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAuctions.map((auction) => (
            <Card
              key={auction.auctionId}
              className="border-ocean-200/30 shadow-sm hover:shadow-md transition-all overflow-hidden group"
            >
              <div className="relative aspect-video bg-gray-100 dark:bg-gray-800 overflow-hidden">
                {auction.imageUrls && auction.imageUrls[0] ? (
                  <img
                    src={auction.imageUrls[0]}
                    alt={auction.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Gavel className="w-12 h-12 text-gray-400" />
                  </div>
                )}
                <div className="absolute top-3 right-3">
                  <span
                    className={cn(
                      "px-2 py-1 rounded-md text-xs font-medium",
                      getStatusColor(auction.status)
                    )}
                  >
                    {getStatusLabel(auction.status)}
                  </span>
                </div>
                {auction.wonByUser && auction.status === "ended" && (
                  <div className="absolute top-3 left-3">
                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-energy-500 text-white rounded-md text-xs font-semibold">
                      <Trophy className="w-3 h-3" />
                      You Won!
                    </span>
                  </div>
                )}
              </div>
              <CardContent className="p-4 space-y-3">
                <h3 className="font-semibold text-lg text-dark-800 dark:text-dark-200 line-clamp-2">
                  {auction.title}
                </h3>

                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Current Price:</span>
                    <span className="font-semibold text-energy-600 dark:text-energy-400">
                      {formatCurrency(auction.currentPrice)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Min Increment:</span>
                    <span className="text-sm font-medium">
                      {formatCurrency(auction.minBidIncrement)}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-sm text-muted-foreground pt-2 border-t border-ocean-200/30">
                  {auction.status === "ended" ? (
                    <>
                      <Calendar className="w-4 h-4" />
                      <span>Ended: {dayjs(auction.endTime).format("DD/MM/YYYY HH:mm")}</span>
                    </>
                  ) : (
                    <>
                      <Clock className="w-4 h-4" />
                      <span>Remaining: {formatCountdown(auction.endTime)}</span>
                    </>
                  )}
                </div>

                <div className="flex gap-2 pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigate(`/auction/${auction.auctionId}`)}
                    className="flex-1 gap-1"
                  >
                    <Eye className="w-4 h-4" />
                    View Details
                  </Button>
                  {auction.wonByUser && auction.status === "ended" && (
                    <Button
                      size="sm"
                      onClick={() => handlePayNow(auction)}
                      disabled={paymentLoading !== null}
                      className="flex-1"
                    >
                      {paymentLoading === auction.auctionId ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                          Processing...
                        </>
                      ) : (
                        "Pay Now"
                      )}
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
