import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getOrderById } from "../../../../api/order/api";
import type { Order } from "../../../../api/order/type";
import { Spin, Button  } from "antd";
import { ArrowLeftOutlined, PrinterOutlined, CheckCircleFilled } from "@ant-design/icons";
import dayjs from "dayjs";

export default function OrderDetail() {
  const { id } = useParams<{ id: string }>();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (!id) return;
    getOrderById(id)
      .then((res) => setOrder(res))
      .catch((err) => console.error("❌ Error fetching order:", err))
      .finally(() => setLoading(false));
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

  const total = Number(order.totalPrice) + Number(order.totalShippingFee);

  return (
    <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-md my-10 p-10 border border-gray-200 relative">
      {/* Header */}
      <div className="flex justify-between items-start mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[#0F74C7]">
            Order #{order.orderId}
          </h1>
          <p className="text-gray-500">{dayjs(order.createdAt).format("DD MMM, YYYY")}</p>
        </div>

        <Button
          icon={<PrinterOutlined />}
          className="bg-[#0F74C7] text-white hover:bg-blue-600"
          onClick={() => window.print()}
        >
          Print Invoice
        </Button>
      </div>

      {/* Order Tracking */}
      <div className="bg-gray-50 p-5 rounded-xl mb-8">
        <h3 className="text-lg font-semibold mb-4">Order Tracking</h3>
        <div className="flex justify-between text-sm text-gray-600">
          {["Order Placed", "Picked", "Packed", "Order Shipped", "Order Delivered"].map(
            (label, index) => (
              <div key={index} className="flex flex-col items-center w-1/5">
                <CheckCircleFilled className="text-green-500 text-xl mb-1" />
                <span>{label}</span>
                <span className="text-xs text-gray-400 mt-1">
                  --/--/----
                </span>
              </div>
            )
          )}
        </div>
      </div>

      {/* Order Items */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold mb-4">Order Items</h3>
        <div className="divide-y divide-gray-200">
          {/* Hiện tại chỉ có 1 product -> nếu sau này có nhiều, map ở đây */}
          <div className="flex justify-between items-center py-4">
            <div className="flex gap-4">
              <img
                src={order.product?.imageUrls?.[0]}
                alt={order.product?.title}
                className="w-20 h-20 object-cover rounded-md border"
              />
              <div>
                <h4 className="font-medium text-gray-800">{order.product?.title}</h4>
                <p className="text-sm text-gray-500">
                  {order.product?.description}
                </p>
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

      {/* Buyer / Seller */}
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
          <p>{order.seller?.fullName}</p>
          <p>{order.seller?.phone}</p>
          <p>{order.seller?.email}</p>
        </div>
      </div>

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
