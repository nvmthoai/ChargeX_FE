import { useEffect, useState } from "react";
import { Eye } from "lucide-react";
import { getAllOrders } from "../../../../api/order/api";
import type { Order, OrderStatus } from "../../../../api/order/type";
import { useNavigate } from "react-router-dom";
import FilterProduct from "../product/FilterProduct";

export default function AllOrder() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const pageSize = 5;
  const navigate = useNavigate();

  const [keyword, setKeyword] = useState("");
  const [status, setStatus] = useState<string | undefined>(undefined);
  const [sort, setSort] = useState<string | undefined>("newest");

  const [appliedKeyword, setAppliedKeyword] = useState("");
  const [appliedStatus, setAppliedStatus] = useState<string | undefined>(undefined);
  const [appliedSort, setAppliedSort] = useState<string | undefined>("newest");

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const storedUser = localStorage.getItem("user");
      if (!storedUser) return;

      const user = JSON.parse(storedUser);
      const currentUserId = user?.sub;

      const res = await getAllOrders({
        sellerId: currentUserId,
        search: appliedKeyword,
        status: appliedStatus,
        excludeStatuses: "pending",
        page,
        limit: pageSize,
        sortBy: "createdAt",
        sortOrder: appliedSort === "newest" ? "DESC" : "ASC",
      });

      console.log("✅ Fetched orders:", res);

      const paginated = res.data;

      setOrders(paginated.data);
      setTotal(paginated.total);
    } catch (err) {
      console.error("❌ Failed to load orders:", err);
    } finally {
      setLoading(false);
    }
  };


  useEffect(() => {
    fetchOrders();
  }, [page, appliedKeyword, appliedStatus, appliedSort]);

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
      <div className="bg-white rounded-xl border border-gray-100 overflow-visible">
        {/* 🔍 Filter */}
        <FilterProduct
          keyword={keyword}
          onKeywordChange={setKeyword}
          status={status}
          onStatusChange={(v) => setStatus(v as OrderStatus)}
          sort={sort}
          onSortChange={setSort}
          onSearch={() => {
            setAppliedKeyword(keyword.trim());
            setAppliedStatus(status as OrderStatus);
            setAppliedSort(sort);
            setPage(1);
          }}
          onReset={() => {
            setKeyword("");
            setStatus(undefined);
            setSort(undefined);
            setAppliedKeyword("");
            setAppliedStatus(undefined);
            setAppliedSort(undefined);
            setPage(1);
          }}
          statusOptions={[
            { label: "Pending", value: "pending" },
            { label: "Paid", value: "paid" },
            { label: "In Transit", value: "in_transit" },
            { label: "Delivered", value: "delivered" },
            { label: "Completed", value: "completed" },
            { label: "Cancelled", value: "cancelled" },
          ]}
        />

        {/* Table */}
        {loading ? (
          <div className="p-10 text-center text-gray-400 animate-pulse">
            Loading orders...
          </div>
        ) : orders.length === 0 ? (
          <div className="p-12 text-center text-gray-500">
            <p>No orders found.</p>
          </div>
        ) : (
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50 text-gray-600 font-semibold text-[14px] border-b border-gray-300">
              <tr>
                <th className="px-5 py-3 text-left">Product</th>
                <th className="px-5 py-3 text-right w-32">Price</th>
                <th className="px-5 py-3 w-40">Status</th>
                <th className="px-5 py-3 w-36">Created</th>
                <th className="px-5 py-3 w-16 text-center">⋮</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((o) => {
                const product = o.orderShops?.[0]?.orderDetails?.[0]?.product;

                return (
                  <tr
                    key={o.orderId}
                    className="border-b border-gray-200 last:border-none hover:bg-blue-50 transition"
                  >
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <img
                          src={product?.imageUrls?.[0] || "/placeholder.png"}
                          alt={product?.title}
                          className="w-12 h-12 rounded-md object-cover border"
                        />
                        <div>
                          <p className="font-medium text-gray-800">
                            {product?.title || "Untitled"}
                          </p>
                          <p className="text-sm text-gray-500">
                            Buyer: {o.buyer?.fullName || "Unknown"}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="px-5 py-3 text-right font-semibold">
                      {Number(o.totalPrice)?.toLocaleString()} VND
                    </td>

                    <td className="px-5 py-3">
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
            ← Prev
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
            Next →
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
  pending: {
    text: "Pending",
    color: "bg-gray-50 text-gray-700 border-gray-200",
    dot: "bg-gray-400",
  },
  paid: {
    text: "Paid",
    color: "bg-green-50 text-green-700 border-green-200",
    dot: "bg-green-500",
  },
  handed_to_carrier: {
    text: "Handed to Carrier",
    color: "bg-cyan-50 text-cyan-700 border-cyan-200",
    dot: "bg-cyan-500",
  },
  in_transit: {
    text: "In Transit",
    color: "bg-blue-50 text-blue-700 border-blue-200",
    dot: "bg-blue-500",
  },
  delivered_pending_confirm: {
    text: "Awaiting Confirmation",
    color: "bg-purple-50 text-purple-700 border-purple-200",
    dot: "bg-purple-500",
  },
  delivered: {
    text: "Delivered",
    color: "bg-emerald-50 text-emerald-700 border-emerald-200",
    dot: "bg-emerald-500",
  },
  refunded: {
    text: "Refunded",
    color: "bg-red-50 text-red-700 border-red-200",
    dot: "bg-red-500",
  },
  completed: {
    text: "Completed",
    color: "bg-blue-50 text-blue-700 border-blue-200",
    dot: "bg-blue-500",
  },
  disputed: {
    text: "Disputed",
    color: "bg-orange-50 text-orange-700 border-orange-200",
    dot: "bg-orange-500",
  },
  cancelled: {
    text: "Cancelled",
    color: "bg-gray-100 text-gray-500 border-gray-200",
    dot: "bg-gray-300",
  },
};

function OrderStatusBadge({ value }: { value: string }) {
  const key = value?.toLowerCase() as keyof typeof statusMap;
  const s = statusMap[key];

  if (!s) {
    return (
      <div className="inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-sm border bg-gray-100 text-gray-500 border-gray-200">
        <span className="h-2 w-2 rounded-full bg-gray-300" />
        {value || "Unknown"}
      </div>
    );
  }

  return (
    <div
      className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-sm border ${s.color}`}
    >
      <span className={`h-2 w-2 rounded-full ${s.dot}`} />
      {s.text}
    </div>
  );
}
