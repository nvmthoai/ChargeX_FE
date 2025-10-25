import { useState } from "react";
import { Upload } from "lucide-react";
import { createProduct } from "../../../../api/product/api";

export default function ProductManager() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priceStart, setPriceStart] = useState("");
  const [priceBuyNow, setPriceBuyNow] = useState("");
  const [isAuction, setIsAuction] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // 🖼️ Xử lý chọn file + hiển thị preview
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selected = e.target.files[0];
      setFile(selected);
      setPreview(URL.createObjectURL(selected));
    }
  };

  // 🚀 Gửi form
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !description || !priceStart) {
      alert("Vui lòng điền đầy đủ thông tin bắt buộc!");
      return;
    }

    try {
      setLoading(true);
      await createProduct({
        title,
        description,
        price_start: Number(priceStart),
        price_buy_now: priceBuyNow ? Number(priceBuyNow) : undefined,
        is_auction: isAuction,
        file: file || undefined,
      });

      alert("✅ Thêm sản phẩm thành công!");
      // Reset form
      setTitle("");
      setDescription("");
      setPriceStart("");
      setPriceBuyNow("");
      setIsAuction(false);
      setFile(null);
      setPreview(null);
    } catch (err) {
      console.error(err);
      alert("❌ Lỗi khi thêm sản phẩm!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-2xl mx-auto bg-white shadow-lg rounded-2xl p-8 border border-gray-100">
        <h2 className="text-2xl font-semibold text-gray-800 mb-6 text-center">
          🛍️ Thêm sản phẩm mới
        </h2>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Tên sản phẩm */}
          <div>
            <label className="block text-gray-700 font-medium mb-1">
              Tên sản phẩm <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-400 focus:border-blue-400 outline-none"
              placeholder="Nhập tên sản phẩm..."
            />
          </div>

          {/* Mô tả */}
          <div>
            <label className="block text-gray-700 font-medium mb-1">
              Mô tả <span className="text-red-500">*</span>
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 h-28 focus:ring-2 focus:ring-blue-400 focus:border-blue-400 outline-none resize-none"
              placeholder="Mô tả chi tiết sản phẩm..."
            />
          </div>

          {/* Giá */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-700 font-medium mb-1">
                Giá khởi điểm <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                value={priceStart}
                onChange={(e) => setPriceStart(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-400 focus:border-blue-400 outline-none"
                placeholder="VD: 1000000"
              />
            </div>
            <div>
              <label className="block text-gray-700 font-medium mb-1">
                Giá mua ngay
              </label>
              <input
                type="number"
                value={priceBuyNow}
                onChange={(e) => setPriceBuyNow(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-400 focus:border-blue-400 outline-none"
                placeholder="VD: 2000000"
              />
            </div>
          </div>

          {/* Checkbox đấu giá */}
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={isAuction}
              onChange={(e) => setIsAuction(e.target.checked)}
              className="w-5 h-5 text-blue-600 border-gray-300 focus:ring-blue-400"
            />
            <label className="text-gray-700 font-medium">
              Đây là sản phẩm đấu giá
            </label>
          </div>

          {/* Upload file */}
          <div>
            <label className="block text-gray-700 font-medium mb-1">
              Hình ảnh sản phẩm
            </label>
            <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition relative overflow-hidden">
              <Upload className="text-gray-400 mb-2" size={28} />
              <span className="text-sm text-gray-500">
                {file ? file.name : "Chọn ảnh (PNG/JPG)"}
              </span>
              <input
                type="file"
                onChange={handleFileChange}
                accept="image/*"
                className="hidden"
              />
              {preview && (
                <img
                  src={preview}
                  alt="preview"
                  className="absolute inset-0 w-full h-full object-cover opacity-40"
                />
              )}
            </label>
          </div>

          {/* Nút submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-lg transition-all duration-150 disabled:opacity-60"
          >
            {loading ? "Đang thêm..." : "Thêm sản phẩm"}
          </button>
        </form>
      </div>
    </div>
  );
}
