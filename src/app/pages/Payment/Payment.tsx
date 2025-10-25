// import { useEffect, useState } from "react";
// import { useSearchParams, useNavigate } from "react-router-dom";
// import { message, Radio, Modal } from "antd";
// import { getOrderById } from "../../../api/order/api";
// import { createPaymentForOrder } from "../../../api/payment/api";

// export default function Payment() {
//   const [params] = useSearchParams();
//   const orderId = params.get("orderId");
//   const navigate = useNavigate();

//   const [order, setOrder] = useState<any>(null);
//   const [method, setMethod] = useState("bank");
//   const [provider, setProvider] = useState("payos");
//   const [loading, setLoading] = useState(false);
//   const [showConfirm, setShowConfirm] = useState(false);

//   // 🟦 Load order info
//   useEffect(() => {
//     const fetchOrder = async () => {
//       try {
//         if (!orderId) return;
//         const data = await getOrderById(orderId);
//         setOrder(data);
//       } catch (error) {
//         console.error("❌ Error fetching order:", error);
//         message.error("Không thể tải thông tin đơn hàng!");
//       }
//     };
//     fetchOrder();
//   }, [orderId]);

//   // 🟢 Xử lý thanh toán
//   const handlePay = async () => {
//     if (!order) return;
//     setLoading(true);
//     try {
//       const payload = {
//         type: "pay_order",
//         amount: Number(order.price) + Number(order.shipping_fee || 0),
//         description: `Payment for order #${order.id}`,
//         related_order_id: order.id,
//         provider: provider,
//         method: method,
//         returnUrl: `${window.location.origin}/payment-success`,
//         cancelUrl: `${window.location.origin}/payment-error`,
//         webhookUrl: "https://yourdomain.com/webhook/payos",
//       };

//       console.log("📤 Creating payment:", payload);
//       const payment = await createPaymentForOrder(payload);

//       // Nếu là PayOS hoặc bank → redirect sang link cổng thanh toán
//       if (payment?.paymentUrl) {
//         window.location.href = payment.paymentUrl;
//       } else {
//         message.success("✅ Thanh toán thành công!");
//         navigate(`/payment-success?orderId=${order.id}`);
//       }
//     } catch (error) {
//       console.error("❌ Error creating payment:", error);
//       message.error("Không thể tạo thanh toán!");
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="min-h-screen bg-gray-50 py-10">
//       <div className="max-w-3xl mx-auto bg-white shadow-lg rounded-lg p-8 space-y-6">
//         <h1 className="text-3xl font-bold text-gray-900">Payment</h1>

//         {order ? (
//           <div className="space-y-4">
//             <div className="border rounded-lg p-5 bg-gray-50">
//               <h2 className="text-xl font-semibold mb-2">Order Summary</h2>
//               <p><b>Order ID:</b> {order.id}</p>
//               <p><b>Product:</b> {order.product?.title ?? "—"}</p>
//               <p><b>Amount:</b> ${(order.price).toLocaleString()}</p>
//               <p><b>Shipping Fee:</b> ${(order.shipping_fee).toLocaleString()}</p>
//               <p>
//                 <b>Total:</b>{" "}
//                 <span className="text-[#0F74C7] font-bold">
//                   ${(Number(order.price) + Number(order.shipping_fee)).toLocaleString()}
//                 </span>
//               </p>
//             </div>

//             <div className="border rounded-lg p-5 bg-gray-50">
//               <h2 className="text-xl font-semibold mb-2">Select Payment Method</h2>
//               <Radio.Group
//                 onChange={(e) => setMethod(e.target.value)}
//                 value={method}
//                 className="flex flex-col gap-3 mt-4"
//               >
//                 <Radio value="bank">Ngân hàng (PayOS)</Radio>
//                 <Radio value="wallet">Ví nội bộ</Radio>
//                 <Radio value="cod">Thanh toán khi nhận hàng (COD)</Radio>
//               </Radio.Group>
//             </div>

//             <button
//               onClick={() => setShowConfirm(true)}
//               disabled={loading}
//               className={`w-full py-3 rounded font-semibold text-white ${
//                 loading
//                   ? "bg-gray-400 cursor-not-allowed"
//                   : "bg-[#0F74C7] hover:bg-[#3888ca]"
//               }`}
//             >
//               {loading ? "Đang xử lý..." : "Tiếp tục thanh toán"}
//             </button>
//           </div>
//         ) : (
//           <div className="text-gray-500 italic">Đang tải đơn hàng...</div>
//         )}

//         {/* Modal xác nhận thanh toán */}
//         <Modal
//           title="Xác nhận thanh toán"
//           open={showConfirm}
//           onCancel={() => setShowConfirm(false)}
//           onOk={handlePay}
//           okText="Thanh toán"
//           confirmLoading={loading}
//           centered
//         >
//           <p>Bạn có chắc chắn muốn thanh toán đơn hàng này?</p>
//         </Modal>
//       </div>
//     </div>
//   );
// }
