import { Trash2 } from "lucide-react";

// export interface CartItem {
//   id: number;
//   title: string;
//   specs: string;
//   price: number;
//   qty: number;
//   image: string;
// }

interface CartItemsListProps {
  items: any;
  selectedItems: any;
  // onUpdateQty: (id: number, qty: number) => void;
  onRemove: (id: number) => void;
  onCheck: (id: any) => void;
}

export default function CartItemsList({
  items,
  selectedItems,
  // onUpdateQty,
  onRemove,
  onCheck,
}: CartItemsListProps) {
  return (
    <section className="space-y-4">
      {items.map((item: any) => (
        <div
          key={item.orderId}
          className="flex items-center justify-between bg-white border border-gray-200 rounded-lg p-4 gap-4"
        >

          {/* Info */}
          <div className="flex items-center gap-4">
            <input
              type="checkbox"
              checked={selectedItems.includes(item.orderId)}
              onChange={() => onCheck(item.orderId)}
              className="cursor-pointer"
            />
            <img
              src={item.orderShops?.[0]?.orderDetails?.[0]?.product?.imageUrls?.[0] || null}
              alt={item.orderShops?.[0]?.orderDetails?.[0]?.product?.title}
              className="w-20 h-20 object-cover rounded-md"
            />
            <div>
              <h3 className="font-semibold">{item.orderShops?.[0]?.orderDetails?.[0]?.product?.title}</h3>
              <p className="text-sm text-gray-500">{item.orderShops?.[0]?.orderDetails?.[0]?.product?.description}</p>
              <p className="mt-1 font-semibold">${item.orderShops?.[0]?.orderDetails?.[0]?.price}</p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-4">
            {/* Quantity Selector */}
            <div className="flex items-center justify-center gap-2">
              {/* Nút giảm */}
              {/* <button
                disabled={item.qty <= 1}
                className={`w-9 h-9 flex items-center justify-center border border-gray-300 rounded-md text-lg font-medium 
                  ${
                    item.qty <= 1
                      ? "text-gray-300 cursor-not-allowed bg-gray-50"
                      : "hover:bg-gray-100 text-gray-700"
                  } 
                  focus:outline-none transition-colors duration-150`}
                onClick={() => onUpdateQty(item.id, item.qty - 1)}
              >
                −
              </button> */}

              {/* Ô số lượng */}
              <input
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                value={item.orderShops?.[0]?.orderDetails?.[0]?.quantity}
                // onChange={(e) =>
                //   onUpdateQty(item.id, parseInt(e.target.value) || 1)
                // }
                className="w-12 h-9 text-center border border-gray-300 rounded-md focus:outline-none text-base font-medium leading-none flex items-center justify-center"
                disabled
              />

              {/* Nút tăng */}
              {/* <button
                className="w-9 h-9 flex items-center justify-center border border-gray-300 rounded-md text-lg font-medium text-gray-700 hover:bg-gray-100 focus:outline-none transition-colors duration-150"
                onClick={() => onUpdateQty(item.id, item.qty + 1)}
              >
                +
              </button> */}
            </div>

            {/* Remove */}
            <button
              className="text-red-500 hover:text-red-700"
              onClick={() => onRemove(item.orderId)}
            >
              <Trash2 strokeWidth={1.5} size="20" />
            </button>
          </div>
        </div>
      ))}
    </section>
  );
}
