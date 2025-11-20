import { Card, Image, Tag, Space, Button, Badge } from "antd";
import { ShoppingCart, Eye, Gavel, Zap } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface Product {
  id: string;
  title: string;
  description: string;
  priceStart: string;
  priceBuyNow: string;
  priceNow: string | null;
  status: string;
  imageUrls: string[] | null;
  sohPercent: number;
  cycleCount: number;
  nominalVoltageV: number;
  weightKg: number;
  conditionGrade: string;
  dimension: string;
  isAuction: boolean;
  endTime: string | null;
  createdAt: string;
}

export default function ShopProductCard({ product }: { product: Product }) {
  const navigate = useNavigate();

  const images =
    product.imageUrls && product.imageUrls.length > 0
      ? product.imageUrls
      : ["/diverse-products-still-life.png"];

  return (
    <div className="group relative bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden border border-slate-200 h-full flex flex-col">
      {/* Badge */}
      <div className={`absolute top-4 right-4 z-10 px-3 py-1 rounded-full text-xs font-semibold shadow-lg ${
        product.isAuction 
          ? "bg-gradient-to-r from-amber-400 to-orange-500 text-white" 
          : "bg-gradient-to-r from-blue-500 to-indigo-600 text-white"
      }`}>
        <div className="flex items-center gap-1">
          {product.isAuction ? (
            <>
              <Gavel className="w-3 h-3" />
              <span>Đấu giá</span>
            </>
          ) : (
            <>
              <Zap className="w-3 h-3" />
              <span>Mua ngay</span>
            </>
          )}
        </div>
      </div>

      {/* Image */}
      <div className="relative overflow-hidden bg-gradient-to-br from-slate-100 to-slate-200 h-56">
        <Image
          src={images[0]}
          alt={product.title}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          preview={false}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
      </div>

      {/* Content */}
      <div className="p-5 flex-1 flex flex-col">
        <h3 className="font-bold text-lg text-slate-900 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
          {product.title}
        </h3>

        <p className="text-sm text-slate-600 mb-4 line-clamp-2">
          {product.description}
        </p>

        {/* Specs */}
        <div className="mb-4 space-y-2 flex-1">
          <div className="flex justify-between items-center p-2 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg">
            <span className="text-slate-600 text-sm font-medium">SOH:</span>
            <Tag color="blue" className="m-0">{product.sohPercent}%</Tag>
          </div>

          <div className="flex justify-between items-center p-2 bg-gradient-to-r from-slate-50 to-slate-100 rounded-lg">
            <span className="text-slate-600 text-sm font-medium">Tình trạng:</span>
            <Tag className="m-0">{product.conditionGrade}</Tag>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs text-slate-500 pt-2">
            <div className="flex items-center gap-1">
              <span className="font-medium">Chu kỳ:</span>
              <span>{product.cycleCount}</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="font-medium">Điện áp:</span>
              <span>{product.nominalVoltageV}V</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="font-medium">Trọng lượng:</span>
              <span>{product.weightKg}kg</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="font-medium">Kích thước:</span>
              <span className="truncate">{product.dimension}</span>
            </div>
          </div>
        </div>

        {/* Price Section */}
        <div className="pt-4 border-t border-slate-200 space-y-3">
          <div className="space-y-2">
            {product.isAuction ? (
              <>
                {product.priceStart && (
                  <div className="flex justify-between items-center p-2 bg-slate-50 rounded-lg">
                    <span className="text-slate-600 text-sm">Giá khởi điểm:</span>
                    <span className="font-semibold text-slate-700">
                      {Number(product.priceStart).toLocaleString("vi-VN")}₫
                    </span>
                  </div>
                )}
                <div className="flex justify-between items-center p-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg">
                  <span className="text-slate-700 text-sm font-medium">Giá hiện tại:</span>
                  <span className="font-bold text-lg bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                    {product.priceNow ? Number(product.priceNow).toLocaleString("vi-VN") : Number(product.priceStart || 0).toLocaleString("vi-VN")}₫
                  </span>
                </div>
                {product.priceBuyNow && (
                  <div className="flex justify-between items-center p-2 bg-amber-50 rounded-lg">
                    <span className="text-slate-600 text-sm">Mua ngay:</span>
                    <span className="font-bold text-amber-700">
                      {Number(product.priceBuyNow).toLocaleString("vi-VN")}₫
                    </span>
                  </div>
                )}
              </>
            ) : (
              <div className="flex justify-between items-center p-3 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg">
                <span className="text-slate-700 text-sm font-medium">Giá bán:</span>
                <span className="font-bold text-lg bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                  {Number(product.priceBuyNow || product.priceNow || 0).toLocaleString("vi-VN")}₫
                </span>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2">
            <Button
              type="primary"
              icon={product.isAuction ? <Gavel className="w-4 h-4" /> : <ShoppingCart className="w-4 h-4" />}
              block
              onClick={() => navigate(`/productdetail/${product.id}`)}
              className="bg-gradient-to-r from-blue-500 to-indigo-600 border-0 hover:from-blue-600 hover:to-indigo-700 h-10 font-semibold"
            >
              {product.isAuction ? "Đấu giá" : "Mua ngay"}
            </Button>

            <Button 
              icon={<Eye className="w-4 h-4" />}
              onClick={() => navigate(`/productdetail/${product.id}`)}
              className="h-10 border-slate-300 hover:border-blue-500 hover:text-blue-500"
            >
              Chi tiết
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
