"use client";

import { useEffect, useState } from "react";
import { getMyProducts } from "../../../../api/product/api";
import type { Product } from "../../../../api/product/type";
import { Pencil, Trash2, Gavel } from "lucide-react";
import AuctionRequestModal from "./AuctionRequestModal";
import useAuction from "../../../hooks/useAuction";

export default function ProductManagerTable() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [auctionModalOpen, setAuctionModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const limit = 10;
  const { handleSendRequest } = useAuction();
  useEffect(() => {
    const fetchMyProducts = async () => {
      try {
        const res = await getMyProducts();
        setProducts(res.data || res);
        setTotal(res.total || res.data?.length || 0);
      } catch (err) {
        console.error("Lỗi tải sản phẩm của tôi:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchMyProducts();
  }, [page]);

  const openAuctionModal = (product: Product) => {
    setSelectedProduct(product);
    setAuctionModalOpen(true);
  };

  if (loading)
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <p className="text-gray-500 animate-pulse">Đang tải sản phẩm...</p>
      </div>
    );

  return (
    <div>
      {/* Table */}
      <div className="bg-white rounded-xl shadow overflow-hidden">
        <table className="w-full text-sm text-left border-collapse">
          <thead className="bg-gray-100 text-gray-700 font-semibold text-[15px]">
            <tr>
              <th className="px-5 py-3 w-16">#</th>
              <th className="px-5 py-3 w-24">Ảnh</th>
              <th className="px-5 py-3">Tên sản phẩm</th>
              <th className="px-5 py-3 w-28">Giá bán</th>
              <th className="px-5 py-3 w-24">Tình trạng</th>
              <th className="px-5 py-3 w-32">Ngày tạo</th>
              <th className="px-5 py-3 w-40 text-center">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {products.map((p, idx) => (
              <tr
                key={p.id}
                className="border-t hover:bg-gray-50 transition-all"
              >
                <td className="px-5 py-3 text-gray-500">{idx + 1}</td>
                <td className="px-5 py-3">
                  <img
                    src={p.imageUrls?.[0] || "/placeholder.png"}
                    alt={p.title}
                    className="w-14 h-14 object-cover rounded-md border"
                  />
                </td>
                <td className="px-5 py-3 font-medium text-gray-800">
                  {p.title}
                </td>
                <td className="px-5 py-3 text-blue-600 font-semibold">
                  {Number(p.price_buy_now).toLocaleString("vi-VN")}₫
                </td>
                <td className="px-5 py-3">
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${
                      p.status === "active"
                        ? "bg-green-100 text-green-700"
                        : p.status === "sold"
                        ? "bg-gray-200 text-gray-600"
                        : "bg-yellow-100 text-yellow-700"
                    }`}
                  >
                    {p.status.toUpperCase()}
                  </span>
                </td>
                <td className="px-5 py-3 text-gray-500">
                  {new Date(p.createdAt).toLocaleDateString("vi-VN")}
                </td>
                <td className="px-5 py-3 text-center">
                  {!p.is_auction && (
                    <button
                      onClick={() => openAuctionModal(p)}
                      className="inline-flex items-center gap-1 text-orange-600 hover:text-orange-800 mx-1"
                      title="Request Auction"
                    >
                      <Gavel size={16} />
                      Auction
                    </button>
                  )}
                  <button
                    onClick={() => alert(`Sửa ${p.title}`)}
                    className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 mx-1"
                  >
                    <Pencil size={16} />
                    Sửa
                  </button>
                  <button
                    onClick={() => alert(`Xóa ${p.title}`)}
                    className="inline-flex items-center gap-1 text-red-500 hover:text-red-700 mx-1"
                  >
                    <Trash2 size={16} />
                    Xóa
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex justify-end items-center mt-6">
        <button
          disabled={page === 1}
          onClick={() => setPage(page - 1)}
          className="px-4 py-2 border rounded-l-lg text-sm hover:bg-gray-100 disabled:opacity-50"
        >
          ← Trước
        </button>
        <span className="px-4 py-2 border-t border-b text-sm bg-gray-50">
          Trang {page}
        </span>
        <button
          disabled={page * limit >= total}
          onClick={() => setPage(page + 1)}
          className="px-4 py-2 border rounded-r-lg text-sm hover:bg-gray-100 disabled:opacity-50"
        >
          Sau →
        </button>
      </div>

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
