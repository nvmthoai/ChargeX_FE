// src/app/pages/Payment/PaymentCart.tsx
import { ArrowLeftOutlined, CarOutlined, CreditCardOutlined, ShopOutlined, UserOutlined, WalletOutlined } from "@ant-design/icons";
import { Radio, message } from "antd";
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { MapPin } from "lucide-react";

import { getWalletAvailable } from "../../../api/payment/api";
import { PaymentProvider } from "../../../api/payment/type";
import { postData } from "../../../mocks/CallingAPI";
import useProvinces from "../../hooks/useProvinces";

// Đảm bảo wardCode luôn là 5 chữ số (GHN bắt buộc)
const formatWardCode = (code: string | number | null | undefined): string => {
  if (!code) return "00000";
  return String(code).padStart(5, "0"); // "201" → "00201", "1234" → "01234"
};

type WalletInfo = { balance: number; held: number; available: number } | null;

export default function PaymentCart() {
  const token = localStorage.getItem("token") || "";
  const location = useLocation();
  const orderState = location.state;
  const navigate = useNavigate();

  const [order, setOrder] = useState<any[]>([]);
  const [method, setMethod] = useState<PaymentProvider>(PaymentProvider.WALLET);
  const [processing, setProcessing] = useState(false);
  const { provinces, fetchDistricts, fetchWards } = useProvinces();
  const [deliveryLocation, setDeliveryLocation] = useState("Đang tải...");
  const [pickupLocation, setPickupLocation] = useState("Đang tải...");
  const [wallet, setWallet] = useState<WalletInfo>(null);

  useEffect(() => {
    if (!orderState) {
      message.error("Thiếu mã đơn hàng!");
      navigate("/shop");
      return;
    }
    setOrder(orderState as any[]);
  }, [orderState, navigate]);

  // Hiển thị tên địa chỉ đẹp
  useEffect(() => {
    const loadAddressNames = async () => {
      if (!order?.length || provinces.length === 0) return;

      const convert = async (addr: any) => {
        if (!addr) return "Không có địa chỉ";
        try {
          const province = provinces.find((p: any) => p.code === addr.provinceId);
          const districts = await fetchDistricts(addr.provinceId);
          const district = districts.find((d: any) => d.code === addr.districtId);
          const wards = await fetchWards(addr.districtId);
          const ward = wards.find((w: any) => w.code === addr.wardCode);

          return `${addr.line1}, ${ward?.name || ""}, ${district?.name || ""}, ${province?.name || ""}`
            .replace(/^,\s*|,?\s*,/g, "")
            .trim();
        } catch {
          return addr.line1 || "Địa chỉ không hợp lệ";
        }
      };

      if (order[0]?.deliveryAddress) {
        const text = await convert(order[0].deliveryAddress);
        setDeliveryLocation(text || "Không xác định");
      }
      if (order[0]?.pickupAddress) {
        const text = await convert(order[0].pickupAddress);
        setPickupLocation(text || "Không xác định");
      }
    };

    loadAddressNames();
  }, [order, provinces, fetchDistricts, fetchWards]);

  useEffect(() => {
    (async () => {
      try {
        const data = await getWalletAvailable();
        setWallet(data);
      } catch (err) {
        console.error("Không thể load ví:", err);
      }
    })();
  }, []);

  const groupOrdersBySeller = (orders: any[]) => {
    const map = new Map();
    for (const ord of orders) {
      const sellerId = ord.orderShops?.[0]?.seller?.userId;
      if (!map.has(sellerId)) {
        map.set(sellerId, {
          userId: sellerId,
          fullName: ord.orderShops?.[0]?.seller?.fullName,
          shippingFee: Number(ord.totalShippingFee || 0),
          orders: [ord],
        });
      } else {
        map.get(sellerId).orders.push(ord);
      }
    }
    return [...map.values()];
  };

  const sellers = groupOrdersBySeller(order);

  const PriceBuyNow = order.reduce((sum, i) => {
    const price = Number(i.orderShops?.[0]?.orderDetails?.[0]?.price || 0);
    const qty = Number(i.orderShops?.[0]?.orderDetails?.[0]?.quantity || 1);
    return sum + price * qty;
  }, 0);

  const totalShippingFee = sellers.reduce((sum, s) => sum + Number(s.shippingFee || 0), 0);
  const total = PriceBuyNow + totalShippingFee;

  const isWalletInsufficient =
    wallet?.available != null && method === PaymentProvider.WALLET && wallet.available < total;

  // THANH TOÁN – ĐÃ FIX 100% WARDCODE CHO CẢ NGƯỜI MUA + NGƯỜI BÁN
  const handlePayment = async () => {
    if (!order?.length) {
      message.warning("Không tìm thấy đơn hàng!");
      return;
    }
    setProcessing(true);

    try {
      const items = order.map((ord) => {
        const sameSellerCount = order.filter(
          (o) => o.orderShops?.[0]?.seller?.userId === ord.orderShops?.[0]?.seller?.userId
        ).length;

        return {
          orderId: ord.orderId,
          amount:
            Number(ord.orderShops?.[0]?.orderDetails?.[0]?.price || 0) +
            Number(ord.totalShippingFee || 0) / (sameSellerCount || 1),
        };
      });

      const pickupAddr = order[0]?.pickupAddress;
      const deliveryAddr = order[0]?.deliveryAddress;

      if (!pickupAddr || !deliveryAddr) {
        message.error("Thiếu địa chỉ giao hàng hoặc lấy hàng!");
        setProcessing(false);
        return;
      }

      const payload = {
        items,
        provider: method === PaymentProvider.PAYOS ? "bank" : "internal",
        method: method === PaymentProvider.PAYOS ? "payos" : "wallet",
        returnUrl: `${window.location.origin}/payment-success`,
        cancelUrl: `${window.location.origin}/payment-cancel`,
        webhookUrl: "",
        deliveryAddress: {
          provinceId: Number(deliveryAddr.provinceId),
          districtId: Number(deliveryAddr.districtId),
          wardCode: formatWardCode(deliveryAddr.wardCode), // Đã chuẩn 5 số
          line1: deliveryAddr.line1,
        },
        pickupAddress: {
          provinceId: Number(pickupAddr.provinceId),
          districtId: Number(pickupAddr.districtId),
          wardCode: formatWardCode(pickupAddr.wardCode),   // FIX CHÍNH Ở ĐÂY!!!
          line1: pickupAddr.line1 || "Không xác định",
        },
      };

      console.log("Payload gửi thanh toán (wardCode đã chuẩn 100%):", payload);

      await postData("/payment/orders/batch", payload, token);

      message.success("Thanh toán thành công! Đơn hàng đã được tạo.");
      navigate(`/payment-success?amount=${total}`);
    } catch (err: any) {
      console.error("Lỗi thanh toán:", err);
      message.error(err?.response?.data?.message || "Thanh toán thất bại. Vui lòng thử lại!");
    } finally {
      setProcessing(false);
    }
  };

  if (!order?.length) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen text-gray-600">
        <p>Không tìm thấy đơn hàng.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-10">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-[#0F74C7] mb-1">Thanh toán đơn hàng</h1>
        <p className="text-gray-500">Vui lòng kiểm tra thông tin trước khi thanh toán</p>
      </div>

      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8 mt-10">
        <div className="bg-white rounded-xl shadow-md p-8 lg:col-span-2 space-y-6">
          {sellers.map((slr: any, i: number) => (
            <div key={i} className="space-y-4">
              {slr.orders.map((ord: any, j: number) => (
                <div key={j} className="flex items-center gap-4 bg-[#f7faff] rounded-xl p-4 border border-[#dce9ff]">
                  <img
                    src={ord.orderShops?.[0]?.orderDetails?.[0]?.product?.imageUrls?.[0] || "/no-image.png"}
                    alt="product"
                    className="w-20 h-20 rounded-xl object-cover"
                  />
                  <div className="flex-1">
                    <p className="font-semibold text-lg">{ord.orderShops?.[0]?.orderDetails?.[0]?.product?.title}</p>
                    <p className="text-sm text-gray-500">{ord.orderShops?.[0]?.orderDetails?.[0]?.product?.description}</p>
                    <p className="font-semibold text-[#0F74C7] mt-1">
                      {Number(ord.orderShops?.[0]?.orderDetails?.[0]?.price).toLocaleString()} VND
                    </p>
                  </div>
                </div>
              ))}

              <div className="bg-[#fff9f9] border border-red-200 p-4 rounded-xl">
                <div className="flex items-center gap-2 mb-1">
                  <ShopOutlined className="text-red-500" />
                  <span className="font-semibold">Người bán</span>
                </div>
                <p>{slr.fullName || "Không xác định"}</p>
                <p className="flex items-start mt-1 text-gray-700">
                  <MapPin size={16} className="mr-1 text-red-500 mt-0.5" />
                  {pickupLocation}
                </p>
              </div>

              <div className="bg-[#f7fbff] border border-blue-200 p-4 rounded-xl">
                <div className="flex items-center gap-2 mb-1">
                  <UserOutlined className="text-blue-500" />
                  <span className="font-semibold">Người mua</span>
                </div>
                <p>{slr.orders[0]?.buyer?.fullName || "Bạn"}</p>
                <p className="flex items-start mt-1 text-gray-700">
                  <MapPin size={16} className="mr-1 text-blue-500 mt-0.5" />
                  {deliveryLocation}
                </p>
              </div>

              <div className="bg-[#f9fff9] border border-green-200 p-4 rounded-xl">
                <div className="flex items-center gap-2 mb-1">
                  <CarOutlined className="text-green-500" />
                  <span className="font-semibold">Vận chuyển</span>
                </div>
                <p>Phí ship: {Number(slr.shippingFee).toLocaleString()} VND</p>
              </div>
            </div>
          ))}

          <div className="text-right border-t pt-4">
            <p className="font-semibold text-lg">Tổng tiền:</p>
            <p className="text-3xl font-bold text-[#0F74C7]">{total.toLocaleString()} VND</p>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md p-8 space-y-6 sticky top-8">
          <Radio.Group value={method} onChange={(e) => setMethod(e.target.value as PaymentProvider)} className="space-y-4 w-full">
            <div
              className={`p-4 rounded-xl flex justify-between cursor-pointer border ${method === PaymentProvider.PAYOS ? "border-blue-500 bg-blue-50" : "border-gray-200"}`}
              onClick={() => setMethod(PaymentProvider.PAYOS)}
            >
              <div className="flex items-center gap-3">
                <div className="p-3 bg-blue-100 rounded-full">
                  <CreditCardOutlined className="text-blue-600" />
                </div>
                <div>
                  <p className="font-medium">Thanh toán PayOS</p>
                  <p className="text-sm text-gray-500">Thanh toán qua ngân hàng</p>
                </div>
              </div>
              <Radio value={PaymentProvider.PAYOS} />
            </div>

            <div
              className={`p-4 rounded-xl flex justify-between cursor-pointer border ${method === PaymentProvider.WALLET ? "border-blue-500 bg-blue-50" : "border-gray-200"}`}
              onClick={() => setMethod(PaymentProvider.WALLET)}
            >
              <div className="flex items-center gap-3">
                <div className="p-3 bg-blue-100 rounded-full">
                  <WalletOutlined className="text-blue-600" />
                </div>
                <div>
                  <p className="font-medium">Ví nội bộ ChargeX</p>
                  {method === PaymentProvider.WALLET && wallet && (
                    <p className="text-sm mt-2">
                      Số dư: <span className="font-bold text-blue-600">{wallet.available.toLocaleString()} ₫</span>
                    </p>
                  )}
                  {wallet && wallet.available < total && (
                    <p className="text-sm text-red-500 mt-1">Số dư không đủ!</p>
                  )}
                </div>
              </div>
              <Radio value={PaymentProvider.WALLET} />
            </div>
          </Radio.Group>

          <button
            className={`w-full py-3 rounded-lg text-lg font-medium text-white transition ${
              processing || isWalletInsufficient ? "bg-gray-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"
            }`}
            onClick={handlePayment}
            disabled={processing || isWalletInsufficient}
          >
            {processing ? "Đang xử lý..." : "Xác nhận thanh toán"}
          </button>

          <button onClick={() => navigate(-1)} className="w-full py-3 rounded-lg border text-gray-700 flex items-center justify-center gap-2">
            <ArrowLeftOutlined />
            Quay lại
          </button>
        </div>
      </div>
    </div>
  );
}