import { useState } from "react";
import CartItemsList from "./components/CartItemList";
import OrderSummary from "./components/OrderSummary";
import type { CartItem } from "./components/CartItemList";
import { initialItems } from "../../../data/initialItems";


export default function CartPage() {
  const [items, setItems] = useState<CartItem[]>(initialItems);

  const updateQty = (id: number, qty: number) => {
    setItems(items.map((i) => (i.id === id ? { ...i, qty: Math.max(1, qty) } : i)));
  };

  const removeItem = (id: number) => {
    setItems(items.filter((i) => i.id !== id));
  };

  const subtotal = items.reduce((sum, i) => sum + i.price * i.qty, 0);
  const shipping = 0;
  const tax = subtotal * 0.08;
  const total = subtotal + shipping + tax;

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <h1 className="text-2xl font-bold mb-8">Your Shopping Cart</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
        <section className="lg:col-span-2">
          <CartItemsList items={items} onUpdateQty={updateQty} onRemove={removeItem} />
        </section>

        <OrderSummary
          subtotal={subtotal}
          shipping={shipping}
          tax={tax}
          total={total}
          onCheckout={() => alert("Proceed to Checkout")}
          onContinue={() => alert("Continue Shopping")}
        />
      </div>
    </div>
  );
}
