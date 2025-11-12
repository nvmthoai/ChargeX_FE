import { useEffect, useState } from "react";
import { Eye} from "lucide-react";
import { getAllOrders } from "../../../../api/order/api";
import type { Order, OrderStatus } from "../../../../api/order/type";
import { useNavigate } from "react-router-dom";

export default function AllOrder() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const pageSize = 6;
  // const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const navigate = useNavigate();

const fetchOrders = async () => {
  setLoading(true);
  try {
    // ✅ Lấy thông tin user trong localStorage
    const storedUser = localStorage.getItem("user");
    if (!storedUser) {
      console.warn("⚠️ No current user found in localStorage");
      return;
    }

    // ✅ Parse object và lấy userId/sub
    const user = JSON.parse(storedUser);
    const currentUserId = user?.sub; // "28829ea8-896d-4cd8-ae51-014e158b1e68"

    // ✅ Gọi API lọc theo người bán
    const res = await getAllOrders({
      sellerId: currentUserId,
      page,
      limit: pageSize,
      sortBy: "createdAt",
      sortOrder: "DESC",
    });

    setOrders(res ?? []);
    setTotal(res?.length ?? 0);
  } catch (err) {
    console.error("❌ Lỗi tải đơn hàng:", err);
  } finally {
    setLoading(false);
  }
};


  useEffect(() => {
    fetchOrders();
  }, [page]);

  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  const getPageList = () => {
    const pages: (number | string)[] = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (page > 3) pages.push("…");
      const start = Math.max(2, page - 1);
      const end = Math.min(totalPages - 1, page + 1);
      for (let i = start; i <= end; i++) pages.push(i);
      if (page < totalPages - 2) pages.push("…");
      pages.push(totalPages);
    }
    return pages;
  };

  return (
    <div className="p-6 space-y-6 relative">
      <div className="bg-gradient-to-br from-white/95 via-ocean-50/20 to-energy-50/20 rounded-xl border border-ocean-200/30 overflow-visible">
        {loading ? (
          <div className="p-10 text-center text-gray-400 animate-pulse">
            Đang tải đơn hàng...
          </div>
        ) : orders.length === 0 ? (
          <div className="p-12 text-center text-gray-500">
            <p>Không có đơn hàng nào.</p>
          </div>
        ) : (
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50 text-gray-600 text-center font-semibold text-[14px] border-b border-gray-400">
              <tr>
                <th className="px-5 py-3 w-16">#</th>
                <th className="px-5 py-3">Người mua</th>
                <th className="px-5 py-3">Sản phẩm</th>
                <th className="px-5 py-3 w-28 text-right">Giá</th>
                <th className="px-5 py-3 w-40">Trạng thái</th>
                <th className="px-5 py-3 w-36">Ngày tạo</th>
                <th className="px-5 py-3 w-20 text-center">⋮</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((o, idx) => {
                // const seller = o.orderShops?.[0]?.seller;
                const product = o.orderShops?.[0]?.orderDetails?.[0]?.product;
                return (
                  <tr
                    key={o.orderId}
                    className="border-b border-gray-200 last:border-none hover:bg-blue-50 transition text-center"
                  >
                    <td className="px-5 py-3 font-medium text-gray-700">
                      {(page - 1) * pageSize + idx + 1}
                    </td>
                    <td className="px-5 py-3 text-gray-900">
                      {o.buyer?.fullName}
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex items-center justify-center gap-2">
                        <img
                          src={product?.imageUrls?.[0] || "/placeholder.png"}
                          alt={product?.title}
                          className="w-10 h-10 rounded-md object-cover border"
                        />
                        <span>{product?.title}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3 text-right font-semibold">
                      {o.totalPrice?.toLocaleString()}₫
                    </td>
                    <td className="px-5 py-3 relative">
                      <OrderStatusBadge value={o.status} />
                    </td>
                    <td className="px-5 py-3 text-gray-500">
                      {o.createdAt
                        ? new Date(o.createdAt).toLocaleDateString("vi-VN")
                        : "-"}
                    </td>
                    <td className="px-5 py-3 text-center">
                      <button
                        onClick={() => navigate(`/orders/${o.orderId}`)}
                        className="p-2 rounded-full hover:bg-gray-100 transition"
                      >
                        <Eye className="w-5 h-5 text-gray-600" />
                      </button>
                    </td>
                  </tr>
                );
              })}
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
                className={`px-3 py-2 border border-gray-400 rounded-md text-sm ${
                  page === p
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
    </div>
  );
}

/* ------------------ Status Badge ------------------ */
const statusMap: Record<
  OrderStatus,
  { text: string; color: string; dot: string }
> = {
  pending: { text: "Chờ xử lý", color: "bg-gray-50 text-gray-700 border-gray-200", dot: "bg-gray-400" },
  paid: { text: "Đã thanh toán", color: "bg-green-50 text-green-700 border-green-200", dot: "bg-green-500" },
  handed_to_carrier: { text: "Đã giao cho vận chuyển", color: "bg-cyan-50 text-cyan-700 border-cyan-200", dot: "bg-cyan-500" },
  in_transit: { text: "Đang giao", color: "bg-blue-50 text-blue-700 border-blue-200", dot: "bg-blue-500" },
  delivered_pending_confirm: { text: "Chờ xác nhận giao", color: "bg-purple-50 text-purple-700 border-purple-200", dot: "bg-purple-500" },
  delivered: { text: "Đã giao", color: "bg-emerald-50 text-emerald-700 border-emerald-200", dot: "bg-emerald-500" },
  refunded: { text: "Hoàn tiền", color: "bg-red-50 text-red-700 border-red-200", dot: "bg-red-500" },
  completed: { text: "Hoàn tất", color: "bg-blue-50 text-blue-700 border-blue-200", dot: "bg-blue-500" },
  disputed: { text: "Khiếu nại", color: "bg-orange-50 text-orange-700 border-orange-200", dot: "bg-orange-500" },
  cancelled: { text: "Đã hủy", color: "bg-gray-100 text-gray-500 border-gray-200", dot: "bg-gray-300" },
};

function OrderStatusBadge({ value }: { value: OrderStatus }) {
  const s = statusMap[value];
  return (
    <div
      className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-sm border ${s.color}`}
    >
      <span className={`h-2 w-2 rounded-full ${s.dot}`} />
      {s.text}
    </div>
  );
}
