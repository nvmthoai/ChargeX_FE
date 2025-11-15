import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import ProductGallery from "./component/ProductGallery";
import ProductInfo from "./component/ProductInfo";
import { getProductById } from "../.././../api/product/api";
import { Loader2, AlertCircle } from "lucide-react";

export default function ProductDetail() {
  const { id } = useParams<{ id: string }>();
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    getProductById(id)
      .then((res) => {
        setProduct(res); 
      })
      .catch((err) => console.error("Lỗi lấy sản phẩm:", err))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center p-8">
        <div className="text-center">
          <Loader2 className="w-16 h-16 text-ocean-500 animate-spin mx-auto mb-4" />
          <p className="text-dark-800 text-lg font-medium">Đang tải dữ liệu...</p>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center p-8">
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-8 shadow-xl border border-red-200 max-w-md text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-dark-900 mb-2">Không tìm thấy sản phẩm</h2>
          <p className="text-dark-800 mb-6 font-medium">Sản phẩm bạn đang tìm có thể đã bị xóa hoặc không tồn tại.</p>
          <a
            href="/"
            className="inline-block px-6 py-3 bg-gradient-to-r from-ocean-500 to-ocean-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl hover:scale-105 transition-all"
          >
            Về trang chủ
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-scre  en py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
          {/* Gallery bên trái */}
          <div className="lg:sticky lg:top-24 lg:self-start">
            <div className="bg-white/90 backdrop-blur-sm rounded-2xl overflow-hidden">
              <ProductGallery images={product.imageUrls || []} />
            </div>
          </div>

          {/* Thông tin sản phẩm bên phải */}
          <div>
            <ProductInfo product={product} />
          </div>
        </div>
      </div>
    </div>
  );
}
