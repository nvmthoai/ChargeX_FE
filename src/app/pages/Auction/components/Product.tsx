import { useParams } from "react-router-dom";
import useAuctionLive from "../../../hooks/useAuctionLive";
import { Image, Package } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export default function Product() {
  const { id } = useParams();
  const auctionId = id ?? null;
  const { auction, loading, live } = useAuctionLive(auctionId, {
    resyncIntervalSeconds: 8,
  });

  const product = {
    title: auction?.product?.title,
    description: auction?.product?.description,
    imageUrls: auction?.product?.imageUrls || [],
    price_start: auction?.startingPrice,
  };

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
      minimumFractionDigits: 0,
    }).format(amount);

  return (
    <Card className="border-ocean-200/30 shadow-lg overflow-hidden bg-white">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-0">
        {/* Product Image */}
        <div className="relative aspect-square md:aspect-auto md:h-[500px] bg-gradient-to-br from-ocean-50 to-energy-50 overflow-hidden group">
          {product?.imageUrls && product.imageUrls.length > 0 ? (
            <img
              src={product.imageUrls[0]}
              alt={product.title ?? "Auction item"}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <div className="text-center">
                <Image className="w-16 h-16 text-ocean-300 mx-auto mb-3" />
                <p className="text-ocean-400 font-medium">No image available</p>
              </div>
            </div>
          )}
          {/* Live Badge */}
          {live && (
            <div className="absolute top-4 right-4">
              <span className="px-4 py-2 bg-red-500 text-white rounded-full text-sm font-semibold flex items-center gap-2 animate-pulse">
                <span className="w-2 h-2 bg-white rounded-full animate-ping"></span>
                LIVE
              </span>
            </div>
          )}
        </div>

        {/* Product Details */}
        <CardContent className="p-6 md:p-8 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Package className="w-5 h-5 text-ocean-600" />
              <span className="text-sm text-muted-foreground">Auction Item</span>
            </div>
            
            <h1 className="text-3xl font-bold text-ocean-700 mb-4">
              {product?.title ?? `Auction #${auctionId?.substring(0, 8)}`}
            </h1>

            {product?.description && (
              <p className="text-muted-foreground mb-6 leading-relaxed">
                {product.description}
              </p>
            )}

            {/* Price Info */}
            <div className="bg-gradient-to-r from-ocean-50/50 to-energy-50/50 rounded-xl p-4 mb-6 border border-ocean-200/30">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-muted-foreground">Current Bid</span>
                <span className="text-2xl font-bold text-energy-600">
                  {formatCurrency(auction?.currentPrice ?? auction?.startingPrice ?? 0)}
                </span>
              </div>
              {product?.price_start && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Starting Price</span>
                  <span className="font-medium text-ocean-600">
                    {formatCurrency(Number(product.price_start))}
                  </span>
                </div>
              )}
            </div>

            {/* Additional Info */}
            <div className="space-y-2 text-sm">
              {auction?.minBidIncrement && (
                <div className="flex items-center justify-between py-2 border-b border-ocean-100">
                  <span className="text-muted-foreground">Min. Bid Increment</span>
                  <span className="font-semibold text-ocean-700">
                    {formatCurrency(auction.minBidIncrement)}
                  </span>
                </div>
              )}
              {auction?.reservePrice && (
                <div className="flex items-center justify-between py-2 border-b border-ocean-100">
                  <span className="text-muted-foreground">Reserve Price</span>
                  <span className="font-semibold text-ocean-700">
                    {formatCurrency(auction.reservePrice)}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Status Footer */}
          <div className="mt-6 pt-6 border-t border-ocean-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Package className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">
                  {loading ? "Loading..." : live ? "Auction is Live" : "Auction Offline"}
                </span>
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                live 
                  ? "bg-green-100 text-green-800" 
                  : "bg-gray-100 text-gray-600"
              }`}>
                {live ? "🟢 Active" : "⚫ Inactive"}
              </span>
            </div>
          </div>
        </CardContent>
      </div>
    </Card>
  );
}
