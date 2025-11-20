import { Avatar } from "antd";
import { Phone, Mail, Calendar, Package, Star, TrendingUp } from "lucide-react";

interface ShopHeaderProps {
  seller: {
    userId: string;
    fullName: string;
    email: string;
    phone: string;
    image: string | null;
    createdAt: string;
  };
  stats: {
    totalProducts: number;
    totalReviews: number;
    averageRating: number;
  };
}

export default function ShopHeader({ seller, stats }: ShopHeaderProps) {
  return (
    <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 shadow-2xl border border-white/20">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8">
        {/* Seller Info */}
        <div className="flex items-start gap-6 flex-1">
          <div className="relative">
            <div className="absolute inset-0 bg-white/20 rounded-full blur-xl"></div>
            <Avatar 
              size={100} 
              src={seller.image} 
              className="relative border-4 border-white/30 shadow-lg"
            >
              <span className="text-3xl text-white">{(seller.fullName || 'S')[0].toUpperCase()}</span>
            </Avatar>
          </div>
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-white mb-3 drop-shadow-lg">
              {seller.fullName}
            </h1>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-white/90">
                <Phone className="w-4 h-4" />
                <span>{seller.phone}</span>
              </div>
              <div className="flex items-center gap-2 text-white/90">
                <Mail className="w-4 h-4" />
                <span>{seller.email}</span>
              </div>
              <div className="flex items-center gap-2 text-white/80 text-sm">
                <Calendar className="w-4 h-4" />
                <span>
                  Thành viên từ {new Date(seller.createdAt).toLocaleDateString('vi-VN')}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 lg:gap-6 w-full lg:w-auto">
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20 text-center">
            <div className="flex items-center justify-center mb-2">
              <Package className="w-5 h-5 text-white/90" />
            </div>
            <div className="text-2xl font-bold text-white mb-1">
              {stats.totalProducts}
            </div>
            <div className="text-xs text-white/80">
              Sản phẩm
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20 text-center">
            <div className="flex items-center justify-center mb-2">
              <TrendingUp className="w-5 h-5 text-white/90" />
            </div>
            <div className="text-2xl font-bold text-white mb-1">
              {stats.totalReviews}
            </div>
            <div className="text-xs text-white/80">
              Đánh giá
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20 text-center">
            <div className="flex items-center justify-center mb-2">
              <Star className="w-5 h-5 text-yellow-300 fill-yellow-300" />
            </div>
            <div className="text-2xl font-bold text-white mb-1">
              {stats.averageRating > 0 ? stats.averageRating.toFixed(1) : '0.0'}
            </div>
            <div className="text-xs text-white/80">
              Điểm đánh giá
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
