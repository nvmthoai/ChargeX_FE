import { ArrowLeftOutlined, CarOutlined, CreditCardOutlined, ShopOutlined, UserOutlined, WalletOutlined } from "@ant-design/icons";
import { message, Radio } from "antd";
import { MapPin } from "lucide-react";
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { createPaymentForOrder, getWalletAvailable, payOrderWithWallet } from "../../../api/payment/api";
import { PaymentProvider, type Payment } from "../../../api/payment/type";
import useProvinces from "../../hooks/useProvinces";

type WalletInfo = { balance: number; held: number; available: number } | null;

export default function PaymentCart() {
    const location = useLocation();
    const OrderState = location.state;
    console.log('OrderState', OrderState);
    const navigate = useNavigate();

    const [order, setOrder] = useState<any>([]);
    const [method, setMethod] = useState<PaymentProvider>(PaymentProvider.WALLET);
    const [processing, setProcessing] = useState(false);

    const { provinces, fetchDistricts, fetchWards } = useProvinces();
    const [deliveryLocation, setDeliveryLocation] = useState("Đang tải...");
    const [pickupLocation, setPickupLocation] = useState("Đang tải...");

    const [wallet, setWallet] = useState<WalletInfo>(null);
    const DEFAULT_SHIPPING_FEE = 22000;

    useEffect(() => {
        if (!OrderState) {
            message.error("Thiếu mã đơn hàng!");
            navigate("/shop");
            return;
        }

        setOrder(OrderState);
    }, [OrderState]);

    // 🗺️ Map địa chỉ
    useEffect(() => {
        const loadAddressNames = async () => {
            if (order?.length <= 0) return;
            const convertAddress = async (addr: any) => {
                if (!addr) return "Không có địa chỉ";
                try {
                    const province = provinces.find((p) => p.code === addr.provinceId);
                    const districtList = await fetchDistricts(addr.provinceId);
                    const district = districtList.find((d) => d.code === addr.districtId);
                    const wardList = await fetchWards(addr.districtId);
                    const ward = wardList.find((w) => w.code.toString() === addr.wardCode);
                    return `${addr.line1}, ${ward?.name || ""}, ${district?.name || ""}, ${province?.name || ""}`;
                } catch {
                    return addr.line1;
                }
            };

            if (order?.[0]?.deliveryAddress) {
                const text = await convertAddress(order?.[0]?.deliveryAddress);
                setDeliveryLocation(text);
            }
            if (order?.[0]?.pickupAddress) {
                const text = await convertAddress(order?.[0]?.pickupAddress);
                setPickupLocation(text);
            }
        };
        loadAddressNames();
    }, [order, provinces, fetchDistricts, fetchWards]);

    // 💰 Tính tổng

    const PriceBuyNow = order?.reduce((sum: any, i: any) => sum + (i.orderShops?.[0]?.orderDetails?.[0]?.price || 0) * i.orderShops?.[0]?.orderDetails?.[0]?.quantity, 0);
    const uniqueSellerCount = new Set(order?.map((i: any) => i.orderShops?.[0]?.seller?.userId))?.size;
    const total = PriceBuyNow + DEFAULT_SHIPPING_FEE * uniqueSellerCount;
    // const product = order.map((ord: any) => ord?.orderShops?.[0]?.orderDetails?.[0]?.product);
    // console.log("sản phẩm product nè", product);
    console.log("pickupLocation", pickupLocation);
    console.log("deliveryLocation", deliveryLocation);
    const isWalletInsufficient = method === PaymentProvider.WALLET && (wallet?.available ?? 0) < total;

    // 💳 Xử lý thanh toán // FIX==handlePayment
    const handlePayment = async () => {
        if (order?.length <= 0) return message.warning("Không tìm thấy đơn hàng!");
        setProcessing(true);

        try {
            if (method === PaymentProvider.WALLET) {
                // 🪙 Thanh toán qua ví nội bộ
                console.log("🪙 payOrderWithWallet →", { orderId: order.orderId, total });
                const result = await payOrderWithWallet(order.orderId, total);

                if (result?.success || result?.status === 200 || result?.status === 201) {
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

                    const txId = result?.data?.transactionId || `WALLET-${Date.now()}`;
                    navigate(`/payment-success?orderId=${order.orderId}&amount=${total}&transactionId=${txId}`);
                } else {
                    message.error(result?.message || "Thanh toán ví thất bại!");
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
        } catch (err) {
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
            } catch (err) {
                console.error("Không thể tải số dư ví");
            }
        })();
    }, []);

    if (order?.length <= 0) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen text-gray-600">
                <p>Không tìm thấy đơn hàng.</p>
            </div>
        );
    }

    const groupOrdersBySeller = (order: any): any => {
        const sellerMap = new Map<string, any>();

        for (const ord of order) {
            if (!sellerMap.has(ord.orderShops?.[0]?.seller?.userId)) {
                sellerMap.set(ord.orderShops?.[0]?.seller?.userId, {
                    userId: ord.orderShops?.[0]?.seller?.userId,
                    fullName: ord.orderShops?.[0]?.seller?.fullName,
                    orders: [ord],
                });
            } else {
                sellerMap.get(ord.orderShops?.[0]?.seller?.userId)!.orders.push(ord);
            }
        }

        return Array.from(sellerMap.values());
    };
    const sellers = groupOrdersBySeller(order);
    console.log(sellers);

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

                    {sellers?.map((slr: any, i: any) => (
                        <div key={i}>
                            {/* 🛍️ Sản phẩm */}
                            {slr?.orders?.map((ord: any, j: any) => (
                                <div key={j} className="flex items-center gap-4 bg-[#f7faff] rounded-2xl p-4 border border-[#dce9ff]">
                                    <img
                                        src={ord.orderShops?.[0]?.orderDetails?.[0]?.product?.imageUrls?.[0] || "/no-image.png"}
                                        alt={ord.orderShops?.[0]?.orderDetails?.[0]?.product?.title}
                                        className="w-20 h-20 rounded-xl object-cover border"
                                    />
                                    <div className="flex-1">
                                        <p className="font-semibold text-gray-900 text-lg">{ord.orderShops?.[0]?.orderDetails?.[0]?.product?.title}</p>
                                        <p className="text-sm text-gray-500 line-clamp-2">{ord.orderShops?.[0]?.orderDetails?.[0]?.product?.description || "Không có mô tả"}</p>
                                        <p className="font-semibold text-[#0F74C7] mt-1">{Number(ord.totalPrice).toLocaleString()} ₫</p>
                                    </div>
                                </div>
                            ))}

                            {/* 👩‍💼 Người bán */}
                            <div className="bg-[#fff9f9] border border-red-100 rounded-2xl p-4">
                                <div className="flex items-center gap-2 mb-2">
                                    <ShopOutlined className="text-red-500 text-lg" />
                                    <h3 className="font-semibold text-gray-800">Người bán</h3>
                                </div>
                                <p className="text-gray-700">
                                    <span className="font-medium">Tên:</span> {slr?.fullName}
                                </p>
                                {slr?.orders?.[0]?.pickupAddress && (
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
                                    <span className="font-medium">Tên:</span> {slr?.orders?.[0]?.buyer?.fullName}
                                </p>
                                {slr?.orders?.[0]?.deliveryAddress && (
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
                                {slr?.orders?.[0]?.shipping_provider ? (
                                    <p className="text-gray-700">
                                        <span className="font-medium">Đơn vị:</span> {slr?.orders?.[0]?.shipping_provider}
                                    </p>
                                ) : (
                                    <p className="text-gray-500">Chưa có thông tin đơn vị vận chuyển</p>
                                )}
                                <p className="text-gray-700 mt-1">
                                    <span className="font-medium">Phí vận chuyển:</span>{" "}
                                    {slr?.orders?.[0]?.totalShippingFee ? `${Number(slr?.orders?.[0]?.totalShippingFee).toLocaleString()} ₫` : "0 ₫"}
                                </p>
                            </div>
                        </div>
                    ))}

                    {/* 💰 Tổng tiền */}
                    <div className="pt-4 border-t border-gray-200 text-right">
                        <p className="font-semibold text-gray-800 text-lg">Tổng thanh toán:</p>
                        <p className="text-3xl font-extrabold text-[#0F74C7] mt-1">{total.toLocaleString()} ₫</p>
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
                            onClick={() => { if (order?.length <= 1) { setMethod(PaymentProvider.PAYOS) } }}
                            title={order?.length > 1 ? 'Không thể thanh toán PAYOS nếu có nhiều hơn 1 sản phẩm' : ''}
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
                            <Radio value={PaymentProvider.PAYOS} disabled={order?.length > 1} />
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
                                                            {wallet.available.toLocaleString()} ₫
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
                            // disabled={processing || isWalletInsufficient}
                            disabled // Sửa hàm handlePayment trước, rồi mới gỡ chỗ này để bấm được nút
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
