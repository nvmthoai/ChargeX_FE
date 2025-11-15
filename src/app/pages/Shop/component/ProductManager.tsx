import { useState } from "react";
import { Plus, X } from "lucide-react";
import AddProduct from "../product/AddProduct";
import AllProduct from "../product/AllProduct";

export default function ProductManager() {
  const [showAddModal, setShowAddModal] = useState(false);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <div>
            <h2 className="text-2xl font-bold text-dark-100 mb-2">Product Management</h2>
            <p className="text-dark-300">Manage your products and view product listings</p>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 bg-gradient-to-r from-ocean-500 to-energy-500 hover:from-ocean-600 hover:to-energy-600 text-white px-5 py-2.5 rounded-xl shadow-md hover:shadow-lg transition-all font-semibold"
          >
            <Plus size={18} />
            <span>Add Product</span>
          </button>
        </div>
      </div>

      {/* Danh sách sản phẩm */}
      <AllProduct />

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