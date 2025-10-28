import { useEffect, useState } from "react";
import { Upload } from "lucide-react";
import type { Product } from "../../../../api/product/type";

interface ProductFormProps {
    mode: "create" | "edit";
    initialData?: Partial<Product>;
    loading?: boolean;
    onSubmit: (formData: FormData) => Promise<void>;
}

export default function ProductForm({
    mode,
    initialData,
    loading = false,
    onSubmit,
}: ProductFormProps) {
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
        imgUrl: "",
        imageUrls: "",
    });

    const [files, setFiles] = useState<File[]>([]);
    const [filePreviews, setFilePreviews] = useState<string[]>([]);
    const [linkPreviews, setLinkPreviews] = useState<string[]>([]);

    useEffect(() => {
        if (initialData) {
            setForm((prev) => ({
                ...prev,
                title: initialData.title ?? "",
                description: initialData.description ?? "",
                price_start: initialData.price_start ?? "",
                price_buy_now: initialData.price_buy_now ?? "",
                price_now: initialData.price_now ?? "",
                status: initialData.status ?? "active",
                soh_percent: initialData.soh_percent != null ? String(initialData.soh_percent) : "",
                cycle_count: initialData.cycle_count != null ? String(initialData.cycle_count) : "",
                nominal_voltage_v: initialData.nominal_voltage_v != null ? String(initialData.nominal_voltage_v) : "",
                weight_kg: initialData.weight_kg != null ? String(initialData.weight_kg) : "",
                condition_grade: initialData.condition_grade ?? "",
                dimension: initialData.dimension ?? "",
                reserve_price: "",
                end_time: initialData.end_time ?? "",
                is_auction: initialData.is_auction ?? false,
                imgUrl: "",
                imageUrls: (initialData.imageUrls || []).join("\n"),
            }));
            setLinkPreviews(initialData.imageUrls || []);
        }
    }, [initialData]);


    // 🖼️ Upload multiple images
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files) return;
        const selectedFiles = Array.from(e.target.files);
        setFiles(selectedFiles);
        setFilePreviews(selectedFiles.map((file) => URL.createObjectURL(file)));
    };

    // 🧩 Handle input changes
    const handleChange = (
        e: React.ChangeEvent<
            HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
        >
    ) => {
        const { name, value, type } = e.target;
        const checked =
            type === "checkbox" ? (e.target as HTMLInputElement).checked : undefined;
        setForm((prev) => ({
            ...prev,
            [name]: type === "checkbox" ? checked ?? false : value,
        }));
    };

    // 🔁 Link preview
    useEffect(() => {
        if (!form.imageUrls.trim()) {
            setLinkPreviews([]);
            return;
        }

        const urls = form.imageUrls
            .split(/[\n,]/)
            .map((u) => u.trim())
            .filter(Boolean);
        setLinkPreviews(urls);
    }, [form.imageUrls]);

// 🚀 Submit
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();

  if (!form.title || !form.description) {
    alert("Vui lòng nhập đầy đủ thông tin bắt buộc!");
    return;
  }

  const formData = new FormData();

  Object.entries(form).forEach(([key, value]) => {
    if (key === "imageUrls" || key === "imgUrl") return;
    if (value !== "" && value !== null && value !== undefined) {
      formData.append(key, value.toString());
    }
  });

  if (form.imgUrl.trim()) formData.append("imgUrl", form.imgUrl.trim());

  // ✅ Sửa ở đây
  if (form.imageUrls.trim()) {
    const arr = form.imageUrls
      .split(/[\n,]/)
      .map((url) => url.trim())
      .filter(Boolean);
    arr.forEach((url) => formData.append("imageUrls", url));
  }

  files.forEach((f) => formData.append("files", f));

  await onSubmit(formData);
};


    return (
        <div className="min-h-[80vh] bg-gradient-to-br from-blue-50 to-white rounded-2xl shadow-sm p-8">
            <form onSubmit={handleSubmit} className="space-y-5 max-w-3xl mx-auto">
                {/* Title + Status */}
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block font-medium text-gray-700 mb-1">
                            Tên sản phẩm <span className="text-red-500">*</span>
                        </label>
                        <input
                            name="title"
                            value={form.title}
                            onChange={handleChange}
                            className="w-full border rounded-lg px-4 py-2"
                            placeholder="Nhập tên sản phẩm..."
                        />
                    </div>

                    <div>
                        <label className="block font-medium text-gray-700 mb-1">
                            Tình trạng
                        </label>
                        <select
                            name="status"
                            value={form.status}
                            onChange={handleChange}
                            className="w-full border rounded-lg px-4 py-2"
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
                    <label className="block font-medium text-gray-700 mb-1">
                        Mô tả sản phẩm <span className="text-red-500">*</span>
                    </label>
                    <textarea
                        name="description"
                        value={form.description}
                        onChange={handleChange}
                        placeholder="Nhập mô tả chi tiết..."
                        className="w-full border rounded-lg px-4 py-2 h-24 resize-none"
                    />
                </div>

                {/* Prices */}
                <div className="grid grid-cols-3 gap-4">
                    <input
                        type="number"
                        name="price_start"
                        placeholder="Giá khởi điểm"
                        value={form.price_start}
                        onChange={handleChange}
                        className="border rounded-lg px-4 py-2"
                    />
                    <input
                        type="number"
                        name="price_buy_now"
                        placeholder="Giá mua ngay"
                        value={form.price_buy_now}
                        onChange={handleChange}
                        className="border rounded-lg px-4 py-2"
                    />
                    <input
                        type="number"
                        name="price_now"
                        placeholder="Giá hiện tại"
                        value={form.price_now}
                        onChange={handleChange}
                        className="border rounded-lg px-4 py-2"
                    />
                </div>

                {/* Auction */}
                <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center gap-3">
                        <input
                            type="checkbox"
                            name="is_auction"
                            checked={form.is_auction}
                            onChange={handleChange}
                            className="w-5 h-5 text-blue-600"
                        />
                        <label className="font-medium text-gray-700">
                            Đây là sản phẩm đấu giá
                        </label>
                    </div>
                    <input
                        type="number"
                        name="reserve_price"
                        placeholder="Giá dự phòng (VNĐ)"
                        value={form.reserve_price}
                        onChange={handleChange}
                        className="border rounded-lg px-4 py-2"
                    />
                    <input
                        type="datetime-local"
                        name="end_time"
                        placeholder="Thời gian kết thúc"
                        value={form.end_time}
                        onChange={handleChange}
                        className="border rounded-lg px-4 py-2"
                    />
                </div>

                {/* Image URLs */}
                <div>
                    <label className="block font-medium text-gray-700 mb-1">
                        Link ảnh chính (imgUrl)
                    </label>
                    <input
                        name="imgUrl"
                        value={form.imgUrl}
                        onChange={handleChange}
                        placeholder="https://example.com/main.jpg"
                        className="w-full border rounded-lg px-4 py-2 mb-2"
                    />
                    {form.imgUrl && (
                        <img
                            src={form.imgUrl}
                            alt="Preview"
                            className="w-40 h-40 object-cover border rounded-lg mb-3"
                        />
                    )}

                    <label className="block font-medium text-gray-700 mb-1">
                        Danh sách link ảnh (imageUrls)
                    </label>
                    <textarea
                        name="imageUrls"
                        value={form.imageUrls}
                        onChange={handleChange}
                        placeholder="Mỗi dòng một link hoặc ngăn cách bằng dấu phẩy"
                        className="w-full border rounded-lg px-4 py-2 h-24 resize-none"
                    />
                    {linkPreviews.length > 0 && (
                        <div className="grid grid-cols-3 gap-2 mt-2">
                            {linkPreviews.map((url, i) => (
                                <img
                                    key={i}
                                    src={url}
                                    alt={`Link ${i}`}
                                    className="w-full h-32 object-cover border rounded-md"
                                />
                            ))}
                        </div>
                    )}
                </div>

                {/* File Upload */}
                <div>
                    <label className="block font-medium text-gray-700 mb-1">
                        Upload hình ảnh (files)
                    </label>
                    <label className="flex flex-col items-center justify-center w-full h-56 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:bg-blue-50 transition relative overflow-hidden">
                        {filePreviews.length > 0 ? (
                            <div className="grid grid-cols-3 gap-2 absolute inset-0 p-2">
                                {filePreviews.map((src, i) => (
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

                {/* Submit */}
                <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-lg transition-all duration-150 disabled:opacity-60"
                >
                    {loading
                        ? mode === "edit"
                            ? "Đang cập nhật..."
                            : "Đang thêm..."
                        : mode === "edit"
                            ? "Lưu thay đổi"
                            : "Thêm sản phẩm"}
                </button>
            </form>
        </div>
    );
}
