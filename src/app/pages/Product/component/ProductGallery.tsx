import { useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";

const images: string[] = [
  "https://i.pinimg.com/736x/5d/f5/68/5df56861b0f9e634187f41df755cde81.jpg",
  "https://i.pinimg.com/1200x/a6/25/ff/a625ff60d0a2462866422fba5762c67c.jpg",
  "https://i.pinimg.com/736x/08/67/f8/0867f82d2f30805386a2868385d767c1.jpg",
  "https://i.pinimg.com/736x/fa/4a/d1/fa4ad1cac2ede8dc58300bcd173b2197.jpg",
  "https://i.pinimg.com/736x/40/c1/21/40c121a098417cfdbbbb20f08fac6393.jpg",
  "https://i.pinimg.com/736x/12/04/af/1204afd01905d2b9c879468aafbdae66.jpg",
];

export default function ProductGallery() {
  const [selected, setSelected] = useState(0);
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="">
      <div
        className="w-full aspect-[5/6] mb-6 rounded-lg overflow-hidden cursor-zoom-in"
        onClick={() => setIsOpen(true)}
      >
        <img
          src={images[selected]}
          alt="Selected"
          className="w-full h-full object-cover select-none"
          draggable={false}
          onDragStart={(e) => e.preventDefault()}
        />
      </div>

      <Swiper
        modules={[Navigation]}
        navigation
        spaceBetween={10}
        slidesPerView={5}
        className="w-full"
      >
        {images.map((img, idx) => (
          <SwiperSlide key={idx}>
            <div
              className={`cursor-pointer rounded-lg overflow-hidden border-2 ${
                selected === idx ? "border-blue-500" : "border-transparent"
              }`}
              onClick={() => setSelected(idx)}
            >
              <img
                src={img}
                alt={`thumb-${idx}`}
                className="w-full h-25 object-cover select-none"
                draggable={false}
                onDragStart={(e) => e.preventDefault()}
                loading="lazy"
              />
            </div>
          </SwiperSlide>
        ))}
      </Swiper>

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
            {images.map((img, idx) => (
              <SwiperSlide key={idx}>
                <img
                  src={img}
                  alt={`zoom-${idx}`}
                  className="w-full h-full object-contain bg-black select-none"
                  draggable={false}
                  onDragStart={(e) => e.preventDefault()}
                />
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      )}
    </div>
  )
}
                                                                                                                                                                                      