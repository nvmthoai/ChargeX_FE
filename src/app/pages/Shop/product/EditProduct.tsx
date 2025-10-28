import { useEffect, useState } from "react";
import { getProductById, updateProduct } from "../../../../api/product/api";
import ProductForm from "./ProductForm";

export default function EditProduct({ id }: { id: string }) {
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const data = await getProductById(id);
        setProduct(data);
      } catch (err) {
        console.error("Lỗi load sản phẩm:", err);
      }
    })();
  }, [id]);

  const handleSubmit = async (formData: FormData) => {
    setLoading(true);
    try {
      await updateProduct(id, formData);
      alert("✅ Cập nhật sản phẩm thành công!");
    } catch (err) {
      console.error(err);
      alert("❌ Lỗi khi cập nhật sản phẩm!");
    } finally {
      setLoading(false);
    }
  };

  if (!product) return <div className="p-10 text-gray-500">Đang tải sản phẩm...</div>;

  return (
    <ProductForm
      mode="edit"
      initialData={product}
      onSubmit={handleSubmit}
      loading={loading}
    />
  );
}
