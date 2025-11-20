import { useState, useEffect } from "react";
import CartItemsList from "./components/CartItemList";
import OrderSummary from "./components/OrderSummary";
import { useAuth } from "../../hooks/AuthContext";
import { deleteData, fetchData, getQueryString } from "../../../mocks/CallingAPI";
import { ShoppingCart, Loader2, AlertCircle } from "lucide-react";
import { Link } from "react-router-dom";

export default function CartPage() {
  const { user } = useAuth();
  const [items, setItems] = useState<Record<string, any>[]>([]);
  const [selectedItems, setSelectedItems] = useState<Record<string, any>[]>([]);
  const [refresh, setRefresh] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    (async () => {
      setLoading(true);
      const token = localStorage.getItem('token') || '';
      try {
        const ItemsResponse = await fetchData(`/orders${getQueryString({ page: 1, limit: 1000 })}`, token);
        // const FilterItems = ItemsResponse?.data?.data?.filter((_: any) => true);
        // const FilterItems = ItemsResponse?.data?.data?.filter((i: any) => i.buyer?.userId == user?.sub);
        const FilterItems = ItemsResponse?.data?.data?.filter((i: any) => i.buyer?.userId == user?.sub && i.status == 'PENDING');
        console.log('FilterItems', FilterItems);
        setItems(FilterItems);
      } catch (error) {
        setError('Error loading cart items');
      } finally {
        setLoading(false);
      }
    })();
  }, [refresh, user]);

  const removeItem = async (orderId: number) => {
    setLoading(true);
    const token = localStorage.getItem('token') || '';
    try {
      await deleteData(`/orders/${orderId}`, token);
    } catch (error) {
      setError('Error removing item');
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

  const filteredItems = items.filter(item => selectedItems.includes(item.orderId));
  const subtotal = filteredItems.reduce((sum: any, i: any) => sum + Number(i.orderShops?.[0]?.orderDetails?.[0]?.price || 0) * Number(i.orderShops?.[0]?.orderDetails?.[0]?.quantity), 0);
  const shipping = filteredItems.reduce((sum: any, i: any) => sum + parseInt(i.totalShippingFee || 0), 0);
  const tax = 0;
  const total = subtotal + shipping + tax;

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-8">
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-8 shadow-xl border border-red-200 max-w-md text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-dark-900 mb-2">Error</h2>
          <p className="text-dark-800 mb-6 font-medium">{error}</p>
          <button
            onClick={() => { setRefresh(p => p + 1); setError(''); }}
            className="px-6 py-3 bg-gradient-to-r from-ocean-500 to-ocean-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl hover:scale-105 transition-all"
          >
            Thử lại
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center p-8">
        <div className="text-center">
          <Loader2 className="w-16 h-16 text-ocean-500 animate-spin mx-auto mb-4" />
          <p className="text-dark-800 text-lg font-medium">Loading your cart...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-3 bg-gradient-to-r from-ocean-500 to-energy-500 rounded-xl">
              <ShoppingCart className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-4xl sm:text-5xl font-bold bg-gradient-to-r from-ocean-600 to-energy-600 bg-clip-text text-transparent h-14">
              Giỏ hàng
            </h1>
          </div>
          <p className="text-dark-800 text-lg font-medium">
            {items.length > 0
              ? `Có ${items.length} sản phẩm trong giỏ hàng của bạn`
              : 'Giỏ hàng của bạn đang trống'}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <section className="lg:col-span-2">
            {items?.length > 0 ? (
              <CartItemsList
                items={items}
                selectedItems={selectedItems}
                onRemove={removeItem}
                onCheck={handleCheckboxChange}
              />
            ) : (
              <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-12 shadow-xl border border-ocean-200/50 text-center">
                <div className="w-24 h-24 bg-gradient-to-r from-ocean-100 to-energy-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <ShoppingCart className="w-12 h-12 text-ocean-500" />
                </div>
                <h3 className="text-2xl font-bold text-dark-900 mb-2">Giỏ hàng của bạn đang trống</h3>
                <p className="text-dark-800 mb-6 font-medium">Bắt đầu mua sắm để thêm mặt hàng vào giỏ hàng của bạn</p>
                <Link
                  to="/"
                  className="inline-block px-6 py-3 bg-gradient-to-r from-ocean-500 to-ocean-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl hover:scale-105 transition-all"
                  style={{ color: '#fff' }}
                >
                  Tiếp tục mua sắm
                </Link>
              </div>
            )}
          </section>

          {/* Order Summary */}
          <OrderSummary
            selectedItems={selectedItems}
            subtotal={subtotal}
            shipping={shipping}
            tax={tax}
            total={total}
          />
        </div>
      </div>
    </div>
  );
}
