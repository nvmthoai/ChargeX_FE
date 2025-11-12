import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Spin, message, Radio } from "antd";
import { createPaymentForOrder, payOrderWithWallet, getWalletAvailable } from "../../../api/payment/api";
import {
  PaymentProvider,
  type Payment,
} from "../../../api/payment/type";
import { getOrderById } from "../../../api/order/api";
import type { Order } from "../../../api/order/type";
import {
  CreditCardOutlined,
  WalletOutlined,
  ShopOutlined,
  UserOutlined,
  CarOutlined,
  ArrowLeftOutlined,
} from "@ant-design/icons";
import { MapPin } from "lucide-react";
import useProvinces from "../../hooks/useProvinces";

type WalletInfo = { balance: number; held: number; available: number } | null;

export default function PaymentPage() {
  const [params] = useSearchParams();
  const orderId = params.get("orderId");
  const isMobile = params.get("mobile") === "true"; // Check if from mobile app
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [order, setOrder] = useState<Order | null>(null);
  const [method, setMethod] = useState<PaymentProvider>(PaymentProvider.PAYOS);
  const [processing, setProcessing] = useState(false);

  const { provinces, fetchDistricts, fetchWards } = useProvinces();
  const [deliveryLocation, setDeliveryLocation] = useState("Đang tải...");
  const [pickupLocation, setPickupLocation] = useState("Đang tải...");

  const [wallet, setWallet] = useState<WalletInfo>(null);

  // 🧾 Lấy chi tiết đơn hàng
  useEffect(() => {
    if (!orderId) {
      message.error("Thiếu mã đơn hàng!");
      navigate("/shop");
      return;
    }

    (async () => {
      try {
        const data = await getOrderById(orderId);
        console.log("🧾 Order detail fetched:", data);
        console.log("getOrderById", data);
        setOrder(data);
      } catch (err: unknown) {
        console.error("❌ Error fetching order:", err);
        message.error("Không thể tải thông tin đơn hàng!");
      } finally {
        setLoading(false);
      }
    })();
  }, [orderId, navigate]);

  // 🗺️ Map địa chỉ
  useEffect(() => {
    const loadAddressNames = async () => {
      if (!order) return;
      const convertAddress = async (addr: { provinceId?: number; districtId?: number; wardCode?: string; line1?: string }) => {
        if (!addr) return "Không có địa chỉ";
        try {
          const province = provinces.find((p) => p.code === Number(addr.provinceId));
          const districtList = await fetchDistricts(Number(addr.provinceId));
          const district = districtList.find((d) => d.code === Number(addr.districtId));
          const wardList = await fetchWards(Number(addr.districtId));
          const ward = wardList.find((w) => w.code.toString() === addr.wardCode);
          return `${addr.line1}, ${ward?.name || ""}, ${district?.name || ""}, ${province?.name || ""}`;
        } catch {
          return addr.line1 || "Không rõ địa chỉ";
        }
      };

      if (order.deliveryAddress) {
        const text = await convertAddress(order.deliveryAddress);
        console.log("text setDeliveryLocation", text);
        setDeliveryLocation(text);
      }
      if (order.pickupAddress) {
        const text = await convertAddress(order.pickupAddress);
        console.log("text setPickupLocation", text);
        setPickupLocation(text);
      }
    };
    loadAddressNames();
  }, [order, provinces, fetchDistricts, fetchWards]);

  // 💰 Tính tổng
  const total =
    (Number(order?.totalPrice) || 0) +
    (Number(order?.totalShippingFee) || 0);
  // Support both auction orders (order.product) and regular shop orders (order.orderShops[0].orderDetails[0].product)
  const product = order?.product || order?.orderShops?.[0]?.orderDetails?.[0]?.product;
  console.log("sản phẩm product nè", product);
  console.log("pickupLocation", pickupLocation);
  console.log("deliveryLocation", deliveryLocation);
  const isWalletInsufficient = method === PaymentProvider.WALLET && (wallet?.available ?? 0) < total;

  // 💳 Xử lý thanh toán
  const handlePayment = async () => {
    if (!order) return message.warning("Không tìm thấy đơn hàng!");
    setProcessing(true);

    try {
      if (method === PaymentProvider.WALLET) {
        // 🪙 Thanh toán qua ví nội bộ
        console.log("🪙 payOrderWithWallet →", { orderId: order.orderId, total });
        const result = await payOrderWithWallet(order.orderId, total);

        if (result.success) {
          message.success("Thanh toán ví nội bộ thành công!");

          // 🔗 Ghi lại Payment record để Order có payment hiển thị ở các màn sau
          const walletPaymentPayload = {
            type: "pay_order" as const,
            amount: Number(total),
            description: `Thanh toán đơn hàng #${order.orderId}`,
            related_order_id: order.orderId,
            provider: PaymentProvider.WALLET,
            method: "wallet",
            returnUrl: `${window.location.origin}/payment-success`,
            cancelUrl: `${window.location.origin}/payment-cancel`,
            webhookUrl: "https://yoursite.com/webhook/payos",
          };
          console.log("🧾 createPaymentForOrder (WALLET) payload →", walletPaymentPayload);

          try {
            await createPaymentForOrder(walletPaymentPayload);
          } catch (e) {
            // Không chặn UX nếu chỉ lỗi ghi log payment; vẫn điều hướng success vì tiền đã trừ
            console.warn("⚠️ createPaymentForOrder (WALLET) failed, continue redirect:", e);
          }

          const txId = result.transactionId || `WALLET-${Date.now()}`;
          
          // 📱 If from mobile, redirect back to mobile app with deep link
          if (isMobile) {
            const deepLinkUrl = `reev://payment-success?orderId=${order.orderId}&amount=${total}&transactionId=${txId}&status=paid`;
            console.log('📱 Redirecting to mobile app:', deepLinkUrl);
            window.location.href = deepLinkUrl;
          } else {
            navigate(`/payment-success?orderId=${order.orderId}&amount=${total}&transactionId=${txId}`);
          }
        } else {
          message.error(result.message || "Thanh toán ví thất bại!");
        }
      } else {
        // 💳 Thanh toán qua PayOS (tạo Payment + redirect)
        const payload = {
          type: "pay_order" as const,
          amount: Number(total),
          description: `Thanh toán đơn hàng #${order.orderId}`,
          related_order_id: order.orderId,
          provider: method,
          method: "bank",
          returnUrl: `${window.location.origin}/payment-success`,
          cancelUrl: `${window.location.origin}/payment-cancel`,
          webhookUrl: "https://yoursite.com/webhook/payos",
        };
        console.log("🚀 Payment payload (PAYOS):", payload);

        const payment: Payment = await createPaymentForOrder(payload);
        if (payment?.checkoutUrl) {
          message.success("Đang chuyển đến cổng thanh toán...");
          window.location.href = payment.checkoutUrl;
        } else {
          message.error("Không nhận được đường dẫn thanh toán!");
        }
      }
    } catch (err: unknown) {
      console.error("❌ Error processing payment:", err);
      message.error("Không thể xử lý thanh toán!");
    } finally {
      setProcessing(false);
    }
  };

  // 📥 Số dư ví
  useEffect(() => {
    (async () => {
      try {
        const data = await getWalletAvailable();
        setWallet(data);
      } catch (err: unknown) {
        console.error("Không thể tải số dư ví", err);
      }
    })();
  }, []);

  if (loading)
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50">
        <Spin size="large" />
      </div>
    );

  if (!order)
    return (
      <div className="flex flex-col items-center justify-center min-h-screen text-gray-600">
        <p>Không tìm thấy đơn hàng.</p>
      </div>
    );
  // Support both auction orders (order.seller) and regular shop orders (order.orderShops[0].seller)
  const seller = order?.seller || order?.orderShops?.[0]?.seller;

  return (
    <div className="min-h-screen bg-gray-50 py-10">
      {/* 🧾 Tiêu đề */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-[#0F74C7] mb-1">Thanh toán đơn hàng</h1>
        <p className="text-gray-500">Vui lòng kiểm tra thông tin trước khi thanh toán</p>
      </div>

      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8 mt-10 items-start">
        {/* 🧺 Thông tin đơn hàng */}
        <div className="bg-white rounded-xl shadow-md p-8 space-y-6 lg:col-span-2">
          <h2 className="text-2xl font-semibold text-gray-900">
            <span className="text-[#0F74C7]">1.</span> Order Summary
          </h2>

          {/* 🛍️ Sản phẩm */}
          {product && (
            <div className="flex items-center gap-4 bg-[#f7faff] rounded-2xl p-4 border border-[#dce9ff]">
              <img
                src={product.imageUrls?.[0] || "/no-image.png"}
                alt={product.title}
                className="w-20 h-20 rounded-xl object-cover border"
              />
              <div className="flex-1">
                <p className="font-semibold text-gray-900 text-lg">{product.title}</p>
                <p className="text-sm text-gray-500 line-clamp-2">{product.description || "Không có mô tả"}</p>
                <p className="font-semibold text-[#0F74C7] mt-1">${Number(order.totalPrice).toLocaleString()}</p>
              </div>
            </div>
          )}

          {/* 👩‍💼 Người bán */}
          <div className="bg-[#fff9f9] border border-red-100 rounded-2xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <ShopOutlined className="text-red-500 text-lg" />
              <h3 className="font-semibold text-gray-800">Người bán</h3>
            </div>
            <p className="text-gray-700">
              <span className="font-medium">Tên:</span> {seller?.fullName}
            </p>
            {order.pickupAddress && (
              <p className="flex items-start gap-1 text-gray-700 mt-1">
                <MapPin size={16} className="text-red-500 mt-1" />
                <span>{pickupLocation}</span>
              </p>
            )}
          </div>

          {/* 👤 Người mua */}
          <div className="bg-[#f7fbff] border border-blue-100 rounded-2xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <UserOutlined className="text-blue-500 text-lg" />
              <h3 className="font-semibold text-gray-800">Người mua</h3>
            </div>
            <p className="text-gray-700">
              <span className="font-medium">Tên:</span> {order.buyer?.fullName}
            </p>
            {order.deliveryAddress && (
              <p className="flex items-start gap-1 text-gray-700 mt-1">
                <MapPin size={16} className="text-blue-500 mt-1" />
                <span>{deliveryLocation}</span>
              </p>
            )}
          </div>

          {/* 🚚 Vận chuyển */}
          <div className="bg-[#f9fff9] border border-green-100 rounded-2xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <CarOutlined className="text-green-500 text-lg" />
              <h3 className="font-semibold text-gray-800">Vận chuyển</h3>
            </div>
            {order.shipping_provider ? (
              <p className="text-gray-700">
                <span className="font-medium">Đơn vị:</span> {order.shipping_provider}
              </p>
            ) : (
              <p className="text-gray-500">Chưa có thông tin đơn vị vận chuyển</p>
            )}
            <p className="text-gray-700 mt-1">
              <span className="font-medium">Phí vận chuyển:</span>{" "}
              {order.totalShippingFee ? `$${Number(order.totalShippingFee).toLocaleString()}` : "$0"}
            </p>
          </div>

          {/* 💰 Tổng tiền */}
          <div className="pt-4 border-t border-gray-200 text-right">
            <p className="font-semibold text-gray-800 text-lg">Tổng thanh toán:</p>
            <p className="text-3xl font-extrabold text-[#0F74C7] mt-1">${total.toLocaleString()}</p>
          </div>
        </div>

        {/* 💳 Hình thức thanh toán */}
        <div className="bg-white rounded-xl shadow-md p-8 space-y-6 sticky top-6 self-start">
          <h2 className="text-2xl font-semibold text-gray-900">
            <span className="text-[#0F74C7]">2.</span> Payment Method
          </h2>

          <Radio.Group
            onChange={(e) => setMethod(e.target.value)}
            value={method}
            className="space-y-4 mt-6 w-full"
          >
            {/* PAYOS */}
            <div
              className={`rounded-2xl p-4 flex items-center justify-between cursor-pointer transition-all duration-300 ${method === PaymentProvider.PAYOS ? "border-2 border-[#0F74C7] bg-[#f0f7ff]" : "border border-gray-200 bg-white"
                }`}
              onClick={() => setMethod(PaymentProvider.PAYOS)}
            >
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-full bg-[#0F74C7]/10">
                  <CreditCardOutlined className="text-[#0F74C7] text-xl" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-800">Thanh toán qua PayOS</p>
                  <p className="text-gray-500 text-sm">Nhanh chóng và an toàn qua ngân hàng liên kết.</p>
                </div>
              </div>
              <Radio value={PaymentProvider.PAYOS} />
            </div>

            {/* WALLET */}
            <div
              className={`rounded-2xl p-4 flex items-center justify-between cursor-pointer transition-all duration-300 ${method === PaymentProvider.WALLET ? "border-2 border-[#0F74C7] bg-[#f6fbff]" : "border border-gray-200 bg-white"
                }`}
              onClick={() => setMethod(PaymentProvider.WALLET)}
            >
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-full bg-[#0F74C7]/10">
                  <WalletOutlined className="text-[#0F74C7] text-xl" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-800">Ví nội bộ ReEV</p>
                  {method === PaymentProvider.WALLET && (
                    <div className="mt-3 text-sm text-gray-700">
                      {wallet ? (
                        <>
                          <p>
                            Số dư khả dụng:{" "}
                            <span className="font-semibold text-[#0F74C7]">
                              ${wallet.available.toLocaleString()}
                            </span>
                          </p>
                          {wallet.available < total && (
                            <p className="text-red-500 mt-1">⚠️ Số dư không đủ để thanh toán!</p>
                          )}
                        </>
                      ) : (
                        <p className="text-gray-400">Đang tải số dư ví...</p>
                      )}
                    </div>
                  )}

                  <p className="text-gray-500 text-sm">Thanh toán trực tiếp từ số dư tài khoản của bạn.</p>
                </div>
              </div>
              <Radio value={PaymentProvider.WALLET} />
            </div>
          </Radio.Group>

          {/* ACTION */}
          <div className="pt-8 space-y-3">
            <button
              onClick={handlePayment}
              disabled={processing || isWalletInsufficient}
              className={`w-full py-3 rounded-lg text-white font-medium text-lg mt-4 transition ${processing || isWalletInsufficient ? "bg-gray-400 cursor-not-allowed" : "bg-[#0F74C7] hover:bg-[#3888ca]"
                }`}
            >
              {processing ? "Đang xử lý..." : "Thanh toán ngay"}
            </button>

            <button
              onClick={() => navigate(-1)}
              className="w-full py-3 rounded-lg border text-gray-700 hover:border-[#0F74C7] transition flex items-center justify-center gap-2"
            >
              <ArrowLeftOutlined /> Quay lại
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
