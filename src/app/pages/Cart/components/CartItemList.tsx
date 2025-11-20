import { Trash2 } from "lucide-react";

interface CartItemsListProps {
  items: any;
  selectedItems: any;
  onRemove: (id: number) => void;
  onCheck: (id: any) => void;
}

export default function CartItemsList({
  items,
  selectedItems,
  onRemove,
  onCheck,
}: CartItemsListProps) {
  return (
    <section className="space-y-4">
      {items.map((item: any, index: number) => (
        <div
          key={item.orderId}
          className="group bg-white/90 backdrop-blur-sm rounded-2xl border border-ocean-200/50 p-5 shadow-lg hover:shadow-xl transition-all duration-300 animate-fadeIn"
          style={{ animationDelay: `${index * 50}ms` }}
        >
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            {/* Checkbox & Image */}
            <div className="flex items-center gap-4 flex-1 w-full sm:w-auto cursor-pointer" onClick={() => onCheck(item.orderId)}>
              <input
                type="checkbox"
                checked={selectedItems.includes(item.orderId)}
                // onChange={() => onCheck(item.orderId)}
                onChange={() => { }}
                className="w-5 h-5 text-ocean-600 border-ocean-300 rounded cursor-pointer"
                style={{ outline: 'none' }}
              />
              <div className="relative w-24 h-24 rounded-xl overflow-hidden bg-gradient-to-br from-ocean-100 to-energy-100 flex-shrink-0">
                {item.orderShops?.[0]?.orderDetails?.[0]?.product?.imageUrls?.[0] ? (
                  <img
                    src={item.orderShops[0].orderDetails[0].product.imageUrls[0]}
                    alt={item.orderShops[0].orderDetails[0].product.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-ocean-300">
                    <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                )}
              </div>

              {/* Product Info */}
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-lg text-dark-900 line-clamp-2 group-hover:text-ocean-600 transition-colors">
                  {item.orderShops?.[0]?.orderDetails?.[0]?.product?.title || 'Product'}
                </h3>
                <p className="text-sm text-gray-500 line-clamp-2 mb-1 font-medium">
                  {item.orderShops?.[0]?.orderDetails?.[0]?.product?.description || 'No description'}
                </p>
                <h4 className="text-dark-900 line-clamp-2">
                  Seller: {item.orderShops?.[0]?.seller?.fullName || 'Unknown'}
                </h4>
                <div className="flex items-center gap-4">
                  <span className="text-lg font-bold bg-gradient-to-r from-ocean-600 to-energy-600 bg-clip-text text-transparent">
                    {Number(item.orderShops?.[0]?.orderDetails?.[0]?.price || 0).toLocaleString()} VND
                  </span>
                  <span className="text-sm text-dark-800 font-medium"
                    // style={{ backgroundColor: item.status == "PENDING" ? "#ffc107" : "#28a745" }}
                  >
                    Qty: {item.orderShops?.[0]?.orderDetails?.[0]?.quantity || 1}
                  </span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-4 sm:ml-auto">
              {/* Quantity Display */}
              <div className="flex items-center justify-center gap-2 px-3 py-2 bg-gradient-to-r from-ocean-50 to-energy-50 rounded-lg border border-ocean-200">
                <span className="text-sm font-semibold text-dark-900">
                  {item.orderShops?.[0]?.orderDetails?.[0]?.quantity || 1}
                </span>
              </div>

              {/* Remove Button */}
              <button
                className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-all hover:scale-110 cursor-pointer"
                onClick={() => onRemove(item.orderId)}
                title="Remove item"
              >
                <Trash2 strokeWidth={2} size={20} />
              </button>
            </div>
          </div>
        </div>
      ))}
    </section>
  );
}
