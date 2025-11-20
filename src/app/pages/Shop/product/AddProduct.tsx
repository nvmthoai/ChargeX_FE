import { useState } from "react";
import { createProduct } from "../../../../api/product/api";
import ProductForm from "./ProductForm";

export default function AddProduct({ onClose, onCreated }: { onClose?: () => void; onCreated?: () => void }) {
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (formData: FormData) => {
    setLoading(true);
    try {
      await createProduct(formData);
      alert("✅ Thêm sản phẩm thành công!");
      onCreated?.();
      onClose?.();
    } catch (err) {
      console.error(err);
      alert("❌ Lỗi khi thêm sản phẩm!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ProductForm
      mode="create"
      onSubmit={handleSubmit}
      loading={loading}
    />
  );
}
