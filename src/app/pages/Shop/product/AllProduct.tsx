import { useEffect, useRef, useState } from "react";
import { getMyProducts, getProductById, updateProduct } from "../../../../api/product/api";
import type { Product } from "../../../../api/product/type";
import { Check, ChevronDown, Gavel, MoreVertical, Pencil, Eye, X } from "lucide-react";
import ProductForm from "./ProductForm";
import { useNavigate } from "react-router-dom";
import AuctionRequestModal from "../component/AuctionRequestModal";
import useAuction from "../../../hooks/useAuction";
import FilterProduct from "./FilterProduct";

export default function ProductManagerTable() {
  const [products, setProducts] = useState<Product[]>([]);
  const [keyword, setKeyword] = useState(""); 
  const [status, setStatus] = useState<string | undefined>(undefined);
  const [sort, setSort] = useState<string | undefined>("newest"); // 🆕 sort FE
  const [appliedKeyword, setAppliedKeyword] = useState("");
  const [appliedStatus, setAppliedStatus] = useState<string | undefined>(undefined);
const [appliedSort, setAppliedSort] = useState<string | undefined>("newest");

  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const pageSize = 5;
  const [total, setTotal] = useState(0);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [showModal, setShowModal] = useState(false);
  const navigate = useNavigate();
  const [auctionModalOpen, setAuctionModalOpen] = useState(false);
  const { handleSendRequest } = useAuction();
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  const openAuctionModal = (product: Product) => {
    setSelectedProduct(product);
    setAuctionModalOpen(true);
  };

  // 🟩 Fetch danh sách
  // 🟩 Fetch danh sách
  const fetchProducts = async () => {
    setLoading(true);
    try {
      // 🧠 Luôn lấy toàn bộ sản phẩm (BE vẫn filter & search)
      const res = await getMyProducts(1, 9999, appliedKeyword, appliedStatus);
      const list = res?.data ?? [];

      // 🕒 FE sort toàn bộ danh sách
      if (sort === "newest") {
        list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      } else if (sort === "oldest") {
        list.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
      }

      // ✂️ FE tự phân trang
      const start = (page - 1) * pageSize;
      const end = start + pageSize;

      setProducts(list.slice(start, end));
      setTotal(list.length);
    } catch (err) {
      console.error("❌ Lỗi tải sản phẩm:", err);
    } finally {
      setLoading(false);
    }
  };


  // 🔁 Tự fetch khi page, keyword, status, sort đổi
  useEffect(() => {
    fetchProducts();
  }, [page, appliedKeyword, appliedStatus, appliedSort]);

  // 🟨 Đổi trạng thái
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
      <div className="bg-white rounded-xl border border-gray-100 overflow-visible">
        <FilterProduct
          keyword={keyword}
          onKeywordChange={setKeyword}
          status={status}
          onStatusChange={setStatus}
          sort={sort}
          onSortChange={(v) => setSort(v)}  // local state thôi, không fetch liền
          onSearch={() => {
            setAppliedKeyword(keyword.trim());
            setAppliedStatus(status);
            setAppliedSort(sort);
            setPage(1);
          }}
          onReset={() => {
            setKeyword("");
            setStatus(undefined);
            setSort("newest");
            setAppliedKeyword("");
            setAppliedStatus(undefined);
            setPage(1);
          }}
        />

        {/* 🧾 Bảng sản phẩm */}
        {loading ? (
          <div className="p-10 text-center text-gray-400 animate-pulse">
            Đang tải sản phẩm...
          </div>
        ) : products.length === 0 ? (
          <div className="p-12 text-center text-gray-500">
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
                <th className="px-5 py-3 w-20 text-center">⋮</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr
                  key={p.id}
                  className="border-b border-gray-200 last:border-none hover:bg-blue-50 transition text-center"
                >
                  <td className="px-5 py-3 text-center">
                    <img
                      src={p.imageUrls?.[0] || "/placeholder.png"}
                      alt={p.title}
                      className="w-14 h-14 object-cover rounded-md border"
                    />
                  </td>

                  <td className="px-5 py-3 text-gray-900 font-medium">{p.title}</td>

                  <td className="px-5 py-3">
                    {p.is_auction ? (
                      <span className="inline-flex items-center gap-1.5 bg-indigo-50 text-indigo-700 text-xs font-medium px-3 py-1.5 rounded-full border border-indigo-200">
                        <Gavel size={12} /> Đấu giá
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 bg-gray-50 text-gray-600 text-xs font-medium px-3 py-1.5 rounded-full border border-gray-200">
                        Bán thường
                      </span>
                    )}
                  </td>

                  <td className="px-5 py-3 text-right text-gray-900 font-semibold">
                   ${(Number(p.price_buy_now)).toLocaleString()}
                  </td>

                  <td className="px-5 py-3 relative" onClick={(e) => e.stopPropagation()}>
                    <StatusBadge
                      value={(p.status as any) ?? "draft"}
                      isOpen={openDropdown === p.id}
                      onToggle={() =>
                        setOpenDropdown(openDropdown === p.id ? null : p.id)
                      }
                      onSelect={(s) => handleChangeStatus(p.id, s)}
                    />
                  </td>

                  <td className="px-5 py-3 text-gray-500">
                    {p.createdAt
                      ? new Date(p.createdAt).toLocaleDateString("vi-VN")
                      : "-"}
                  </td>

                  <td className="px-5 py-3 text-center">
                    <ActionMenu
                      showAuction={!p.is_auction}
                      onAuction={() => openAuctionModal(p)}
                      onView={() => navigate(`/shop/productdetail/${p.id}`)}
                      onEdit={() => handleOpenEdit(p.id)}
                    />
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
              <span key={i} className="px-2 text-gray-500">
                …
              </span>
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

      {/* 🟢 Modal edit giữ nguyên */}
      {showModal && editingProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm bg-black/40 animate-fadeIn">
          <div className="relative bg-white w-[900px] max-h-[90vh] rounded-3xl shadow-2xl overflow-hidden animate-slideUp">
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

      {selectedProduct && (
        <AuctionRequestModal
          open={auctionModalOpen}
          productId={selectedProduct.id}
          productTitle={selectedProduct.title}
          onClose={() => {
            setAuctionModalOpen(false);
            setSelectedProduct(null);
          }}
          onSubmit={handleSendRequest}
        />
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
    <div className="relative inline-block" onClick={(e) => e.stopPropagation()}>
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onToggle?.();
        }}
        className={`inline-flex cursor-pointer items-center gap-2 rounded-full px-3 py-1.5 text-sm transition-colors ${s.wrap}`}
      >
        <span className={`h-2 w-2 rounded-full ${s.dot}`} />
        {s.text}
        <ChevronDown className="h-4 w-4 opacity-70" />
      </button>

      {isOpen && (
        <div
          className="absolute z-20 mt-2 w-32 rounded-lg border border-gray-100 bg-white shadow-md"
          onClick={(e) => e.stopPropagation()}
        >
          {statuses.map((st) => (
            <button
              key={st}
              onClick={(e) => {
                e.stopPropagation();
                onSelect?.(st);
              }}
              className={`flex w-full cursor-pointer items-center gap-2 px-3 py-2 text-sm hover:bg-gray-50 ${st === value ? "text-blue-600 font-medium" : "text-gray-700"
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

/* ---------------- ActionMenu ---------------- */
function ActionMenu({
  onView,
  onEdit,
  onAuction,
  showAuction,
}: {
  onView: () => void;
  onEdit: () => void;
  onAuction?: () => void;
  showAuction?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("click", handler);
    return () => document.removeEventListener("click", handler);
  }, []);

  return (
    <div ref={ref} className="relative inline-block text-left">
      <button
        onClick={(e) => {
          e.stopPropagation();
          setOpen(!open);
        }}
        className="p-2 rounded-full hover:bg-gray-100 transition"
      >
        <MoreVertical className="w-5 h-5 text-gray-600" />
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-36 origin-top-right rounded-lg border border-gray-100 bg-white shadow-lg z-20 animate-scaleIn">
          {showAuction && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onAuction?.();
                setOpen(false);
              }}
              className="w-full flex items-center gap-2 px-3 py-2 hover:bg-gray-50 text-sm text-orange-600"
            >
              <Gavel size={14} /> Đấu giá
            </button>
          )}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onView();
              setOpen(false);
            }}
            className="w-full flex items-center gap-2 px-3 py-2 hover:bg-gray-50 text-sm text-gray-700"
          >
            <Eye size={14} /> Xem
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onEdit();
              setOpen(false);
            }}
            className="w-full flex items-center gap-2 px-3 py-2 hover:bg-gray-50 text-sm text-indigo-600"
          >
            <Pencil size={14} /> Sửa
          </button>
        </div>
      )}
    </div>
  );
}
