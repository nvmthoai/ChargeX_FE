import axiosInstance from "../../app/config/axios";


import type {
  Order,
  CreateOrderRequest,
  UpdateOrderRequest,
  OrderStatus,
} from "./type";


export const createOrder = async (
  buyerId: string,
  payload: CreateOrderRequest
): Promise<Order> => {
  try {
    const res = await axiosInstance.post(`/orders/${buyerId}`, payload);
    console.log("✅ Order created:", res.data?.data);
    return res.data?.data;
  } catch (err) {
    console.error("❌ Error creating order:", err);
    throw err;
  }
};


export interface GetOrdersParams {
  buyerId?: string;
  sellerId?: string;
  status?: OrderStatus;
  page?: number;
  limit?: number;
  sort?: string;
  order?: "ASC" | "DESC";
}

export const getAllOrders = async (
  params?: GetOrdersParams
): Promise<Order[]> => {
  try {
    const res = await axiosInstance.get("/orders", { params });
    console.log("✅ All orders:", res.data?.data?.data);
    return res.data?.data?.data;
  } catch (err) {
    console.error("❌ Error fetching orders:", err);
    throw err;
  }
};



export const getOrderById = async (id: string): Promise<Order> => {
  try {
    const res = await axiosInstance.get(`/orders/${id}`);
    console.log(`✅ Order ${id}:`, res.data?.data);
    return res.data?.data; // ✅ chỉ lấy phần data
  } catch (err) {
    console.error(`❌ Error fetching order ${id}:`, err);
    throw err;
  }
};



export const updateOrder = async (
  id: string,
  payload: UpdateOrderRequest
): Promise<Order> => {
  try {
    const res = await axiosInstance.patch(`/v1/orders/${id}`, payload);
    console.log(`✅ Updated order ${id}:`, res.data);
    return res.data;
  } catch (err) {
    console.error(`❌ Error updating order ${id}:`, err);
    throw err;
  }
};

export const deleteOrder = async (id: string): Promise<void> => {
  try {
    await axiosInstance.delete(`/v1/orders/${id}`);
    console.log(`🗑️ Deleted order ${id}`);
  } catch (err) {
    console.error(`❌ Error deleting order ${id}:`, err);
    throw err;
  }
};
