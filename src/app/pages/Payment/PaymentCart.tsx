
import { ArrowLeftOutlined, CarOutlined, CreditCardOutlined, ShopOutlined, UserOutlined, WalletOutlined } from "@ant-design/icons";
import { message, Radio } from "antd";
import { MapPin } from "lucide-react";
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { getWalletAvailable } from "../../../api/payment/api";
import { PaymentProvider } from "../../../api/payment/type";
import { postData } from "../../../mocks/CallingAPI";
import useProvinces from "../../hooks/useProvinces";
import type { District, Ward } from "../../hooks/useProvinces";

type WalletInfo = { balance: number; held: number; available: number } | null;

export default function PaymentCart() {
    const token = localStorage.getItem("token") || "";
    const location = useLocation();
    const OrderState = location.state;
    const navigate = useNavigate();

    const [order, setOrder] = useState<any>([]);
    const [method, setMethod] = useState<PaymentProvider>(PaymentProvider.WALLET);
    const [processing, setProcessing] = useState(false);

    const { provinces, fetchDistricts, fetchWards } = useProvinces();
    const [deliveryLocation, setDeliveryLocation] = useState("Đang tải...");
    const [pickupLocation, setPickupLocation] = useState("Đang tải...");
    const [wallet, setWallet] = useState<WalletInfo>(null);

    useEffect(() => {
        if (!OrderState) {
            message.error("Thiếu mã đơn hàng!");
            navigate("/shop");
            return;
        }
        setOrder(OrderState);
    }, [OrderState]);

    // Convert address to text
    useEffect(() => {
        const loadAddressNames = async () => {
            if (order?.length <= 0) return;

            const convert = async (addr: any) => {
                if (!addr) return "Không có địa chỉ";
                try {
                    const province = provinces.find((p) => p.code === addr.provinceId);
                    const districts = await fetchDistricts(addr.provinceId);
                    const district = districts.find((d: District) => d.code === addr.districtId);
                    const wards = await fetchWards(addr.districtId);
                    const ward = wards.find((w: Ward) => w.code.toString() === addr.wardCode);

                    return `${addr.line1}, ${ward?.name || ""}, ${district?.name || ""}, ${province?.name || ""}`;
                } catch {
                    return addr.line1;
                }
            };

            if (order?.[0]?.deliveryAddress) {
                setDeliveryLocation(await convert(order[0].deliveryAddress));
            }
            if (order?.[0]?.pickupAddress) {
                setPickupLocation(await convert(order[0].pickupAddress));
            }
        };
        loadAddressNames();
    }, [order, provinces]);

    // Group by seller
    const groupOrdersBySeller = (orderList: any) => {
        const map = new Map();
        for (const ord of orderList) {
            const sellerId = ord.orderShops?.[0]?.seller?.userId;
            if (!map.has(sellerId)) {
                map.set(sellerId, {
                    userId: sellerId,
                    fullName: ord.orderShops?.[0]?.seller?.fullName,
                    shippingFee: Number(ord.totalShippingFee),
                    orders: [ord],
                });
            } else {
                map.get(sellerId).orders.push(ord);
            }
        }
        return [...map.values()];
    };

    const sellers = groupOrdersBySeller(order);
    const PriceBuyNow = order.reduce(
        (sum: any, i: any) =>
            sum +
            Number(i.orderShops?.[0]?.orderDetails?.[0]?.price || 0) *
            Number(i.orderShops?.[0]?.orderDetails?.[0]?.quantity),
        0
    );
    const totalShippingFee = sellers.reduce((sum: any, i: any) => sum + Number(i.shippingFee), 0);
    const total = PriceBuyNow + totalShippingFee;

    const isWalletInsufficient = method === PaymentProvider.WALLET && (wallet?.available ?? 0) < total;

    // Payment handler
    const handlePayment = async () => {
        if (order?.length <= 0) return message.warning("Không tìm thấy đơn hàng!");
        setProcessing(true);

        const items = order.map((ord: any) => ({
            orderId: ord.orderId,
            amount:
                Number(ord.orderShops?.[0]?.orderDetails?.[0]?.price) +
                Number(ord.totalShippingFee) /
                (order.filter((o: any) => o.orderShops?.[0]?.seller?.userId === ord.orderShops?.[0]?.seller?.userId).length || 1),
        }));

        try {
            const payload = {
                items,
                provider: method === PaymentProvider.PAYOS ? "bank" : "internal",
                method: method === PaymentProvider.PAYOS ? "payos" : "wallet",
                returnUrl: "",
                cancelUrl: "",
                webhookUrl: ""
            };

            await postData("/payment/orders/batch", payload, token);

            navigate(`/payment-success?amount=${total}`);
        } catch (err) {
            console.error("Error processing payment:", err);
            message.error("Không thể xử lý thanh toán!");
        } finally {
            setProcessing(false);
        }
    };

    // Load wallet
    useEffect(() => {
        (async () => {
            try {
                setWallet(await getWalletAvailable());
            } catch {
                console.error("Không thể load ví");
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

    return (
        <div className="min-h-screen bg-gray-50 py-10">
            {/* Tiêu đề */}
            <div className="text-center">
                <h1 className="text-3xl font-bold text-[#0F74C7] mb-1">Thanh toán đơn hàng</h1>
                <p className="text-gray-500">Vui lòng kiểm tra thông tin trước khi thanh toán</p>
            </div>

            <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8 mt-10">
                {/* Order Summary */}
                <div className="bg-white rounded-xl shadow-md p-8 lg:col-span-2 space-y-6">
                    
                    {sellers.map((slr: any, i: number) => (
                        <div key={i} className="space-y-4">
                            {slr.orders.map((ord: any, j: number) => (
                                <div
                                    key={j}
                                    className="flex items-center gap-4 bg-[#f7faff] rounded-xl p-4 border border-[#dce9ff]"
                                >
                                    <img
                                        src={ord.orderShops?.[0]?.orderDetails?.[0]?.product?.imageUrls?.[0] || "/no-image.png"}
                                        className="w-20 h-20 rounded-xl object-cover"
                                    />
                                    <div className="flex-1">
                                        <p className="font-semibold text-lg">
                                            {ord.orderShops?.[0]?.orderDetails?.[0]?.product?.title}
                                        </p>
                                        <p className="text-sm text-gray-500">
                                            {ord.orderShops?.[0]?.orderDetails?.[0]?.product?.description}
                                        </p>
                                        <p className="font-semibold text-[#0F74C7] mt-1">
                                            {Number(ord.orderShops?.[0]?.orderDetails?.[0]?.price).toLocaleString()} VND
                                        </p>
                                    </div>
                                </div>
                            ))}

                            {/* Seller */}
                            <div className="bg-[#fff9f9] border border-red-200 p-4 rounded-xl">
                                <div className="flex items-center gap-2 mb-1">
                                    <ShopOutlined className="text-red-500" />
                                    <span className="font-semibold">Người bán</span>
                                </div>
                                <p>{slr.fullName}</p>
                                <p className="flex items-start mt-1 text-gray-700">
                                    <MapPin size={16} className="mr-1 text-red-500" />
                                    {pickupLocation}
                                </p>
                            </div>

                            {/* Buyer */}
                            <div className="bg-[#f7fbff] border border-blue-200 p-4 rounded-xl">
                                <div className="flex items-center gap-2 mb-1">
                                    <UserOutlined className="text-blue-500" />
                                    <span className="font-semibold">Người mua</span>
                                </div>
                                <p>{slr.orders[0]?.buyer?.fullName}</p>
                                <p className="flex items-start mt-1 text-gray-700">
                                    <MapPin size={16} className="mr-1 text-blue-500" />
                                    {deliveryLocation}
                                </p>
                            </div>

                            {/* Shipping */}
                            <div className="bg-[#f9fff9] border border-green-200 p-4 rounded-xl">
                                <div className="flex items-center gap-2 mb-1">
                                    <CarOutlined className="text-green-500" />
                                    <span className="font-semibold">Vận chuyển</span>
                                </div>
                                <p>Phí ship: {slr.shippingFee.toLocaleString()} VND</p>
                            </div>
                        </div>
                    ))}

                    <div className="text-right border-t pt-4">
                        <p className="font-semibold text-lg">Tổng tiền:</p>
                        <p className="text-3xl font-bold text-[#0F74C7]">{total.toLocaleString()} VND</p>
                    </div>
                </div>

                {/* Payment Method */}
                <div className="bg-white rounded-xl shadow-md p-8 space-y-6 sticky top-8">

                    <Radio.Group
                        value={method}
                        onChange={(e) => setMethod(e.target.value)}
                        className="space-y-4 w-full"
                    >
                        <div
                            className={`p-4 rounded-xl flex justify-between cursor-pointer border ${method === PaymentProvider.PAYOS ? "border-blue-500 bg-blue-50" : "border-gray-200"
                                }`}
                            onClick={() => setMethod(PaymentProvider.PAYOS)}
                        >
                            <div className="flex items-center gap-3">
                                <div className="p-3 bg-blue-100 rounded-full">
                                    <CreditCardOutlined className="text-blue-600" />
                                </div>
                                <div>
                                    <p className="font-medium">Thanh toán PayOS</p>
                                    <p className="text-sm text-gray-500">Thanh toán qua ngân hàng.</p>
                                </div>
                            </div>
                            <Radio value={PaymentProvider.PAYOS} />
                        </div>

                        <div
                            className={`p-4 rounded-xl flex justify-between cursor-pointer border ${method === PaymentProvider.WALLET ? "border-blue-500 bg-blue-50" : "border-gray-200"
                                }`}
                            onClick={() => setMethod(PaymentProvider.WALLET)}
                        >
                            <div className="flex items-center gap-3">
                                <div className="p-3 bg-blue-100 rounded-full">
                                    <WalletOutlined className="text-blue-600" />
                                </div>
                                <div>
                                    <p className="font-medium">Ví nội bộ ReEV</p>

                                    {method === PaymentProvider.WALLET && wallet && (
                                        <p className="text-sm mt-2">
                                            Số dư khả dụng:{" "}
                                            <span className="font-bold text-blue-600">
                                                {wallet.available.toLocaleString()} VND
                                            </span>
                                        </p>
                                    )}

                                    {wallet && wallet.available < total && (
                                        <p className="text-sm text-red-500 mt-1">
                                            ⚠ Số dư không đủ thanh toán!
                                        </p>
                                    )}
                                </div>
                            </div>
                            <Radio value={PaymentProvider.WALLET} />
                        </div>
                    </Radio.Group>

                    <button
                        className={`w-full py-3 rounded-lg text-lg font-medium text-white ${processing || isWalletInsufficient
                            ? "bg-gray-400 cursor-not-allowed"
                            : "bg-blue-600 hover:bg-blue-700"
                            }`}
                        onClick={handlePayment}
                        disabled={processing || isWalletInsufficient}
                    >
                        {processing ? "Đang xử lý..." : "Thanh toán ngay"}
                    </button>

                    <button
                        onClick={() => navigate(-1)}
                        className="w-full py-3 rounded-lg border text-gray-700 flex items-center justify-center"
                    >
                        <ArrowLeftOutlined className="mr-2" />
                        Quay lại
                    </button>
                </div>
            </div>
        </div>
    );
}
