import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import ProductGallery from "../../../pages/Product/component/ProductGallery";
import ProductInfo from "../../../pages/Product/component/ProductInfo";
import { getProductById } from "../../../../api/product/api";

export default function ProductDetailShop() {
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

  if (loading) return <div className="p-10 text-center">Đang tải dữ liệu...</div>;
  if (!product) return <div className="p-10 text-center">Không tìm thấy sản phẩm</div>;

  return (
    <div className="flex flex-col gap-5 py-10 px-40 bg-gray-50 min-h-screen">
      {/* Gallery bên trái */}
      <div className="max-w-2xl h-full top-10 self-start">
        <ProductGallery images={product.imageUrls || []} />
      </div>

      {/* Thông tin sản phẩm bên phải */}
      <div className="">
        <ProductInfo product={product} />
      </div>
    </div>
  );
}
