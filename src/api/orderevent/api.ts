import axiosInstance from "../../app/config/axios";
import type {
  OrderEvent,
  CreateOrderEventRequest,
} from "./type";

// 🟩 Tạo event mới (log trạng thái đơn hàng)
export const createOrderEvent = async (
  payload: CreateOrderEventRequest
): Promise<OrderEvent> => {
  try {
    const res = await axiosInstance.post("/order-events", payload);
    console.log("✅ Created OrderEvent:", res.data?.data?.data);
    return res.data?.data?.data ?? res.data?.data;
  } catch (err) {
    console.error("❌ Error creating order event:", err);
    throw err;
  }
};

// 🟦 Lấy danh sách event theo orderId
export const getOrderEventsByOrderId = async (
  orderId: string
): Promise<OrderEvent[]> => {
  try {
    const res = await axiosInstance.get(`/order-events/${orderId}/order`);
    console.log(`✅ Order events for ${orderId}:`, res.data?.data?.data);
    return res.data?.data?.data ?? res.data?.data ?? [];
  } catch (err) {
    console.error(`❌ Error fetching events for order ${orderId}:`, err);
    throw err;
  }
};

