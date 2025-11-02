import { useState, useMemo } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";

interface Props {
  images?: string[];
  user?: { sub: string };
  product?: { seller?: { userId: string } };
}

export default function ProductGallery({ images, user, product }: Props) {
  // 🧠 fallback ảnh placeholder
  const safeImages = useMemo(
    () =>
      images && images.length > 0
        ? images
        : ["https://via.placeholder.com/400x400?text=No+Image"],
    [images]
  );

  const [selected, setSelected] = useState(0);
  const [isOpen, setIsOpen] = useState(false);

  // 🧩 Xác định user có phải chủ sản phẩm không
  const isOwner = user?.sub && product?.seller?.userId === user.sub;

  // 📐 Tỉ lệ khác nhau tuỳ đối tượng
  const mainAspect = isOwner ? "aspect-[5/6]" : "aspect-[6/3]"; // người mua → ngang
  const thumbAspect = isOwner ? "aspect-[4/3]" : "aspect-[16/9]"; // người mua → ngang dài
  const thumbHeight = isOwner ? "h-24" : "h-20"; // thấp hơn khi là người mua

  return (
    <div>
      {/* Ảnh chính */}
      <div
        className={`w-full ${mainAspect} mb-6 rounded-lg overflow-hidden cursor-zoom-in transition-all duration-200`}
        onClick={() => setIsOpen(true)}
      >
        <img
          src={safeImages[selected]}
          alt="Selected"
          className="w-full h-full object-cover select-none"
          draggable={false}
        />
      </div>

      {/* Danh sách thumbnail */}
      <Swiper
        modules={[Navigation]}
        navigation
        spaceBetween={10}
        slidesPerView={4}
        className="w-full"
      >
        {safeImages.map((img, idx) => (
          <SwiperSlide key={idx}>
            <div
              className={`cursor-pointer rounded-lg overflow-hidden border-2 ${thumbAspect} ${
                selected === idx ? "border-blue-500" : "border-transparent"
              }`}
              onClick={() => setSelected(idx)}
            >
              <img
                src={img}
                alt={`thumb-${idx}`}
                className={`w-full ${thumbHeight} object-cover select-none rounded-md`}
                draggable={false}
              />
            </div>
          </SwiperSlide>
        ))}
      </Swiper>

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
            {safeImages.map((img, idx) => (
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
  );
}
