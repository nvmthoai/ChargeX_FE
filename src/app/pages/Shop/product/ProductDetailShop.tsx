import { useEffect, useState, useMemo } from "react";
import { useParams } from "react-router-dom";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import ProductInfo from "../../../pages/Product/component/ProductInfo";
import { getProductById } from "../../../../api/product/api";

export default function ProductDetailShop() {
  const { id } = useParams<{ id: string }>();
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const [selected, setSelected] = useState(0);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (!id) return;
    getProductById(id)
      .then((res) => setProduct(res))
      .catch((err) => console.error("Lỗi lấy sản phẩm:", err))
      .finally(() => setLoading(false));
  }, [id]);

  // 🧠 fallback ảnh placeholder
  const safeImages = useMemo(() => {
    const imgs = product?.imageUrls || [];
    return imgs.length > 0
      ? imgs
      : ["https://via.placeholder.com/400x400?text=No+Image"];
  }, [product]);

  if (loading)
    return <div className="p-10 text-center">Đang tải dữ liệu...</div>;
  if (!product)
    return <div className="p-10 text-center">Không tìm thấy sản phẩm</div>;

  return (
    <div className="flex flex-col items-center justify-center gap-10 py-10 px-20 bg-gray-50 min-h-screen">
      {/* Gallery bên trái */}
      <div className="flex flex-1 max-w-xl gap-4 ">
        {/* 🟢 Thumbnail dọc */}
        <div className="flex flex-col gap-3 overflow-y-auto max-h-[500px] pr-2">
          {safeImages.map((img: string, idx: number) => (
            <div
              key={idx}
              onClick={() => setSelected(idx)}
              className={`cursor-pointer rounded-lg overflow-hidden border-2 ${
                selected === idx ? "border-blue-500" : "border-transparent"
              }`}
            >
              <img
                src={img}
                alt={`thumb-${idx}`}
                className="w-20 h-20 object-cover rounded-md select-none"
                draggable={false}
              />
            </div>
          ))}
        </div>

        {/* 🖼️ Ảnh chính */}
        <div
          className="flex-1 rounded-lg overflow-hidden cursor-zoom-in transition-all duration-200"
          onClick={() => setIsOpen(true)}
        >
          <img
            src={safeImages[selected]}
            alt="Selected"
            className="w-full h-full object-cover select-none"
            draggable={false}
          />
        </div>

        {/* Modal zoom ảnh */}
        {isOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50">
            <button
              className="absolute top-4 right-4 text-white text-2xl"
              onClick={() => setIsOpen(false)}
            >
              ✕
            </button>
            <Swiper
              modules={[Navigation]}
              navigation
              initialSlide={selected}
              className="w-[90%] md:w-[60%] h-[80%] rounded-lg overflow-hidden"
            >
              {safeImages.map((img: string, idx: number) => (
                <SwiperSlide key={idx}>
                  <img
                    src={img}
                    alt={`zoom-${idx}`}
                    className="w-full h-full object-contain bg-black select-none"
                  />
                </SwiperSlide>
              ))}
            </Swiper>
          </div>
        )}
      </div>

      {/* Thông tin sản phẩm bên phải */}
      <div className="flex-1 max-w-xl w-full">
        <ProductInfo product={product} />
      </div>
    </div>
  );
}
