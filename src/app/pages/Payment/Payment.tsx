import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Spin, message, Radio, Button, Card } from "antd";
import { createPaymentForOrder } from "../../../api/payment/api";
import { PaymentProvider } from "../../../api/payment/type";
import type { Payment } from "../../../api/payment/type";
import { getOrderById } from "../../../api/order/api";
import type { Order } from "../../../api/order/type";

export default function PaymentPage() {
  const [params] = useSearchParams();
  const orderId = params.get("orderId");
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [order, setOrder] = useState<Order | null>(null);
  const [method, setMethod] = useState<PaymentProvider>(PaymentProvider.PAYOS);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    if (!orderId) {
      message.error("Thiếu mã đơn hàng!");
      navigate("/shop");
      return;
    }

    (async () => {
      try {
        const data = await getOrderById(orderId);
        console.log("✅ Order detail:", data);
        setOrder(data);
      } catch (err) {
        console.error("❌ Error fetching order:", err);
        message.error("Không thể tải thông tin đơn hàng!");
      } finally {
        setLoading(false);
      }
    })();
  }, [orderId, navigate]);

  const handlePayment = async () => {
    if (!order) return message.warning("Không tìm thấy đơn hàng!");
    setProcessing(true);

    try {
      const payload = {
        type: "pay_order" as const,
        amount: order.price || 0,
        description: `Thanh toán đơn hàng #${order.orderId}`,
        related_order_id: order.orderId,
        provider: method,
        method: "bank",
        returnUrl: `${window.location.origin}/payment-success?orderId=${order.orderId}`,
        cancelUrl: `${window.location.origin}/payment-cancel?orderId=${order.orderId}`,
        webhookUrl: "https://yoursite.com/webhook/payos",
      };

      console.log("📦 Creating payment with payload:", payload);
      const payment: Payment = await createPaymentForOrder(payload);

      if (payment?.checkoutUrl) {
        message.success("Đang chuyển đến cổng thanh toán...");
        window.location.href = payment.checkoutUrl;
        console.log("➡ Redirecting to payment URL:", payment.checkoutUrl);
      } else {
        message.error("Không nhận được đường dẫn thanh toán!");
      }
    } catch (err) {
      console.error("❌ Error creating payment:", err);
      message.error("Không thể tạo thanh toán!");
    } finally {
      setProcessing(false);
    }
  };

  if (loading)
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Spin size="large" />
      </div>
    );

  if (!order)
    return (
      <div className="flex flex-col items-center justify-center min-h-screen text-gray-600">
        <p>Không tìm thấy đơn hàng.</p>
      </div>
    );

  return (
    <div className="min-h-screen bg-gray-50 py-12 flex justify-center">
      <Card
        title={<span className="text-[#0F74C7] text-2xl font-semibold">Thanh toán đơn hàng</span>}
        className="max-w-lg w-full shadow-lg rounded-xl"
      >
        <div className="space-y-4 text-gray-800">
          <p><span className="font-semibold">Mã đơn hàng:</span> {order.orderId}</p>
          <p><span className="font-semibold">Người mua:</span> {order.buyer?.fullName}</p>
          <p><span className="font-semibold">Tổng tiền:</span> {Number(order.price).toLocaleString()} ₫</p>

          <div className="border-t pt-4">
            <h3 className="font-semibold mb-2">Chọn hình thức thanh toán</h3>
            <Radio.Group
              onChange={(e) => setMethod(e.target.value)}
              value={method}
              className="space-y-2 flex flex-col"
            >
              <Radio value={PaymentProvider.PAYOS}>Thanh toán qua PayOS</Radio>
              <Radio value={PaymentProvider.WALLET}>Thanh toán bằng ví nội bộ</Radio>
              <Radio value={"cod"} disabled>Thanh toán khi nhận hàng (COD)</Radio>
            </Radio.Group>
          </div>

          <Button
            type="primary"
            size="large"
            block
            onClick={handlePayment}
            disabled={processing}
            className="bg-[#0F74C7] hover:bg-[#3888ca] mt-4"
          >
            {processing ? "Đang xử lý..." : "Tiến hành thanh toán"}
          </Button>

          <Button block size="large" onClick={() => navigate(-1)} className="mt-2">
            Quay lại
          </Button>
        </div>
      </Card>
    </div>
  );
}
