import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getOrderById, updateOrder } from "../../../api/order/api";
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
      await updateOrder(order.orderId, {
        status: action.nextStatus,
        eventNote: `${action.label} bởi người dùng`, // 🆕 thêm dòng này
      });
      setOrder({ ...order, status: action.nextStatus });

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
  const product = order.orderShops?.[0]?.orderDetails?.[0]?.product;

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

      {/* ✅ Order Tracking (dựa theo OrderEvent) */}
      <OrderTracking events={events} />

      {/* Order Items */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold mb-4">Order Items</h3>
        <div className="divide-y divide-gray-200">
          <div className="flex justify-between items-center py-4">
            <div className="flex gap-4">
              <img
                src={product?.imageUrls?.[0]}
                alt={product?.title}
                className="w-20 h-20 object-cover rounded-md border"
              />
              <div>
                <h4 className="font-medium text-gray-800">{product?.title}</h4>
                <p className="text-sm text-gray-500">{product?.description}</p>
              </div>
            </div>
            <p className="font-medium text-gray-700 text-right">
              ${Number(order.totalPrice).toLocaleString()}
            </p>
          </div>
        </div>
      </div>

      {/* Payment Summary */}
      <div className="border-t pt-5">
        <div className="flex justify-between mb-2 text-gray-600">
          <span>Subtotal</span>
          <span>${Number(order.totalPrice).toLocaleString()}</span>
        </div>
        <div className="flex justify-between mb-2 text-gray-600">
          <span>Shipping Charge</span>
          <span>${Number(order.totalShippingFee).toLocaleString()}</span>
        </div>
        <div className="flex justify-between mb-2 text-gray-600">
          <span>Tax Fee</span>
          <span>$0</span>
        </div>
        <div className="flex justify-between text-lg font-semibold mt-3 border-t pt-3">
          <span>Total</span>
          <span className="text-green-600">${total.toLocaleString()}</span>
        </div>
      </div>

      {/* Delivery Info */}
      <div className="mt-10">
        <h3 className="text-lg font-semibold mb-3">Delivery Address</h3>
        <div className="bg-gray-50 p-4 rounded-lg border">
          <p>{order.deliveryAddress?.fullName}</p>
          <p>{order.deliveryAddress?.line1}</p>
          <p>{order.deliveryAddress?.phone}</p>
        </div>
      </div>

      {/* Buyer / Seller Info */}
      <div className="grid grid-cols-2 gap-6 mt-8">
        <div className="bg-gray-50 p-4 rounded-lg border">
          <h4 className="font-semibold text-[#0F74C7] mb-2">
            Buyer Information
          </h4>
          <p>{order.buyer?.fullName}</p>
          <p>{order.buyer?.phone}</p>
          <p>{order.buyer?.email}</p>
        </div>
        <div className="bg-gray-50 p-4 rounded-lg border">
          <h4 className="font-semibold text-[#0F74C7] mb-2">
            Seller Information
          </h4>
          <p>{seller?.fullName}</p>
          <p>{seller?.phone}</p>
          <p>{seller?.email}</p>
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
            Back to Profile
          </Button>
        </div>
      </div>
    </div>
  );
}
