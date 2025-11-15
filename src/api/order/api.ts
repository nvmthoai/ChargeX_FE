import axiosInstance from "../../app/config/axios";
import type {
  Order,
  CreateOrderRequest,
  UpdateOrderRequest,
  GetOrdersParams,
} from "./type";

// 🟩 Tạo đơn hàng
export const createOrder = async (
  buyerId: string,
  payload: CreateOrderRequest
): Promise<Order> => {
  try {
    const res = await axiosInstance.post(`/orders/${buyerId}`, payload);
    console.log("✅ Order created:", res.data?.data?.data);
    return res.data?.data?.data || res.data?.data;
  } catch (err) {
    console.error("❌ Error creating order:", err);
    throw err;
  }
};

// 🟦 Lấy tất cả đơn hàng (hỗ trợ filter buyerId / sellerId / status / pagination)
export const getAllOrders = async (params?: GetOrdersParams): Promise<Order[]> => {
  try {
    const res = await axiosInstance.get("/orders", { params });
    console.log("✅ All orders:", res.data?.data?.data);
    return res.data?.data?.data ?? [];
  } catch (err) {
    console.error("❌ Error fetching orders:", err);
    throw err;
  }
};

// 🟨 Lấy đơn hàng theo ID
export const getOrderById = async (id: string): Promise<Order> => {
  try {
    const res = await axiosInstance.get(`/orders/${id}`);
    console.log(`✅ Order ${id}:`, res.data?.data);
    return res.data?.data;
  } catch (err) {
    console.error(`❌ Error fetching order ${id}:`, err);
    throw err;
  }
};

// 🟧 Cập nhật đơn hàng
export const updateOrder = async (
  id: string,
  payload: UpdateOrderRequest
): Promise<Order> => {
  try {
    const res = await axiosInstance.patch(`/orders/${id}`, payload);
    console.log(`✅ Updated order ${id}:`, res.data);
    return res.data?.data?.data ?? res.data;
  } catch (err) {
    console.error(`❌ Error updating order ${id}:`, err);
    throw err;
  }
};

// 🟥 Xóa đơn hàng
export const deleteOrder = async (id: string): Promise<void> => {
  try {
    await axiosInstance.delete(`/orders/${id}`);
    console.log(`🗑️ Deleted order ${id}`);
  } catch (err) {
    console.error(`❌ Error deleting order ${id}:`, err);
    throw err;
  }
};

// 📦 Đánh dấu đơn hàng đã giao hàng
export const markOrderAsDelivered = async (
  orderId: string,
  note?: string
): Promise<Order> => {
  try {
    const res = await axiosInstance.patch(
      `/orders/${orderId}/mark-as-delivered`,
      { note }
    );
    console.log(`✅ Order ${orderId} marked as delivered:`, res.data?.data);
    return res.data?.data ?? res.data;
  } catch (err) {
    console.error(`❌ Error marking order ${orderId} as delivered:`, err);
    throw err;
  }
};

// ✅ Đánh dấu đơn hàng đã hoàn thành
export const markOrderAsCompleted = async (
  orderId: string,
  note?: string
): Promise<Order> => {
  try {
    const res = await axiosInstance.patch(
      `/orders/${orderId}/mark-as-completed`,
      { note }
    );
    console.log(`✅ Order ${orderId} marked as completed:`, res.data?.data);
    return res.data?.data ?? res.data;
  } catch (err) {
    console.error(`❌ Error marking order ${orderId} as completed:`, err);
    throw err;
  }
};
