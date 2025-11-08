import { Link } from "react-router-dom";

interface OrderSummaryProps {
  subtotal: number;
  shipping: number;
  tax: number;
  total: number;
  onCheckout?: () => void;
}

export default function OrderSummary({
  subtotal,
  shipping,
  tax,
  total,
  onCheckout,
}: OrderSummaryProps) {
  return (
    <aside className="bg-white border border-gray-200 rounded-lg p-6 h-fit sticky top-20 self-start">
      <h2 className="text-lg font-semibold mb-4">Order Summary</h2>

      <div className="flex justify-between mb-2">
        <span>Subtotal</span>
        <span>${subtotal.toFixed(2)}</span>
      </div>
      <div className="flex justify-between mb-2">
        <span>Shipping</span>
        <span>${shipping.toFixed(2)}</span>
      </div>
      <div className="flex justify-between mb-2">
        <span>Tax (estimated)</span>
        <span>${tax.toFixed(2)}</span>
      </div>

      <div className="flex justify-between font-bold text-lg border-t pt-3">
        <span>Order Total</span>
        <span>${total.toFixed(2)}</span>
      </div>

      {onCheckout && (
        <button
          onClick={onCheckout}
          className="mt-4 w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700"
        >
          Proceed to Checkout
        </button>
      )}
      <Link to='/'>
        <button className="mt-2 w-full border py-2 rounded-lg text-gray-600 hover:bg-gray-50" >
          Continue Shopping
        </button>
      </Link>
    </aside>
  );
}
