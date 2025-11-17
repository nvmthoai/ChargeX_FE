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
  PrinterOutlined
} from "@ant-design/icons";
import dayjs from "dayjs";
import { orderActions } from "../../config/order-status-config";
import OrderTracking from "./component/OrderTracking";
// import OrderStatusActions from "./component/OrderStatusActions";

export default function OrderDetail() {
  const { id } = useParams<{ id: string }>();
  const [order, setOrder] = useState<Order | null>(null);
  const [events, setEvents] = useState<OrderEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // 🧩 Fetch order + events song song
  useEffect(() => {
    if (!id) return;
    const fetchData = async () => {
      try {
        const [orderRes, eventRes] = await Promise.all([
          getOrderById(id),
          getOrderEventsByOrderId(id),
        ]);
        setOrder(orderRes);
        setEvents(eventRes);
      } catch (err) {
        console.error("❌ Error fetching order or events:", err);
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
  const currentUser = JSON.parse(localStorage.getItem("user") || "{}");

  // ✅ Dùng field 'sub' làm userId
  const currentUserId = currentUser?.sub;

  // ✅ Lấy sellerId từ đơn hàng
  const sellerId = order.orderShops?.[0]?.seller?.userId;

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
      let updatedOrder;

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
        await updateOrder(order.orderId, {
          status: action.nextStatus,
          eventNote: `${action.label} bởi người dùng`,
        });
        updatedOrder = { ...order, status: action.nextStatus };
      }

      setOrder(updatedOrder);

      // 🟢 Reload events sau khi update
      const eventRes = await getOrderEventsByOrderId(order.orderId);
      setEvents(eventRes);

      message.success(`✅ ${action.label} thành công`);
    } catch (err) {
      console.error(err);
      message.error(`❌ ${action.label} thất bại`);
    }
  };


  // 🧮 Tính toán dữ liệu cơ bản
  const total = Number(order.totalPrice) + Number(order.totalShippingFee);
  const seller = order.orderShops?.[0]?.seller;
  console.log("here is seller", seller);

  const product = order?.orderShops?.[0]?.orderDetails?.[0]?.product;
  console.log("here is product", product);

  return (
    <div className="max-w-4xl mx-auto p-16 my-10 space-y-6 border border-gray-200 rounded-2xl bg-white">

      {/* 🔙 Back */}
      <Button
        icon={<ArrowLeftOutlined />}
        type="link"
        onClick={() => navigate(-1)}
      >
        Back to Orders
      </Button>

      {/* Header */}
      <div className=" p-8 ">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Order #{order.orderId}
            </h1>

            <p className="text-gray-500 mt-1">
              {dayjs(order.createdAt).format("DD MMM, YYYY")}
            </p>

            <div className="mt-2">
              <span className="font-medium text-gray-600">Status: </span>
              <span className="capitalize text-blue-600 font-semibold">
                {order.status}
              </span>
            </div>
          </div>

          <Button
            icon={<PrinterOutlined />}
            className="bg-black text-white rounded-lg px-5 py-2"
            onClick={() => window.print()}
          >
            Print Invoice
          </Button>
        </div>
      </div>

      {/* ✅ Order Tracking (dựa theo OrderEvent) */}
      <OrderTracking events={events} />

      {/* 📦 Order Status Actions */}
      {/* <OrderStatusActions
        order={order}
        role={role}
        onStatusChange={handleAction}
        loading={loading}
      /> */}

      {/* 🛒 Products */}
      <div className="p-8 border-b border-gray-200">
        <h3 className="text-lg font-semibold mb-6">Products</h3>


        <div className="space-y-6">
          {order.orderShops?.[0]?.orderDetails?.map((detail) => (
        <div
          key={detail.orderDetailId}
          className="flex justify-between items-center border-b pb-6 last:border-b-0 last:pb-0"
        >
          <div className="flex gap-4">
            <img
          src={detail.product?.imageUrl?.[0]}
          alt={detail.product?.name}
          className="w-20 h-20 object-cover rounded-md border"
            />

                <div>
                  <h4 className="font-medium text-gray-800">
                    {detail.product?.name}
                  </h4>
                  <p className="text-gray-500 text-sm line-clamp-2">
                    {detail.product?.description}
                  </p>

                  <p className="text-sm mt-1 text-gray-600">
                    Qty: {detail.quantity}
                  </p>
                </div>
              </div>

              <div className="text-right font-medium text-gray-800">
                {Number(detail.price).toLocaleString()} VNDz
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 🧾 Shipping Information */}
      <div className="p-8 border-b border-gray-200">
        <h3 className="text-lg font-semibold mb-4">Shipping Information</h3>

        <div className="grid grid-cols-2 gap-8">

          <div>
            <p className="text-gray-500 text-sm">Recipient Name</p>
            <p className="font-medium">{order?.receiverName}</p>

            <p className="text-gray-500 text-sm mt-4">Phone Number</p>
            <p className="font-medium">{order?.receiverPhone}</p>
          </div>

          <div>
            <p className="text-gray-500 text-sm">Shipping Address</p>
            <p className="font-medium">{order.deliveryAddress?.line1}</p>

            <p className="text-gray-500 text-sm mt-4">Shipping Method</p>
            <p className="font-medium">Standard Shipping (3–5 days)</p>
          </div>

        </div>
      </div>

      {/* 💳 Payment Details */}
      <div className="p-8 border-b border-gray-200">
        <h3 className="text-lg font-semibold mb-4">Payment Details</h3>

        <div className="grid grid-cols-2 gap-8">

          <div>
            <p className="text-gray-500 text-sm">Payment Method</p>
            <p className="font-medium">COD</p>
          </div>

          <div>
            <p className="text-gray-500 text-sm">Billing Address</p>
            <p className="font-medium">{order.deliveryAddress?.line1}</p>
          </div>

        </div>
      </div>

      {/* 💵 Order Summary */}
      <div className="p-8">
          <h3 className="text-lg font-semibold mb-4">Order Summary</h3>

        <div className="space-y-3 text-gray-700">

          <div className="flex justify-between">
            <span>Subtotal</span>
            <span>{Number(order.totalPrice).toLocaleString()} VND</span>
          </div>

          <div className="flex justify-between">
            <span>Shipping Fee</span>
            <span>{Number(order.totalShippingFee).toLocaleString()} VND</span>
          </div>

          <div className="flex justify-between font-semibold border-t border-gray-300 pt-4 text-lg">
            <span>Total</span>
            <span className="text-green-600">{total.toLocaleString()} VND</span>
          </div>

        </div>
      </div>

      {/* 🟡 Action Buttons */}
      {actions.length > 0 && (
        <div className="flex justify-center gap-4 mt-6">
          {actions.map((a) => (
            <Button
              key={a.key}
              type={a.variant === "primary" ? "primary" : "default"}
              danger={a.variant === "danger"}
              onClick={() => handleAction(a.key)}
              className="px-6 py-2 rounded-lg"
            >
              {a.label}
            </Button>
          ))}
        </div>
      )}

    </div>
  );

}
