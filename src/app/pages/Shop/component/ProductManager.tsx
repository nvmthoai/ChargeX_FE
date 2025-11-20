import { useState } from "react";
import { Plus, X } from "lucide-react";
import AddProduct from "../product/AddProduct";
import AllProduct from "../product/AllProduct";
import { addressApi } from "../../../../api/address/api";

export default function ProductManager() {
  const [showAddModal, setShowAddModal] = useState(false);
  const [checkingAddress, setCheckingAddress] = useState(false);

  const handleOpenAdd = async () => {
    if (checkingAddress) return;
    setCheckingAddress(true);

    try {
      const localUser = JSON.parse(localStorage.getItem("user") || "{}");
      const userId = localUser?.sub;

      if (!userId) {
        alert("❌ Không lấy được thông tin người dùng. Vui lòng đăng nhập lại.");
        setCheckingAddress(false);
        return;
      }

      const addressRes = await addressApi.getMyAddress(userId);
      const addressList =
        Array.isArray(addressRes)
          ? addressRes
          : Array.isArray(addressRes?.data)
          ? addressRes.data
          : [];

      if (!addressList || addressList.length === 0) {
        alert("❗ Bạn chưa có địa chỉ nào. Hãy thêm địa chỉ trước khi đăng sản phẩm!");
        setCheckingAddress(false);
        return;
      }

      // Có address rồi thì mở modal
      setShowAddModal(true);
    } catch (err) {
      console.error("❌ Lỗi kiểm tra địa chỉ:", err);
      alert("❌ Không kiểm tra được địa chỉ. Vui lòng thử lại sau.");
    } finally {
      setCheckingAddress(false);
    }
  };

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold text-gray-800">Quản lý sản phẩm</h2>
        <button
          onClick={handleOpenAdd}
          disabled={checkingAddress}
          className="flex items-center gap-2 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-5 py-2.5 rounded-xl shadow-md hover:shadow-lg transition-all disabled:opacity-60"
        >
          <Plus size={18} />
          <span>{checkingAddress ? "Đang kiểm tra..." : "Thêm sản phẩm"}</span>
        </button>
      </div>

      {/* Danh sách sản phẩm */}
      <div className="border border-dashed border-gray-300 rounded-xl p-8 bg-white text-gray-500 text-center shadow-sm">
        <AllProduct />
      </div>

      {/* Popup overlay */}
      {showAddModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm bg-black/40 animate-fadeIn"
        >
          <div className="relative bg-white w-[900px] max-h-[90vh] rounded-3xl shadow-2xl overflow-hidden animate-slideUp">
            {/* Header */}
            <div className="flex justify-between items-center px-6 py-4 border-b border-gray-300">
              <h3 className="text-xl font-semibold text-gray-800">Thêm sản phẩm mới</h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-2 hover:bg-gray-100 rounded-full transition"
              >
                <X className="w-5 h-5 text-gray-600" />
              </button>
            </div>

            {/* Nội dung form */}
            <div className="p-6 overflow-y-auto max-h-[80vh]">
              <AddProduct onClose={() => setShowAddModal(false)} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}