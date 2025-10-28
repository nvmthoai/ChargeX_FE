import { useEffect, useState } from "react";
import { getMyProducts, getProductById, updateProduct } from "../../../../api/product/api";
import type { Product } from "../../../../api/product/type";
import { Pencil,ChevronDown, Check, X } from "lucide-react";
import ProductForm from "./ProductForm";
import { useNavigate } from "react-router-dom";

export default function ProductManagerTable() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const pageSize = 5;
  const [total, setTotal] = useState(0);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null); // 🟢 dữ liệu sản phẩm đang edit
  const [showModal, setShowModal] = useState(false); // 🟢 mở modal edit
  const navigate = useNavigate();

  // 🟩 Fetch danh sách
  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await getMyProducts(page, pageSize);
      setProducts(res?.data ?? []);
      setTotal(res?.total ?? 0);
    } catch (err) {
      console.error("Lỗi tải sản phẩm:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [page]);

  // 🟨 Gọi API đổi trạng thái
  const handleChangeStatus = async (productId: string, newStatus: Status) => {
    try {
      const formData = new FormData();
      formData.append("status", newStatus);
      await updateProduct(productId, formData);
      setOpenDropdown(null);
      fetchProducts();
    } catch (err) {
      console.error("Lỗi khi cập nhật trạng thái:", err);
    }
  };

  // 🟦 Mở modal edit
  const handleOpenEdit = async (productId: string) => {
    try {
      const data = await getProductById(productId);
      setEditingProduct(data);
      setShowModal(true);
    } catch (err) {
      console.error("Lỗi load sản phẩm:", err);
    }
  };

  // 🟧 Submit cập nhật
  const handleUpdateProduct = async (formData: FormData) => {
    if (!editingProduct) return;
    try {
      await updateProduct(editingProduct.id, formData);
      alert("✅ Cập nhật sản phẩm thành công!");
      setShowModal(false);
      fetchProducts();
    } catch (err) {
      console.error(err);
      alert("❌ Lỗi khi cập nhật sản phẩm!");
    }
  };

  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  const getPageList = () => {
    const pages: (number | string)[] = [];
    const add = (p: number | string) => pages.push(p);
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) add(i);
      return pages;
    }
    add(1);
    if (page > 3) add("…");
    const start = Math.max(2, page - 1);
    const end = Math.min(totalPages - 1, page + 1);
    for (let i = start; i <= end; i++) add(i);
    if (page < totalPages - 2) add("…");
    add(totalPages);
    return pages;
  };

  return (
    <div className="p-6 space-y-6 relative">

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-100 overflow-visible">
        {loading ? (
          <div className="p-10 text-center text-gray-400 animate-pulse">Đang tải sản phẩm...</div>
        ) : products.length === 0 ? (
          <div className="p-12 text-center text-gray-500">
            <img src="/empty-box.png" alt="empty" className="w-20 h-20 mx-auto mb-3 opacity-70" />
            <p>Chưa có sản phẩm nào được đăng.</p>
          </div>
        ) : (
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50 text-gray-600 text-center font-semibold text-[14px] border-b border-gray-400">
              <tr>
                <th className="px-5 py-3 w-20">Ảnh</th>
                <th className="px-5 py-3">Tên sản phẩm</th>
                <th className="px-5 py-3">Đấu giá</th>
                <th className="px-5 py-3 w-28 text-right">Giá bán</th>
                <th className="px-5 py-3 w-40">Tình trạng</th>
                <th className="px-5 py-3 w-36">Ngày tạo</th>
                <th className="px-5 py-3 w-40 text-center">Thao tác</th>
              </tr>
            </thead>
            <tbody>

              {products.map((p) => (
                
                <tr key={p.id}
                onClick={() => navigate(`/shop/productdetail/${p.id}`)}
                 className="border-b border-gray-200 last:border-none hover:bg-blue-100 transition cursor-pointer text-center">
                  <td className="px-5 py-3 text-center">
                    <img
                      src={p.imageUrls?.[0] || "/placeholder.png"}
                      alt={p.title}
                      className="w-14 h-14 object-cover rounded-md border"
                    />
                  </td>
                  <td className="px-5 py-3">
                    <div className="font-medium text-gray-900">{p.title}</div>
                  </td>
                  <td className="px-5 py-3">
                    {p.is_auction ? (
                      <span className="inline-flex items-center gap-1.5 bg-indigo-50 text-indigo-700 text-xs font-medium px-3 py-1.5 rounded-full border border-indigo-200">
                        <svg className="w-3.5 h-3.5 fill-indigo-500" viewBox="0 0 24 24">
                          <path d="M4 21h16v-2H4v2zm15.9-11.6-1.4-1.4-4.1 4.1-4.4-4.4L8.6 9l4.4 4.4-4.1 4.1 1.4 1.4 4.1-4.1L18 18l1.4-1.4-4.1-4.1 4.6-4.1z" />
                        </svg>
                        Đấu giá
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 bg-gray-50 text-gray-600 text-xs font-medium px-3 py-1.5 rounded-full border border-gray-200">
                        <svg className="w-3.5 h-3.5 fill-gray-400" viewBox="0 0 24 24">
                          <path d="M18 4H6v16h12V4zm0-2c1.1 0 2 .9 2 2v16a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V4c0-1.1.9-2 2-2h12z" />
                        </svg>
                        Bán thường
                      </span>
                    )}
                  </td>

                  <td className="px-5 py-3 text-right text-gray-900 font-semibold">
                    {Number(p.price_buy_now).toLocaleString("vi-VN")}₫
                  </td>

                  <td className="px-5 py-3 relative">
                    <StatusBadge
                      value={(p.status as any) ?? "draft"}
                      isOpen={openDropdown === p.id}
                      onToggle={() => setOpenDropdown(openDropdown === p.id ? null : p.id)}
                      onSelect={(s) => handleChangeStatus(p.id, s)}
                    />
                  </td>

                  <td className="px-5 py-3 text-gray-500">
                    {p.createdAt ? new Date(p.createdAt).toLocaleDateString("vi-VN") : "-"}
                  </td>

                  <td className="px-5 py-3">
                    <div className="flex justify-center gap-2">
                      <button
                        className="inline-flex items-center cursor-pointer gap-2 rounded-lg border border-indigo-200 bg-indigo-50 px-3 py-1.5 text-indigo-700 hover:bg-indigo-100"
                        onClick={() => handleOpenEdit(p.id)}
                      >
                        <Pencil className="h-4 w-4" />
                        <span className="hidden sm:inline">Edit</span>
                      </button>
                      
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-end items-center gap-1 mt-4">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-3 py-2 border border-gray-300 rounded-md text-sm hover:bg-gray-50 disabled:opacity-40"
          >
            ← Trước
          </button>
          {getPageList().map((p, i) =>
            typeof p === "number" ? (
              <button
                key={i}
                onClick={() => setPage(p)}
                className={`px-3 py-2 border border-gray-400 rounded-md text-sm ${page === p
                  ? "bg-blue-600 text-white border-blue-600"
                  : "hover:bg-gray-50"
                  }`}
              >
                {p}
              </button>
            ) : (
              <span key={i} className="px-2 text-gray-500">…</span>
            )
          )}
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="px-3 py-2 border border-gray-300 rounded-md text-sm hover:bg-gray-50 disabled:opacity-40"
          >
            Sau →
          </button>
        </div>
      )}

      {/* 🟢 Modal edit */}
      {/* 🟢 Popup Edit Product */}
      {showModal && editingProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm bg-black/40 animate-fadeIn">
          <div className="relative bg-white w-[900px] max-h-[90vh] rounded-3xl shadow-2xl overflow-hidden animate-slideUp">
            {/* Header */}
            <div className="flex justify-between items-center px-6 py-4 border-b border-gray-300">
              <h3 className="text-xl font-semibold text-gray-800">
                Chỉnh sửa sản phẩm
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="p-2 hover:bg-gray-100 rounded-full transition"
              >
                <X className="w-5 h-5 text-gray-600" />
              </button>
            </div>

            {/* Nội dung form */}
            <div className="p-6 overflow-y-auto max-h-[80vh]">
              <ProductForm
                mode="edit"
                initialData={editingProduct}
                onSubmit={handleUpdateProduct}
                loading={false}
              />
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

/* ---------------- UI helpers ---------------- */
type Status = "active" | "sold" | "ended" | "draft";

const statusStyle: Record<Status, { wrap: string; dot: string; text: string }> = {
  active: {
    wrap: "bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100",
    dot: "bg-emerald-500",
    text: "Active",
  },
  sold: {
    wrap: "bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100",
    dot: "bg-blue-500",
    text: "Sold",
  },
  ended: {
    wrap: "bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100",
    dot: "bg-rose-500",
    text: "Ended",
  },
  draft: {
    wrap: "bg-gray-50 text-gray-700 border border-gray-200 hover:bg-gray-100",
    dot: "bg-gray-400",
    text: "Draft",
  },
};

function StatusBadge({
  value,
  isOpen,
  onToggle,
  onSelect,
}: {
  value: Status;
  isOpen?: boolean;
  onToggle?: () => void;
  onSelect?: (s: Status) => void;
}) {
  const s = statusStyle[value];
  const statuses: Status[] = ["active", "sold", "ended", "draft"];

  return (
    <div className="relative inline-block">
      <button
        type="button"
        onClick={onToggle}
        className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-sm transition-colors ${s.wrap}`}
      >
        <span className={`h-2 w-2 rounded-full ${s.dot}`} />
        {s.text}
        <ChevronDown className="h-4 w-4 opacity-70" />
      </button>

      {isOpen && (
        <div className="absolute z-20 mt-2 w-32 rounded-lg border border-gray-100 bg-white shadow-md">
          {statuses.map((st) => (
            <button
              key={st}
              onClick={() => onSelect?.(st)}
              className={`flex w-full items-center gap-2 px-3 py-2 text-sm hover:bg-gray-50 ${st === value ? "text-blue-600 font-medium" : "text-gray-700"
                }`}
            >
              {st === value && <Check className="h-4 w-4" />}
              <span>{statusStyle[st].text}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
