import { useState, useEffect } from "react";
import CartItemsList from "./components/CartItemList";
import OrderSummary from "./components/OrderSummary";
import { fetchData, getQueryString } from "../../../mocks/CallingAPI";
// import type { CartItem } from "./components/CartItemList";
// import { initialItems } from "../../../data/initialItems";


export default function CartPage() {
  const [items, setItems] = useState<Record<string, any>[]>([]);
  const [selectedItems, setSelectedItems] = useState<Record<string, any>[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('token') || '';
    const fetchDataAPI = async () => {
      try {
        const ItemsResponse = await fetchData(`/orders${getQueryString({ page: 1, limit: 1000 })}`, token);
        console.log('ItemsResponse', ItemsResponse.data.data);

        setItems(ItemsResponse.data.data);
      } catch (error) {
        setError('Error');
      } finally {
        setLoading(false);
      }
    };

    fetchDataAPI();
  }, []);

  // const updateQty = (id: number, qty: number) => {
  //   setItems(items.map((i: any) => (i.id === id ? { ...i, qty: Math.max(1, qty) } : i)));
  // };

  const removeItem = (id: number) => {
    setItems(items.filter((i: any) => i.id !== id));
  };

  const handleCheckboxChange = (id: any) => {
    setSelectedItems((prev) => {
      if (prev.includes(id)) {
        return prev.filter((itemId: any) => itemId !== id);
      } else {
        return [...prev, id];
      }
    });
  };

  const showSelectedItems = () => {
    console.log('selectedItems', selectedItems);
    alert(selectedItems);
  }

  const filteredItems = items.filter(item => selectedItems.includes(item.orderId));
  const subtotal = filteredItems.reduce((sum: any, i: any) => sum + (i.orderShops?.[0]?.orderDetails?.[0]?.price || 0) * i.orderShops?.[0]?.orderDetails?.[0]?.quantity, 0);
  const shipping = filteredItems.reduce((sum: any, i: any) => sum + parseInt(i.orderShops?.[0]?.shippingFee || 0), 0);
  const tax = subtotal * 0.08;
  const total = subtotal + shipping + tax;

  if (error) return <div><button onClick={() => setError('')}>Error</button></div>
  if (loading) return <div><button onClick={() => setLoading(false)}>Loading</button></div>
  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <h1 className="text-center text-2xl font-bold mb-8">Your Shopping Cart</h1>
      <button onClick={() => showSelectedItems()}>SHOW</button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
        <section className="lg:col-span-2">
          <CartItemsList items={items} selectedItems={selectedItems} onRemove={removeItem} onCheck={handleCheckboxChange} />
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
