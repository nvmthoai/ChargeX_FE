import { useEffect, useState } from "react";
import {
  UploadCloud,
  Image as ImageIcon,
  CheckCircle,
  XCircle,
  PauseCircle,
  FileText,
  Trash2,
} from "lucide-react";
import type { Product } from "../../../../api/product/type";

interface ProductFormProps {
  mode: "create" | "edit";
  initialData?: Partial<Product>;
  loading?: boolean;
  onSubmit: (formData: FormData) => Promise<void>;
}

type FormState = Omit<
  Product,
  | "id"
  | "seller"
  | "createdAt"
  | "imageUrls"
  | "is_auction"
  | "price_start"
  | "price_now"
  | "end_time"
> & {
  imageUrls: string;
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
    price_buy_now: 0,
    status: "active",
    soh_percent: null,
    cycle_count: null,
    nominal_voltage_v: null,
    weight_kg: null,
    condition_grade: "",
    dimension: "",
    imageUrls: "",
  });

  const [files, setFiles] = useState<File[]>([]);
  const [filePreviews, setFilePreviews] = useState<string[]>([]);
  const [openStatus, setOpenStatus] = useState(false);

  const statusOptions = [
    { value: "active", label: "Active", icon: CheckCircle },
    { value: "sold", label: "Sold", icon: XCircle },
    { value: "ended", label: "Ended", icon: PauseCircle },
    { value: "draft", label: "Draft", icon: FileText },
  ];

  // 🔹 Load data when editing
  useEffect(() => {
    if (initialData) {
      setForm((prev) => ({
        ...prev,
        title: initialData.title ?? "",
        description: initialData.description ?? "",
        price_buy_now: initialData.price_buy_now ?? 0,
        status: initialData.status ?? "active",
        soh_percent: initialData.soh_percent ?? null,
        cycle_count: initialData.cycle_count ?? null,
        nominal_voltage_v: initialData.nominal_voltage_v ?? null,
        weight_kg: initialData.weight_kg ?? null,
        condition_grade: initialData.condition_grade ?? "",
        dimension: initialData.dimension ?? "",
        imageUrls: (initialData.imageUrls || []).join("\n"),
      }));
      setFilePreviews(initialData.imageUrls || []);
    }
  }, [initialData]);

  // 🔹 Handle file uploads
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

  // 🔹 Handle input changes
  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value, type } = e.target;
    const checked =
      type === "checkbox" ? (e.target as HTMLInputElement).checked : undefined;

    setForm((prev) => {
      if (type === "checkbox") {
        return { ...prev, [name]: checked ?? false };
      }

      if (type === "number") {
        return { ...prev, [name]: value === "" ? null : parseFloat(value) };
      }

      return { ...prev, [name]: value };
    });
  };

  // 🔹 Format tiền hiển thị
  const handleMoneyChange = (name: string, value: string) => {
    const numeric = value.replace(/,/g, "");
    setForm((prev) => ({
      ...prev,
      [name]: numeric === "" ? 0 : Number(numeric),
    }));
  };

  // 🔹 Submit form
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.title || !form.description) {
      alert("Please fill in all required fields!");
      return;
    }

    const formData = new FormData();

    Object.entries(form).forEach(([key, value]) => {
      if (key === "imageUrls") return;
      if (value !== "" && value !== null && value !== undefined) {
        formData.append(key, String(value));
      }
    });

    if (files.length > 0) {
      files.forEach((f) => formData.append("files", f));
    }

    await onSubmit(formData);
  };

  // 🔹 Cleanup file previews
  useEffect(() => {
    return () => {
      filePreviews.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [filePreviews]);

  return (
    <div className="min-h-[85vh] rounded-3xl shadow-lg p-10 border border-blue-100 bg-white transition-all duration-300">
      <form onSubmit={handleSubmit} className="space-y-10 max-w-3xl mx-auto">
        {/* SECTION 1: Basic Information */}
        <section className="space-y-6">
          <h2 className="text-xl font-semibold text-blue-600 border-b-2 border-blue-200 pb-2 flex items-center gap-2">
            <FileText className="text-blue-500" size={20} /> Basic Information
          </h2>

          <div className="grid grid-cols-2 gap-5">
            <div>
              <label className="block font-medium text-gray-700 mb-1">
                Product Name <span className="text-red-500">*</span>
              </label>
              <input
                name="title"
                value={form.title}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-xl px-4 py-2.5 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all"
                placeholder="Enter product name..."
              />
            </div>

            <div className="relative">
              <label className="block font-medium text-gray-700 mb-1">
                Status
              </label>
              <div
                className="border border-gray-300 rounded-xl px-4 py-2.5 bg-white shadow-sm cursor-pointer hover:border-blue-400 transition-all flex justify-between items-center"
                onClick={() => setOpenStatus((o) => !o)}
              >
                <div className="flex items-center gap-2">
                  {(() => {
                    const selected = statusOptions.find(
                      (s) => s.value === form.status
                    );
                    if (!selected) return null;
                    const Icon = selected.icon;
                    return <Icon size={18} className="text-blue-500" />;
                  })()}
                  <span>
                    {
                      statusOptions.find((s) => s.value === form.status)
                        ?.label ?? "Select"
                    }
                  </span>
                </div>
                <svg
                  className={`w-4 h-4 text-gray-500 transition-transform ${
                    openStatus ? "rotate-180" : ""
                  }`}
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M19 9l-7 7-7-7"
                  />
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

          <div>
            <label className="block font-medium text-gray-700 mb-1">
              Description <span className="text-red-500">*</span>
            </label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              placeholder="Enter detailed product description..."
              className="w-full border border-gray-300 rounded-xl px-4 py-3 h-28 resize-none shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-medium text-gray-700 mb-1">
                Buy Now Price (VND)
              </label>
              <input
                type="text"
                name="price_buy_now"
                value={
                  form.price_buy_now
                    ? form.price_buy_now.toLocaleString("en-US")
                    : ""
                }
                onChange={(e) =>
                  handleMoneyChange("price_buy_now", e.target.value)
                }
                className="border rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-blue-400 w-full"
                placeholder="e.g. 11,000"
              />
            </div>

            <div>
              <label className="block font-medium text-gray-700 mb-1">
                Dimension <span className="text-gray-500 text-sm">(cm)</span>
              </label>
              <input
                type="text"
                name="dimension"
                value={form.dimension ?? ""}
                onChange={handleChange}
                className="border rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-blue-400 w-full"
                placeholder="e.g. 30x20x10"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block font-medium text-gray-700 mb-1">
                SOH (%) <span className="text-gray-500 text-sm">(State of Health)</span>
              </label>
              <input
                type="number"
                name="soh_percent"
                value={form.soh_percent ?? ""}
                onChange={handleChange}
                className="border rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-blue-400 w-full"
                placeholder="e.g. 80"
              />
            </div>
            <div>
              <label className="block font-medium text-gray-700 mb-1">
                Cycle Count
              </label>
              <input
                type="number"
                name="cycle_count"
                value={form.cycle_count ?? ""}
                onChange={handleChange}
                className="border rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-blue-400 w-full"
                placeholder="e.g. 500"
              />
            </div>
            <div>
              <label className="block font-medium text-gray-700 mb-1">
                Nominal Voltage (V)
              </label>
              <input
                type="number"
                name="nominal_voltage_v"
                value={form.nominal_voltage_v ?? ""}
                onChange={handleChange}
                className="border rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-blue-400 w-full"
                placeholder="e.g. 48"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-medium text-gray-700 mb-1">
                Weight (kg)
              </label>
              <input
                type="number"
                name="weight_kg"
                value={form.weight_kg ?? ""}
                onChange={handleChange}
                className="border rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-blue-400 w-full"
                placeholder="e.g. 25"
              />
            </div>

            <div>
              <label className="block font-medium text-gray-700 mb-1">
                Condition Grade <span className="text-gray-500 text-sm">(A+, A, B...)</span>
              </label>
              <input
                type="text"
                name="condition_grade"
                value={form.condition_grade ?? ""}
                onChange={handleChange}
                className="border rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-blue-400 w-full"
                placeholder="e.g. A+"
              />
            </div>
          </div>
        </section>

        {/* SECTION 2: IMAGE UPLOAD */}
        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-blue-600 border-b-2 border-blue-200 pb-2 flex items-center gap-2">
            <ImageIcon className="text-blue-500" size={20} /> Product Images
          </h2>

          <div
            className="border-2 border-dashed border-blue-200 bg-blue-50/40 rounded-2xl p-8 flex flex-col items-center justify-center text-center cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition"
            onClick={() => document.getElementById("fileInput")?.click()}
          >
            <UploadCloud className="text-blue-500 mb-3" size={40} />
            <p className="text-blue-600 font-medium text-lg">
              Click to upload or drag & drop
            </p>
            <p className="text-gray-500 text-sm mt-1">
              Supported formats: JPG, PNG, JPEG • Max 5MB each
            </p>
            <input
              id="fileInput"
              type="file"
              multiple
              onChange={handleFileChange}
              accept="image/*"
              className="hidden"
            />
          </div>

          {filePreviews.length > 0 && (
            <div className="mt-4">
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-gray-700 font-medium">
                  Selected Images ({filePreviews.length})
                </h3>
                <button
                  type="button"
                  onClick={() => {
                    setFiles([]);
                    setFilePreviews([]);
                  }}
                  className="text-sm text-red-600 flex items-center gap-1 hover:text-red-700"
                >
                  <Trash2 size={16} /> Remove all
                </button>
              </div>

              <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                {filePreviews.map((src, i) => (
                  <div
                    key={i}
                    className="relative group rounded-lg overflow-hidden shadow-sm border border-gray-200"
                  >
                    <img
                      src={src}
                      alt={`preview-${i}`}
                      className="w-full h-32 object-cover group-hover:scale-[1.03] transition-transform"
                    />
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setFiles((prev) => prev.filter((_, idx) => idx !== i));
                        setFilePreviews((prev) =>
                          prev.filter((_, idx) => idx !== i)
                        );
                      }}
                      className="absolute top-1 right-1 bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition"
                      title="Remove image"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 rounded-xl text-white font-semibold text-lg shadow-md bg-blue-600 hover:bg-blue-700 transition-all disabled:opacity-60"
        >
          {loading
            ? mode === "edit"
              ? "Updating..."
              : "Adding..."
            : mode === "edit"
            ? "Save Changes"
            : "Add Product"}
        </button>
      </form>
    </div>
  );
}
