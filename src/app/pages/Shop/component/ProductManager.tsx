import { useState } from "react";
import { Upload } from "lucide-react";
import { createProduct } from "../../../../api/product/api";

export default function ProductManager() {
  const [form, setForm] = useState({
    title: "",
    description: "",
    price_start: "",
    price_buy_now: "",
    price_now: "",
    status: "active",
    soh_percent: "",
    cycle_count: "",
    nominal_voltage_v: "",
    weight_kg: "",
    condition_grade: "",
    dimension: "",
    reserve_price: "",
    end_time: "",
    is_auction: false,
  });

  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  // 🖼️ Upload multiple images
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const selectedFiles = Array.from(e.target.files);
    setFiles(selectedFiles);
    setPreviews(selectedFiles.map((file) => URL.createObjectURL(file)));
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value, type } = e.target;
    const checked =
      type === "checkbox" && "checked" in e.target ? (e.target as HTMLInputElement).checked : undefined;

    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked ?? false : value,
    }));
  };


  // 🚀 Submit form
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title || !form.description || !form.price_start) {
      alert("Vui lòng điền đủ thông tin bắt buộc!");
      return;
    }

    try {
      setLoading(true);

      const formData = new FormData();
      Object.entries(form).forEach(([key, value]) => {
        if (value !== "" && value !== null && value !== undefined) {
          formData.append(key, value.toString());
        }
      });

      files.forEach((f) => formData.append("files", f));

      await createProduct(formData);
      alert("✅ Thêm sản phẩm thành công!");
      setForm({
        title: "",
        description: "",
        price_start: "",
        price_buy_now: "",
        price_now: "",
        status: "active",
        soh_percent: "",
        cycle_count: "",
        nominal_voltage_v: "",
        weight_kg: "",
        condition_grade: "",
        dimension: "",
        reserve_price: "",
        end_time: "",
        is_auction: false,
      });
      setFiles([]);
      setPreviews([]);
    } catch (err) {
      console.error(err);
      alert("❌ Lỗi khi thêm sản phẩm!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] bg-gradient-to-br from-blue-50 to-white rounded-2xl shadow-sm p-8">
      <form onSubmit={handleSubmit} className="space-y-5 max-w-3xl mx-auto">
        <h2 className="text-2xl font-semibold text-gray-800 mb-4 text-center">
          🧾 Thêm sản phẩm mới
        </h2>

        {/* --- Basic info --- */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-gray-700 font-medium mb-1">
              Tên sản phẩm <span className="text-red-500">*</span>
            </label>
            <input
              name="title"
              value={form.title}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-400"
              placeholder="Nhập tên sản phẩm..."
            />
          </div>

          <div>
            <label className="block text-gray-700 font-medium mb-1">
              Tình trạng
            </label>
            <select
              name="status"
              value={form.status}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-400"
            >
              <option value="active">Active</option>
              <option value="sold">Sold</option>
              <option value="ended">Ended</option>
              <option value="draft">Draft</option>
            </select>
          </div>
        </div>

        {/* Description */}
        <div>
          <label className="block text-gray-700 font-medium mb-1">
            Mô tả <span className="text-red-500">*</span>
          </label>
          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-lg px-4 py-2 h-28 focus:ring-2 focus:ring-blue-400 resize-none"
            placeholder="Mô tả chi tiết sản phẩm..."
          />
        </div>

        {/* Prices */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-gray-700 font-medium mb-1">
              Giá khởi điểm (VNĐ) <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              name="price_start"
              value={form.price_start}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-400"
            />
          </div>
          <div>
            <label className="block text-gray-700 font-medium mb-1">
              Giá mua ngay
            </label>
            <input
              type="number"
              name="price_buy_now"
              value={form.price_buy_now}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-400"
            />
          </div>
        </div>

        {/* Extra technical info */}
        <div className="grid grid-cols-3 gap-4">
          <input
            placeholder="Voltage (V)"
            name="nominal_voltage_v"
            value={form.nominal_voltage_v}
            onChange={handleChange}
            className="border border-gray-300 rounded-lg px-4 py-2"
          />
          <input
            placeholder="Condition (A/B/C)"
            name="condition_grade"
            value={form.condition_grade}
            onChange={handleChange}
            className="border border-gray-300 rounded-lg px-4 py-2"
          />
          <input
            placeholder="Kích thước (LxWxH)"
            name="dimension"
            value={form.dimension}
            onChange={handleChange}
            className="border border-gray-300 rounded-lg px-4 py-2"
          />
        </div>

        {/* Auction checkbox */}
        <div className="flex items-center gap-3">
          <input
            type="checkbox"
            name="is_auction"
            checked={form.is_auction}
            onChange={handleChange}
            className="w-5 h-5 text-blue-600 border-gray-300 focus:ring-blue-400"
          />
          <label className="text-gray-700 font-medium">
            Đây là sản phẩm đấu giá
          </label>
        </div>

        {/* Upload images */}
        <div>
          <label className="block text-gray-700 font-medium mb-1">
            Hình ảnh sản phẩm
          </label>
          <label className="flex flex-col items-center justify-center w-full h-56 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:bg-blue-50 transition relative overflow-hidden">
            {previews.length > 0 ? (
              <div className="grid grid-cols-3 gap-2 absolute inset-0 p-2">
                {previews.map((src, i) => (
                  <img
                    key={i}
                    src={src}
                    className="w-full h-full object-cover rounded-md"
                    alt={`preview-${i}`}
                  />
                ))}
              </div>
            ) : (
              <>
                <Upload className="text-blue-400 mb-2" size={32} />
                <span className="text-sm text-gray-500">
                  Chọn hoặc kéo nhiều ảnh vào đây
                </span>
              </>
            )}
            <input
              type="file"
              multiple
              onChange={handleFileChange}
              accept="image/*"
              className="hidden"
            />
          </label>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-lg transition-all duration-150 disabled:opacity-60"
        >
          {loading ? "Đang thêm..." : "Thêm sản phẩm"}
        </button>
      </form>
    </div>
  );
}
