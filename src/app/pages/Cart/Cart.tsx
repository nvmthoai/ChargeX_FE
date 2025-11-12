import { useState, useEffect } from "react";
import CartItemsList from "./components/CartItemList";
import OrderSummary from "./components/OrderSummary";
import { useAuth } from "../../hooks/AuthContext";
import { deleteData, fetchData, getQueryString } from "../../../mocks/CallingAPI";
// import type { CartItem } from "./components/CartItemList";
// import { initialItems } from "../../../data/initialItems";


export default function CartPage() {
  const token = localStorage.getItem('token') || '';
  const { user } = useAuth();
  const [items, setItems] = useState<Record<string, any>[]>([]);
  const [selectedItems, setSelectedItems] = useState<Record<string, any>[]>([]);
  const [refresh, setRefresh] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchDataAPI = async () => {
      setLoading(false);
      try {
        const ItemsResponse = await fetchData(`/orders${getQueryString({ page: 1, limit: 1000 })}`, token);
        console.log('ItemsResponse', ItemsResponse.data.data);
        // const FilterItems = ItemsResponse?.data?.data?.filter((i: any) => i.buyer?.userId == user?.sub);
        const FilterItems = ItemsResponse?.data?.data?.filter((i: any) => i.buyer?.userId == user?.sub && i.status == 'PENDING');
        console.log('FilterItems', FilterItems);

        setItems(FilterItems);
      } catch (error) {
        setError('Error');
      } finally {
        setLoading(false);
      }
    };

    fetchDataAPI();
  }, [refresh, user]);

  const removeItem = async (orderId: number) => {
    setLoading(true);
    try {
      const RemoveItemsResponse = await deleteData(`/orders/${orderId}`, token);
      console.log('RemoveItemsResponse', RemoveItemsResponse);
    } catch (error) {
      setError('Error');
    } finally {
      setLoading(false);
      setRefresh(p => p + 1);
    }
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

  // FIX==Fee
  const filteredItems = items.filter(item => selectedItems.includes(item.orderId));
  const subtotal = filteredItems.reduce((sum: any, i: any) => sum + (i.orderShops?.[0]?.orderDetails?.[0]?.price || 0) * i.orderShops?.[0]?.orderDetails?.[0]?.quantity, 0);
  const shipping = filteredItems.reduce((sum: any, i: any) => sum + parseInt(i.orderShops?.[0]?.shippingFee || 0), 0);
  // const tax = subtotal * 0.08;
  const tax = 0;
  const total = subtotal + shipping + tax;

  if (error) return <div><button onClick={() => setRefresh(p => p + 1)}>Error</button></div>
  if (loading) return <div><button onClick={() => setLoading(false)}>Loading</button></div>
  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <h1 className="text-center text-2xl font-bold mb-8">Your Shopping Cart</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
        {items?.length > 0 ?
          <section className="lg:col-span-2">
            <CartItemsList items={items} selectedItems={selectedItems} onRemove={removeItem} onCheck={handleCheckboxChange} />
          </section>
          :
          <section className="lg:col-span-2">
            <div style={{
              padding: '4px 8px',
              color: '#aaa',
              background: '#eee',
              border: '1px solid #e4e4e4ff',
              borderRadius: '200px',
              textAlign: 'center',
              fontStyle: 'italic'
            }}>
              Không có sản phẩm nào
            </div>
          </section>
        }

        <OrderSummary
          selectedItems={selectedItems}
          subtotal={subtotal}
          shipping={shipping}
          tax={tax}
          total={total}
        />
      </div>
    </div>
  );
}
