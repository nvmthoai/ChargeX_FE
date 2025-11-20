import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  getOrderById,
  updateOrder,
  markOrderAsDelivered,
  markOrderAsCompleted,
} from "../../../api/order/api";
import { getOrderEventsByOrderId } from "../../../api/orderevent/api";
import type { Order } from "../../../api/order/type";
import type { OrderEvent } from "../../../api/orderevent/type";
import { Spin, Button, message } from "antd";
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

  // 🧩 Fetch order + events song song and always scroll to top on mount
  useEffect(() => {
    if (!id) return;
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
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
        console.error("❌ Error fetching order or events:", err);
        setOrder(null);
        setEvents([]);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  // 🌀 Loading state
  if (loading)
    return (
      <div className="flex justify-center items-center h-[60vh]">
        <Spin size="large" />
      </div>
    );

  // ❌ Order not found
  if (!order)
    return (
      <div className="p-8 text-center text-gray-500">
        <p>Order not found.</p>
        <Button onClick={() => navigate(-1)} icon={<ArrowLeftOutlined />}>
          Back
        </Button>
      </div>
    );

  // ✅ Lấy user object từ localStorage
  const currentUser = JSON.parse(localStorage.getItem("user") || "null") || null;

  // ✅ Dùng field 'sub' làm userId
  const currentUserId = (currentUser && (currentUser.sub || currentUser.id)) || null;

  // ✅ Lấy sellerId từ đơn hàng
  const sellerId = order.orderShops?.[0]?.seller?.userId || null;

  // ✅ So sánh để xác định vai trò
  const isSeller = sellerId === currentUserId;
  const role = isSeller ? "seller" : "buyer";
  const actions = orderActions[order.status]?.[role] ?? [];


  // ⚙️ Action handler (update status)
  const handleAction = async (key: string) => {
    const action = actions.find((a) => a.key === key);
    if (!action) return;

    if (key === "review") {
      navigate(`/review/${order.orderId}`);
      return;
    }

    if (!action.nextStatus) return;

    try {
      let updatedOrder: any = order;

      // 📦 Use specialized API for delivery confirmation
      if (key === "markDelivered") {
        updatedOrder = await markOrderAsDelivered(order.orderId, "Package delivered to buyer");
      }
      // ✅ Use specialized API for completion confirmation
      else if (key === "completeOrder") {
        updatedOrder = await markOrderAsCompleted(order.orderId, "Order completed - buyer confirmed receipt");
      }
      // 📝 Use generic update for other statuses
      else {
        const res = await updateOrder(order.orderId, {
          status: action.nextStatus,
          eventNote: `${action.label} bởi người dùng`,
        });
        updatedOrder = res || { ...order, status: action.nextStatus };
      }

      setOrder(updatedOrder);

      // 🟢 Reload events sau khi update
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
    <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-md my-10 p-20 border border-gray-200 relative">
      {/* Header */}
      <div className="flex justify-between items-start mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[#0F74C7]">
            Order #{order.orderId}
          </h1>
          <p className="text-gray-500">
            {order.createdAt ? dayjs(order.createdAt).format("DD MMM, YYYY") : "-"}
          </p>
          <p className="text-sm mt-1">
            <span className="font-semibold">Status:</span>{" "}
            <span className="capitalize">{order.status || "-"}</span>
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

      {/* ✅ Order Tracking (dựa theo OrderEvent) */}
      <OrderTracking events={events} />

      {/* NOTE: OrderStatusActions removed to avoid duplicate English buttons. */}

      {/* ============================
      📦 ORDER ITEMS
============================ */}
      <div className="mt-10">
        <h2 className="text-lg font-semibold border-b border-gray-300 mb-4">Order Items</h2>

        <div className="bg-white p-6">
          <div className="flex items-start gap-4">
            <img
              src={product?.imageUrl?.[0] || "/default_product.png"}
              alt={product?.name}
              className="w-20 h-20 rounded-lg object-cover border"
            />

            <div className="flex-1">
              <h3 className="font-medium text-gray-800">{product?.name}</h3>
              <p className="text-sm text-gray-500 mt-1">
                {product?.description || "No description"}
              </p>
            </div>

            <div className="text-right font-semibold text-gray-700">
              {Number(order.totalPrice).toLocaleString()} VND
            </div>
          </div>
        </div>
      </div>


      {/* ============================
      🚚 SHIPPING INFORMATION
============================ */}
      <div className="mt-10">
        <h2 className="text-lg font-semibold border-b border-gray-300 mb-4">Shipping Information</h2>

        <div className="bg-white p-6">
          <div className="grid grid-cols-2 gap-6">

            <div>
              <p className="text-sm text-gray-400">Recipient Name:</p>
              <p className="font-medium">{order.deliveryAddress?.fullName || "-"}</p>

              <p className="text-sm text-gray-400 mt-4">Phone Number:</p>
              <p className="font-medium">{order.deliveryAddress?.phone || "-"}</p>
            </div>

            <div>
              <p className="text-sm text-gray-400">Shipping Address:</p>
              <p className="font-medium">{order.deliveryAddress?.line1 || "-"}</p>

              <p className="text-sm text-gray-400 mt-4">Shipping Method:</p>
              <p className="font-medium">
                {order.shipping_provider || "Standard Shipping"}
              </p>
            </div>

          </div>
        </div>
      </div>


      {/* ============================
      💳 PAYMENT DETAILS
============================ */}
      <div className="mt-10">
        <h2 className="text-lg font-semibold border-b border-gray-300 mb-4">Payment Details</h2>

        <div className="bg-white p-6">
          <div className="grid grid-cols-2 gap-6">

            <div>
              <p className="text-sm text-gray-400">Payment Method:</p>
              <p className="font-medium">
                {order.payment?.method || "Wallet / Online Payment"}
              </p>
            </div>

            <div>
              <p className="text-sm text-gray-400">Billing Address:</p>
              <p className="font-medium">
                {order.deliveryAddress?.line1 || "-"}
              </p>
            </div>

          </div>
        </div>
      </div>


      {/* ============================
      🧾 ORDER SUMMARY
============================ */}
      <div className="mt-10">
        <h2 className="text-lg font-semibold border-b border-gray-300 mb-4">Order Summary</h2>

        <div className="bg-white p-6">

          <div className="flex justify-between py-2 text-gray-700">
            <span>Total:</span>
            <span>{Number(order.totalPrice).toLocaleString()} VND</span>
          </div>

          <div className="flex justify-between py-2 text-gray-700 border-b border-gray-400  pb-3">
            <span>Shipping Fee:</span>
            <span>{Number(order.totalShippingFee).toLocaleString()} VND</span>
          </div>

          <div className="flex justify-between py-4 text-lg font-bold text-gray-900">
            <span>Grand Total:</span>
            <span className="text-green-600">
              {(Number(order.totalPrice) + Number(order.totalShippingFee)).toLocaleString()} VND
            </span>
          </div>

        </div>
      </div>



      {/* Action Buttons */}
      {actions.length > 0 && (
        <div className="mt-10 flex justify-center gap-4 flex-wrap">
          {actions.map((a) => (
            <Button
              key={a.key}
              type={a.variant === "primary" ? "primary" : "default"}
              danger={a.variant === "danger"}
              icon={
                a.key === "confirmReceived" ? (
                  <CheckCircleFilled />
                ) : undefined
              }
              onClick={() => handleAction(a.key)}
            >
              {a.label}
            </Button>
          ))}
        </div>
      )}

      {/* Footer */}
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
