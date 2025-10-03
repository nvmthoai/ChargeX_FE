import ProductGallery from "./component/ProductGallery";
import ProductInfo from "./component/ProductInfo";

export default function ProductDetail() {
  return (
    <div className="flex flex-row gap-14 py-10 px-50">
      <div className="flex-1 max-w-lg h-full sticky top-10 self-start">
        <ProductGallery />
      </div>
      <div className="flex-1">
        <ProductInfo />
      </div>
    </div>
  );
}
