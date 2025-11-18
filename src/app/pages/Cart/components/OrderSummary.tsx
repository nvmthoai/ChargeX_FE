import { Link } from "react-router-dom";
import { ShoppingBag, ArrowRight } from "lucide-react";

interface OrderSummaryProps {
  selectedItems: any,
  subtotal: number;
  shipping: number;
  tax: number;
  total: number;
}

export default function OrderSummary({
  selectedItems,
  subtotal,
  shipping,
  tax,
  total,
}: OrderSummaryProps) {
  return (
    <aside className="bg-white/90 backdrop-blur-sm rounded-2xl border border-ocean-200/50 p-6 shadow-xl h-fit sticky top-24">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-gradient-to-r from-ocean-500 to-energy-500 rounded-lg">
          <ShoppingBag className="w-5 h-5 text-white" />
        </div>
        <h2 className="text-xl font-bold text-dark-900">Order Summary</h2>
      </div>

      {/* <div className="space-y-3 mb-6">
        <div className="flex justify-between items-center py-2">
          <span className="text-dark-800 font-medium">Subtotal</span>
          <span className="font-semibold text-dark-900">{Number(subtotal).toLocaleString()} VND</span>
        </div>
        <div className="flex justify-between items-center py-2">
          <span className="text-dark-600">Shipping</span>
          <span className="font-semibold text-dark-900">{Number(shipping).toLocaleString()} VND</span>
        </div>
        <div className="flex justify-between items-center py-2">
          <span className="text-dark-600">Tax (estimated)</span>
          <span className="font-semibold text-dark-900">{Number(tax).toLocaleString()} VND</span>
        </div>
      </div> */}

      <div className="border-t border-ocean-200 pt-4 mb-6">
        <div className="flex justify-between items-center">
          <span className="text-lg font-bold text-dark-900">Order Total</span>
          <span className="text-2xl font-bold bg-gradient-to-r from-ocean-600 to-energy-600 bg-clip-text text-transparent">
            {Number(total).toLocaleString()} VND
          </span>
        </div>
      </div>

      <div className="space-y-3">
        <Link 
          to={selectedItems.length > 0 ? '/checkout-cart' : '#'} 
          state={selectedItems}
          className="block"
        >
          <button 
            disabled={selectedItems.length === 0}
            className="w-full py-3 px-4 bg-gradient-to-r from-ocean-500 to-ocean-600 hover:from-ocean-600 hover:to-ocean-700 text-white rounded-xl font-semibold shadow-lg shadow-ocean-500/30 hover:shadow-xl hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-2 cursor-pointer"
          >
            Proceed to Checkout
            <ArrowRight className="w-5 h-5" />
          </button>
        </Link>
        
        <Link to='/' className="block">
          <button className="w-full py-3 px-4 border-2 border-ocean-200 text-ocean-700 rounded-xl font-semibold hover:bg-ocean-50 hover:border-ocean-300 transition-all cursor-pointer">
            Continue Shopping
          </button>
        </Link>
      </div>

      {selectedItems.length === 0 && (
        <p className="mt-4 text-sm text-center text-dark-800 font-medium">
          Select items to proceed
        </p>
      )}
    </aside>
  );
}
