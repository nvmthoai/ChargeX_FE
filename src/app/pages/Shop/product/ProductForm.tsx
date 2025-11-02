import { useEffect, useState } from "react";
import {
  Upload,
  Link as LinkIcon,
  Image as ImageIcon,
  CheckCircle,
  XCircle,
  PauseCircle,
  FileText,
} from "lucide-react";
import type { Product } from "../../../../api/product/type";

interface ProductFormProps {
  mode: "create" | "edit";
  initialData?: Partial<Product>;
  loading?: boolean;
  onSubmit: (formData: FormData) => Promise<void>;
}

// 🧩 Form state chuẩn với Product type
type FormState = Omit<Product, "id" | "seller" | "createdAt" | "imageUrls"> & {
  imageUrls: string; // textarea nhập link ảnh
};

export default function ProductForm({
  mode,
  initialData,
  loading = false,
  onSubmit,
}: ProductFormProps) {
  const [form, setForm] = useState<FormState>({
    title: "",
    description: "",
    price_start: 0,
    price_buy_now: 0,
    price_now: null,
    status: "active",
    soh_percent: null,
    cycle_count: null,
    nominal_voltage_v: null,
    weight_kg: null,
    condition_grade: "",
    dimension: "",
    is_auction: false,
    end_time: null,
    imageUrls: "",
  });

  const [auctionBackup, setAuctionBackup] = useState({
    price_start: 0,
    price_now: null as number | null,
    end_time: null as string | null,
  });

  const [files, setFiles] = useState<File[]>([]);
  const [filePreviews, setFilePreviews] = useState<string[]>([]);
  const [linkPreviews, setLinkPreviews] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<"link" | "upload">("link");
  const [openStatus, setOpenStatus] = useState(false);

  const statusOptions = [
    { value: "active", label: "Hoạt động", icon: CheckCircle },
    { value: "sold", label: "Đã bán", icon: XCircle },
    { value: "ended", label: "Kết thúc", icon: PauseCircle },
    { value: "draft", label: "Bản nháp", icon: FileText },
  ];

  // 🟦 Load dữ liệu khi edit
  useEffect(() => {
    if (initialData) {
      setForm((prev) => ({
        ...prev,
        title: initialData.title ?? "",
        description: initialData.description ?? "",
        price_start: initialData.price_start ?? 0,
        price_buy_now: initialData.price_buy_now ?? 0,
        price_now: initialData.price_now ?? null,
        status: initialData.status ?? "active",
        soh_percent: initialData.soh_percent ?? null,
        cycle_count: initialData.cycle_count ?? null,
        nominal_voltage_v: initialData.nominal_voltage_v ?? null,
        weight_kg: initialData.weight_kg ?? null,
        condition_grade: initialData.condition_grade ?? "",
        dimension: initialData.dimension ?? "",
        end_time: initialData.end_time ?? null,
        is_auction: initialData.is_auction ?? false,
        imageUrls: (initialData.imageUrls || []).join("\n"),
      }));
      setLinkPreviews(initialData.imageUrls || []);
    }
  }, [initialData]);

  // 🖼️ Upload file
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileList = e.target.files;
    if (!fileList?.length) return;

    const selectedFiles = Array.from(fileList);
    setFiles((prev) => [...prev, ...selectedFiles]);
    setFilePreviews((prev) => [
      ...prev,
      ...selectedFiles.map((file) => URL.createObjectURL(file)),
    ]);

    e.target.value = "";
  };

  // 🧩 Handle input change
  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value, type } = e.target;
    const checked = type === "checkbox" ? (e.target as HTMLInputElement).checked : undefined;

    setForm((prev) => {
      if (name === "is_auction") {
        const newValue = checked ?? false;
        if (!newValue) {
          setAuctionBackup({
            price_start: prev.price_start,
            price_now: prev.price_now,
            end_time: prev.end_time,
          });
          return {
            ...prev,
            is_auction: false,
            price_start: 0,
            price_now: null,
            end_time: null,
          };
        } else {
          return {
            ...prev,
            is_auction: true,
            price_start: auctionBackup.price_start,
            price_now: auctionBackup.price_now,
            end_time: auctionBackup.end_time,
          };
        }
      }

      if (type === "checkbox") {
        return { ...prev, [name]: checked ?? false };
      }

      if (type === "number") {
        return { ...prev, [name]: value === "" ? null : parseFloat(value) };
      }

      return { ...prev, [name]: value };
    });
  };

  // 🔁 Preview link ảnh
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

  // 🚀 Submit form
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.title || !form.description) {
      alert("Vui lòng nhập đầy đủ thông tin bắt buộc!");
      return;
    }

    const formData = new FormData();

    Object.entries(form).forEach(([key, value]) => {
      if (key === "imageUrls") return;

      if (
        mode === "create" &&
        !form.is_auction &&
        ["price_now", "end_time", "is_auction"].includes(key)
      ) {
        return;
      }

      if (value !== "" && value !== null && value !== undefined) {
        formData.append(key, String(value));
      }
    });

    // 🟩 Xử lý ảnh (link hoặc upload)
    if (activeTab === "link" && form.imageUrls.trim()) {
      const arr = form.imageUrls
        .split(/[\n,]/)
        .map((url) => url.trim())
        .filter(Boolean);
      formData.append("imageUrls", JSON.stringify(arr));
    }

    if (activeTab === "upload" && files.length > 0) {
      files.forEach((f) => formData.append("files", f));
    }

    await onSubmit(formData);
  };

  // 🧹 Cleanup preview
  useEffect(() => {
    return () => {
      filePreviews.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [filePreviews]);

  return (
    <div className="min-h-[85vh] rounded-3xl shadow-lg p-10 border border-blue-100 bg-white transition-all duration-300">
      <form onSubmit={handleSubmit} className="space-y-10 max-w-3xl mx-auto">
        {/* 🟦 PHẦN 1: THÔNG TIN CƠ BẢN */}
        <section className="space-y-6">
          <h2 className="text-xl font-semibold text-blue-600 border-b-2 border-blue-200 pb-2 flex items-center gap-2">
            <FileText className="text-blue-500" size={20} /> Thông tin cơ bản
          </h2>

          {/* Tên + Trạng thái */}
          <div className="grid grid-cols-2 gap-5">
            <div>
              <label className="block font-medium text-gray-700 mb-1">
                Tên sản phẩm <span className="text-red-500">*</span>
              </label>
              <input
                name="title"
                value={form.title}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-xl px-4 py-2.5 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all"
                placeholder="Nhập tên sản phẩm..."
              />
            </div>

            {/* Dropdown status */}
            <div className="relative">
              <label className="block font-medium text-gray-700 mb-1">Tình trạng</label>
              <div
                className="border border-gray-300 rounded-xl px-4 py-2.5 bg-white shadow-sm cursor-pointer hover:border-blue-400 transition-all flex justify-between items-center"
                onClick={() => setOpenStatus((o) => !o)}
              >
                <div className="flex items-center gap-2">
                  {(() => {
                    const selected = statusOptions.find((s) => s.value === form.status);
                    if (!selected) return null;
                    const Icon = selected.icon;
                    return <Icon size={18} className="text-blue-500" />;
                  })()}
                  <span>{statusOptions.find((s) => s.value === form.status)?.label ?? "Chọn"}</span>
                </div>
                <svg
                  className={`w-4 h-4 text-gray-500 transition-transform ${openStatus ? "rotate-180" : ""}`}
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </div>
              {openStatus && (
                <div className="absolute z-20 bg-white border border-gray-200 rounded-xl mt-1 shadow-lg w-full">
                  {statusOptions.map((opt) => {
                    const Icon = opt.icon;
                    return (
                      <div
                        key={opt.value}
                        className={`flex items-center gap-3 px-4 py-2.5 hover:bg-blue-50 cursor-pointer ${
                          form.status === opt.value ? "bg-blue-100" : ""
                        }`}
                        onClick={() => {
                          setForm((p) => ({ ...p, status: opt.value }));
                          setOpenStatus(false);
                        }}
                      >
                        <Icon size={18} className="text-blue-500" />
                        <span className="text-gray-700">{opt.label}</span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Mô tả */}
          <div>
            <label className="block font-medium text-gray-700 mb-1">
              Mô tả sản phẩm <span className="text-red-500">*</span>
            </label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              placeholder="Nhập mô tả chi tiết..."
              className="w-full border border-gray-300 rounded-xl px-4 py-3 h-28 resize-none shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>

          {/* Giá và kích thước */}
          <div className="grid grid-cols-3 gap-4">
            <input
              type="number"
              name="price_buy_now"
              placeholder="Giá mua ngay (VNĐ)"
              value={form.price_buy_now ?? ""}
              onChange={handleChange}
              className="border rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-blue-400"
            />
            <input
              type="number"
              name="price_start"
              placeholder="Giá khởi điểm (VNĐ)"
              value={form.price_start ?? ""}
              onChange={handleChange}
              className="border rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-blue-400"
            />
            <input
              type="text"
              name="dimension"
              placeholder="Kích thước (VD: 30x20x10cm)"
              value={form.dimension ?? ""}
              onChange={handleChange}
              className="border rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-blue-400"
            />
            <input
              type="number"
              name="weight_kg"
              placeholder="Trọng lượng (kg)"
              value={form.weight_kg ?? ""}
              onChange={handleChange}
              className="border rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-blue-400"
            />
          </div>

          {/* Thông số kỹ thuật */}
          <div className="grid grid-cols-3 gap-4">
            <input
              type="number"
              name="soh_percent"
              placeholder="SOH (%)"
              value={form.soh_percent ?? ""}
              onChange={handleChange}
              className="border rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-blue-400"
            />
            <input
              type="number"
              name="cycle_count"
              placeholder="Số chu kỳ sạc"
              value={form.cycle_count ?? ""}
              onChange={handleChange}
              className="border rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-blue-400"
            />
            <input
              type="number"
              name="nominal_voltage_v"
              placeholder="Điện áp danh định (V)"
              value={form.nominal_voltage_v ?? ""}
              onChange={handleChange}
              className="border rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-blue-400"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <input
              type="text"
              name="condition_grade"
              placeholder="Tình trạng (VD: A+, B...)"
              value={form.condition_grade ?? ""}
              onChange={handleChange}
              className="border rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-blue-400"
            />
          </div>
        </section>

        {/* 🟩 HÌNH ẢNH */}
        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-blue-600 border-b-2 border-blue-200 pb-2 flex items-center gap-2">
            <ImageIcon className="text-blue-500" size={20} /> Hình ảnh sản phẩm
          </h2>

          {/* Tab chọn kiểu thêm ảnh */}
          <div className="flex gap-4 mb-3">
            {[
              { key: "link", label: "Dán link ảnh", icon: LinkIcon },
              { key: "upload", label: "Upload file", icon: Upload },
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.key}
                  type="button"
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border transition-all ${
                    activeTab === tab.key
                      ? "bg-blue-100 border-blue-400 text-blue-600"
                      : "bg-white border-gray-300 hover:border-blue-300"
                  }`}
                  onClick={() => setActiveTab(tab.key as "link" | "upload")}
                >
                  <Icon size={18} /> {tab.label}
                </button>
              );
            })}
          </div>

          {/* === Link Mode === */}
          {activeTab === "link" ? (
            <div>
              <textarea
                name="imageUrls"
                value={form.imageUrls}
                onChange={handleChange}
                placeholder="Mỗi dòng một link ảnh hoặc ngăn cách bằng dấu phẩy"
                className="w-full border rounded-xl px-4 py-3 h-24 resize-none focus:ring-2 focus:ring-blue-400"
              />
              {linkPreviews.length > 0 && (
                <div className="grid grid-cols-3 gap-2 mt-2">
                  {linkPreviews.map((url, i) => (
                    <img
                      key={i}
                      src={url}
                      alt={`Link ${i}`}
                      className="w-full h-32 object-cover border rounded-md shadow-sm hover:scale-[1.03] transition-transform"
                    />
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="w-full border-2 border-dashed border-gray-300 rounded-xl p-4 min-h-[220px] bg-white">
              {filePreviews.length > 0 ? (
                <div className="flex flex-wrap gap-3 justify-start">
                  {filePreviews.map((src, i) => (
                    <div key={i} className="relative group w-[120px] h-[120px]">
                      <img
                        src={src}
                        alt={`preview-${i}`}
                        className="w-full h-full object-cover rounded-lg shadow-sm border border-gray-200 group-hover:opacity-80 transition"
                      />
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setFiles((prev) => prev.filter((_, idx) => idx !== i));
                          setFilePreviews((prev) => prev.filter((_, idx) => idx !== i));
                        }}
                        className="absolute top-1 right-1 bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition"
                        title="Xoá ảnh này"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-[180px] text-gray-500">
                  <Upload className="text-blue-400 mb-2" size={32} />
                  <p>Chưa chọn ảnh nào</p>
                </div>
              )}

              <div className="flex items-center justify-between mt-3">
                <button
                  type="button"
                  onClick={() => document.getElementById("fileInput")?.click()}
                  className="px-4 py-2 bg-blue-100 text-blue-600 font-medium rounded-lg hover:bg-blue-200 transition"
                >
                  📤 Chọn hoặc kéo ảnh vào đây
                </button>

                {filePreviews.length > 0 && (
                  <button
                    type="button"
                    onClick={() => {
                      setFiles([]);
                      setFilePreviews([]);
                    }}
                    className="text-sm text-red-600 underline hover:text-red-700"
                  >
                    Xoá tất cả ảnh
                  </button>
                )}
              </div>

              <input
                id="fileInput"
                type="file"
                multiple
                onChange={handleFileChange}
                accept="image/*"
                className="hidden"
              />
            </div>
          )}
        </section>

        {/* 🟢 Nút Submit */}
        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 rounded-xl text-white font-semibold text-lg shadow-md bg-blue-600 hover:bg-blue-700 transition-all disabled:opacity-60"
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
