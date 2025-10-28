import { useEffect, useState } from "react";
import { getProductById, updateProduct } from "../../../../api/product/api";
import ProductForm from "./ProductForm";

export default function EditProduct({ id }: { id: string }) {
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [initializing, setInitializing] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const data = await getProductById(id);
        // 🟢 Chuẩn hóa dữ liệu imageUrls: luôn là mảng rỗng hoặc mảng chuỗi
        setProduct({
          ...data,
          imageUrls: Array.isArray(data.imageUrls)
            ? data.imageUrls
            : data.imageUrls
            ? [data.imageUrls]
            : [],
        });
      } catch (err) {
        console.error("Lỗi load sản phẩm:", err);
      } finally {
        setInitializing(false);
      }
    })();
  }, [id]);

  // 🟢 Gửi form + reload sau khi cập nhật
  const handleSubmit = async (formData: FormData) => {
    setLoading(true);
    try {
      await updateProduct(id, formData);
      alert("✅ Cập nhật sản phẩm thành công!");
      // 🔁 Reload lại dữ liệu mới nhất
      const updated = await getProductById(id);
      setProduct({
        ...updated,
        imageUrls: Array.isArray(updated.imageUrls)
          ? updated.imageUrls
          : updated.imageUrls
          ? [updated.imageUrls]
          : [],
      });
    } catch (err) {
      console.error("❌ Lỗi khi cập nhật sản phẩm:", err);
      alert("❌ Lỗi khi cập nhật sản phẩm!");
    } finally {
      setLoading(false);
    }
  };

  if (initializing)
    return <div className="p-10 text-gray-500">Đang tải sản phẩm...</div>;

  return (
    <ProductForm
      mode="edit"
      initialData={product}
      onSubmit={handleSubmit}
      loading={loading}
    />
  );
}
