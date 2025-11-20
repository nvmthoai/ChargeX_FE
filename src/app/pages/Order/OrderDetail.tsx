import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  getOrderById,
  updateOrder,
  markOrderAsDelivered,
  markOrderAsCompleted,
  cancelOrder, // 🌟 THÊM API CANCEL
} from "../../../api/order/api";
import { getOrderEventsByOrderId } from "../../../api/orderevent/api";
import type { Order } from "../../../api/order/type";
import type { OrderEvent } from "../../../api/orderevent/type";
import { Spin, Button, message, Modal, Radio } from "antd"; // 🌟 THÊM Modal + Radio
import {
  ArrowLeftOutlined,
  PrinterOutlined,
  CheckCircleFilled,
} from "@ant-design/icons";
import dayjs from "dayjs";
import { orderActions } from "../../config/order-status-config";
import OrderTracking from "./component/OrderTracking";

export default function OrderDetail() {
  const { id } = useParams<{ id: string }>();
  const [order, setOrder] = useState<Order | null>(null);
  const [events, setEvents] = useState<OrderEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // 🌟 STATE CHO CANCEL
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelReason, setCancelReason] = useState("");

  const CANCEL_REASONS = [
    "Tôi đổi ý",
    "Thông tin sản phẩm không đúng",
    "Shop phản hồi chậm",
    "Tìm được giá rẻ hơn",
    "Thời gian giao hàng quá lâu",
    "Khác",
  ];

  // 🧩 Fetch order + events
  useEffect(() => {
    if (!id) return;
    window.scrollTo({ top: 0 });

    const fetchData = async () => {
      setLoading(true);
      try {
        const [orderRes, eventRes] = await Promise.all([
          getOrderById(id),
          getOrderEventsByOrderId(id),
        ]);
        setOrder(orderRes || null);
        setEvents(eventRes || []);
      } catch (err) {
        console.error("❌ Error fetching:", err);
        setOrder(null);
        setEvents([]);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  if (loading)
    return (
      <div className="flex justify-center items-center h-[60vh]">
        <Spin size="large" />
      </div>
    );

  if (!order)
    return (
      <div className="p-8 text-center text-gray-500">
        <p>Order not found.</p>
        <Button onClick={() => navigate(-1)} icon={<ArrowLeftOutlined />}>
          Back
        </Button>
      </div>
    );

  const currentUser = JSON.parse(localStorage.getItem("user") || "null");
  const currentUserId = currentUser?.sub || currentUser?.id || null;

  const sellerId = order.orderShops?.[0]?.seller?.userId || null;
  const isSeller = sellerId === currentUserId;
  const role = isSeller ? "seller" : "buyer";
  const actions = orderActions[order.status]?.[role] ?? [];

  // 🌟 HANDLE CANCEL ORDER
  const handleCancelOrder = async () => {
    if (!cancelReason) {
      message.error("Vui lòng chọn lý do hủy đơn");
      return;
    }
  
    try {
      // gọi API hủy đơn
      await cancelOrder(order.orderId, cancelReason);
  
      message.success("Đã hủy đơn hàng");
  
      // 🔥 FETCH LẠI ORDER TỪ SERVER
      const fresh = await getOrderById(order.orderId);
      setOrder(fresh);
  
      // 🔥 FETCH LẠI EVENTS
      const eventRes = await getOrderEventsByOrderId(order.orderId);
      setEvents(eventRes || []);
  
      setShowCancelModal(false);
    } catch (err) {
      console.error(err);
      message.error("Không thể hủy đơn hàng");
    }
  };
  

  // ⚙️ Action handler
  const handleAction = async (key: string) => {
    const action = actions.find((a) => a.key === key);
    if (!action) return;

    // 🌟 MỞ MODAL HỦY ĐƠN
    if (key === "cancel") {
      setShowCancelModal(true);
      return;
    }

    if (key === "review") {
      navigate(`/review/${order.orderId}`);
      return;
    }

    if (!action.nextStatus) return;

    try {
      let updatedOrder: any = order;

      if (key === "markDelivered") {
        updatedOrder = await markOrderAsDelivered(
          order.orderId,
          "Package delivered to buyer"
        );
      } else if (key === "completeOrder") {
        updatedOrder = await markOrderAsCompleted(
          order.orderId,
          "Order completed - buyer confirmed receipt"
        );
      } else {
        const res = await updateOrder(order.orderId, {
          status: action.nextStatus,
          eventNote: `${action.label} bởi người dùng`,
        });
        updatedOrder = res || { ...order, status: action.nextStatus };
      }

      setOrder(updatedOrder);

      const eventRes = await getOrderEventsByOrderId(order.orderId);
      setEvents(eventRes || []);

      message.success(`✅ ${action.label} thành công`);
    } catch (err) {
      console.error(err);
      message.error(`❌ ${action.label} thất bại`);
    }
  };

  const product = order.orderShops?.[0]?.orderDetails?.[0]?.product ?? null;

  return (
    <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-md my-10 p-10 border border-gray-200 relative">
      {/* Header */}
      <div className="flex justify-between items-start mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[#0F74C7]">
            Order #{order.orderId}
          </h1>
          <p className="text-gray-500">
            {dayjs(order.createdAt).format("DD MMM, YYYY")}
          </p>
          <p className="text-sm mt-1">
            <span className="font-semibold">Status:</span>{" "}
            <span className="capitalize">{order.status}</span>
          </p>
        </div>

        <Button
          icon={<PrinterOutlined />}
          className="bg-[#0F74C7] text-white hover:bg-blue-600"
          onClick={() => window.print()}
        >
          Print Invoice
        </Button>
      </div>

      {/* OrderTracking */}
      <OrderTracking events={events} />

      {/* ORDER ITEMS */}
      <div className="mt-10">
        <h2 className="text-lg font-semibold border-b mb-4">Order Items</h2>

        <div className="flex items-start gap-4 p-6">
          <img
            src={product?.imageUrl?.[0] || "/default_product.png"}
            className="w-20 h-20 rounded-lg object-cover border"
          />
          <div className="flex-1">
            <h3 className="font-medium text-gray-800">{product?.name}</h3>
            <p className="text-sm text-gray-500 mt-1">
              {product?.description || "No description"}
            </p>
          </div>
          <div className="text-right font-semibold text-gray-700">
            {order.totalPrice.toLocaleString()} VND
          </div>
        </div>
      </div>

      {/* SHIPPING INFO */}
      <div className="mt-10">
        <h2 className="text-lg font-semibold border-b mb-4">
          Shipping Information
        </h2>

        <div className="grid grid-cols-2 gap-6 p-6">
          <div>
            <p className="text-sm text-gray-400">Recipient Name:</p>
            <p className="font-medium">{order.deliveryAddress?.fullName}</p>

            <p className="text-sm text-gray-400 mt-4">Phone Number:</p>
            <p className="font-medium">{order.deliveryAddress?.phone}</p>
          </div>

          <div>
            <p className="text-sm text-gray-400">Shipping Address:</p>
            <p className="font-medium">{order.deliveryAddress?.line1}</p>

            <p className="text-sm text-gray-400 mt-4">Shipping Method:</p>
            <p className="font-medium">{order.shipping_provider}</p>
          </div>
        </div>
      </div>

      {/* PAYMENT INFO */}
      <div className="mt-10">
        <h2 className="text-lg font-semibold border-b mb-4">
          Payment Details
        </h2>

        <div className="grid grid-cols-2 gap-6 p-6">
          <div>
            <p className="text-sm text-gray-400">Payment Method:</p>
            <p className="font-medium">{order.payment?.method}</p>
          </div>

          <div>
            <p className="text-sm text-gray-400">Billing Address:</p>
            <p className="font-medium">{order.deliveryAddress?.line1}</p>
          </div>
        </div>
      </div>

      {/* SUMMARY */}
      <div className="mt-10">
        <h2 className="text-lg font-semibold border-b mb-4">Order Summary</h2>

        <div className="p-6">
          <div className="flex justify-between py-2">
            <span>Total:</span>
            <span>{order.totalPrice.toLocaleString()} VND</span>
          </div>

          <div className="flex justify-between py-2 border-b pb-3">
            <span>Shipping Fee:</span>
            <span>{order.totalShippingFee.toLocaleString()} VND</span>
          </div>

          <div className="flex justify-between py-4 text-lg font-bold">
            <span>Grand Total:</span>
            <span className="text-green-600">
              {(order.totalPrice + order.totalShippingFee).toLocaleString()}{" "}
              VND
            </span>
          </div>
        </div>
      </div>

      {/* ACTION BUTTONS */}
      {actions.length > 0 && (
        <div className="mt-10 flex justify-center gap-4 flex-wrap">
          {actions.map((a) => (
            <Button
              key={a.key}
              type={a.variant === "primary" ? "primary" : "default"}
              danger={a.variant === "danger"}
              icon={a.key === "confirmReceived" ? <CheckCircleFilled /> : null}
              onClick={() => handleAction(a.key)}
            >
              {a.label}
            </Button>
          ))}
        </div>
      )}

      {/* 🌟 CANCEL MODAL */}
      <Modal
        title="Chọn lý do hủy đơn"
        open={showCancelModal}
        onCancel={() => setShowCancelModal(false)}
        onOk={handleCancelOrder}
        okText="Xác nhận hủy"
        okButtonProps={{ danger: true }}
      >
        <Radio.Group
          value={cancelReason}
          onChange={(e) => setCancelReason(e.target.value)}
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 10,
            marginTop: 10,
          }}
        >
          {CANCEL_REASONS.map((r) => (
            <Radio key={r} value={r}>
              {r}
            </Radio>
          ))}
        </Radio.Group>
      </Modal>

      {/* FOOTER */}
      <div className="text-center mt-10 text-gray-500 text-sm">
        <p>
          Contract:{" "}
          <a
            href={order.contract_url ?? "#"}
            className="text-[#0F74C7] hover:underline"
          >
            View contract
          </a>
        </p>
        <p className="mt-2">
          This invoice was automatically generated by the FoundersHub system.
        </p>
        <div className="mt-6">
          <Button
            icon={<ArrowLeftOutlined />}
            onClick={() => navigate(-1)}
            className="rounded-full px-6 py-2"
          >
            Back
          </Button>
        </div>
      </div>
    </div>
  );
}
