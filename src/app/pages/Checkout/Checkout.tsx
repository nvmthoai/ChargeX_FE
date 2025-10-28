import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { message, Spin } from "antd";
import { createOrder } from "../../../api/order/api";
import { OrderStatus } from "../../../api/order/type";
import useAddress from "../../hooks/useAddress";
import AddressList from "../Manage-Address/AddressList";
import AddressFormModal from "../Manage-Address/AddressFormModal";
import { getProductById } from "../../../api/product/api";

export default function Checkout() {
  const [params] = useSearchParams();
  const productId = params.get("productId");
  const navigate = useNavigate();

  const { addresses, handleCreateAddress, handleUpdateAddress, isLoading } =
    useAddress();

  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [product, setProduct] = useState<any>(null);
  const [editingAddress, setEditingAddress] = useState<any>(null);

  const [loadingProduct, setLoadingProduct] = useState(true);

  // 🧾 Fetch sản phẩm
  useEffect(() => {
    if (!productId) return;
    const fetchProduct = async () => {
      try {
        const productData = await getProductById(productId);
        setProduct(productData);
        console.log("✅ Product details:", productData);
      } catch (error) {
        console.error("❌ Error fetching product:", error);
        message.error("Không thể tải sản phẩm!");
      } finally {
        setLoadingProduct(false);
      }
    };
    fetchProduct();
  }, [productId]);

  // 🏠 Set địa chỉ mặc định
  useEffect(() => {
    if (addresses && addresses.length > 0) {
      const defaultAddr = addresses.find((a: any) => a.isDefault);
      if (defaultAddr) setSelectedAddressId(defaultAddr.addressId);
    }
  }, [addresses]);

  // 💳 Xác nhận thanh toán
  const handleConfirmPayment = async () => {
    if (!selectedAddressId) return message.warning("Vui lòng chọn địa chỉ giao hàng!");
    if (!product) return message.error("Không tìm thấy sản phẩm!");

    const userData = localStorage.getItem("user");
    const user = userData ? JSON.parse(userData) : null;
    if (!user?.sub) return message.error("Bạn cần đăng nhập để đặt hàng!");

    setConfirming(true);
    try {
      const payload = {
        buyer_id: user.sub,
        seller_id: product.seller.userId,
        productId: product.id,
        price: Number(product.price_buy_now),
        shipping_fee: 20000,
        shipping_provider: "GHTK",
        shipping_code: "AUTO-" + Date.now(),
        status: OrderStatus.PENDING,
        contract_url: "https://example.com/contracts/sample.pdf",
        pickup_address_id:product.seller.defaultAddress.addressId,
        delivery_address_id: selectedAddressId,
      };

      console.log("📦 Creating order with payload:", payload);
      const order = await createOrder(payload);

      message.success("✅ Đơn hàng đã được tạo thành công!");
      navigate(`/payment?orderId=${order.orderId}`);
    } catch (err) {
      console.error("❌ Error creating order:", err);
      message.error("Không thể tạo đơn hàng, vui lòng thử lại!");
    } finally {
      setConfirming(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-10">
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Cột trái: Thông tin giao hàng */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-md p-8 space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-semibold text-gray-900">
              <span className="text-[#0F74C7]">1.</span> Delivery Address
            </h2>
            <button
              onClick={() => setShowModal(true)}
              className="bg-[#0F74C7] hover:bg-[#3888ca] text-white px-4 py-2 rounded-md shadow-sm transition"
            >
              + Add New
            </button>
          </div>

          <div className="border-t pt-4">
            {isLoading ? (
              <div className="flex justify-center py-10">
                <Spin size="large" />
              </div>
            ) : (
              <AddressList
                mode="checkout"
                addresses={addresses}
                isLoading={isLoading}
                onEdit={(addr) => {
                  setEditingAddress(addr);
                  setShowModal(true);
                }}
                onSelect={(id) => setSelectedAddressId(id)}
                selectedAddressId={selectedAddressId}
                onDelete={() => { }}    
                onSetDefault={() => { }}   
              />

            )}
          </div>
        </div>

        {/* Cột phải: Thông tin đơn hàng */}
        <div className="bg-white rounded-xl shadow-md p-8 space-y-6 sticky top-6 self-start">
          <h2 className="text-2xl font-semibold text-gray-900">
            <span className="text-[#0F74C7]">2.</span> Order Summary
          </h2>

          {loadingProduct ? (
            <div className="flex justify-center py-10">
              <Spin size="large" />
            </div>
          ) : product ? (
            <>
              <div className="flex items-center gap-4">
                <img
                  src={product?.imageUrls?.[0] || "/placeholder.png"}
                  alt={product?.title || "product"}
                  className="w-24 h-24 rounded-md object-cover"
                />
                <div className="flex flex-col">
                  <span className="font-semibold text-gray-900">{product?.title}</span>
                  <span className="text-gray-600 text-sm line-clamp-2">
                    {product?.description}
                  </span>
                </div>
              </div>

              <div className="border-t pt-4 space-y-2 text-gray-700">
                <p className="flex justify-between">
                  <span>Price</span>
                  <span>${Number(product.price_buy_now).toLocaleString()}</span>
                </p>
                <p className="flex justify-between">
                  <span>Shipping Fee</span>
                  <span>$20,000</span>
                </p>
                <p className="flex justify-between font-semibold text-lg">
                  <span>Total</span>
                  <span className="text-[#0F74C7]">
                    ${(Number(product.price_buy_now) + 20000).toLocaleString()}
                  </span>
                </p>
              </div>

              <button
                onClick={handleConfirmPayment}
                disabled={confirming}
                className={`w-full py-3 rounded-lg text-white font-medium text-lg mt-4 transition ${confirming
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-[#0F74C7] hover:bg-[#3888ca]"
                  }`}
              >
                {confirming ? "Đang xử lý..." : "Xác nhận thanh toán"}
              </button>
            </>
          ) : (
            <p className="text-gray-500 italic">Không tìm thấy sản phẩm.</p>
          )}
        </div>
      </div>

      {/* Modal địa chỉ */}
      {showModal && (
        <AddressFormModal
          address={editingAddress}
          onClose={() => setShowModal(false)}
          onSuccess={() => setShowModal(false)}
          handleCreateAddress={handleCreateAddress}
          handleUpdateAddress={handleUpdateAddress}
        />
      )}

    </div>
  );
}
