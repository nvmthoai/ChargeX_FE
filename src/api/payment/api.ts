import axiosInstance from "../../app/config/axios";
import type {
  Payment,
  CreatePaymentRequest,
  UpdatePaymentRequest,
  PayosWebhookPayload,
} from "./type";


export const createPaymentForOrder = async (
  payload: CreatePaymentRequest
): Promise<Payment> => {
  try {
    const res = await axiosInstance.post("/v1/payment/order", payload);
    console.log("✅ Payment created:", res.data);
    return res.data;
  } catch (err) {
    console.error("❌ Error creating payment:", err);
    throw err;
  }
};


export const getAllPayments = async (): Promise<Payment[]> => {
  try {
    const res = await axiosInstance.get("/v1/payment");
    console.log("✅ All payments:", res.data);
    return res.data;
  } catch (err) {
    console.error("❌ Error fetching payments:", err);
    throw err;
  }
};


export const getPaymentById = async (id: string): Promise<Payment> => {
  try {
    const res = await axiosInstance.get(`/v1/payment/${id}`);
    console.log(`✅ Payment ${id}:`, res.data);
    return res.data;
  } catch (err) {
    console.error(`❌ Error fetching payment ${id}:`, err);
    throw err;
  }
};


export const updatePayment = async (
  id: string,
  payload: UpdatePaymentRequest
): Promise<Payment> => {
  try {
    const res = await axiosInstance.patch(`/v1/payment/${id}`, payload);
    console.log(`✅ Updated payment ${id}:`, res.data);
    return res.data;
  } catch (err) {
    console.error(`❌ Error updating payment ${id}:`, err);
    throw err;
  }
};


export const deletePayment = async (id: string): Promise<void> => {
  try {
    await axiosInstance.delete(`/v1/payment/${id}`);
    console.log(`🗑️ Deleted payment ${id}`);
  } catch (err) {
    console.error(`❌ Error deleting payment ${id}:`, err);
    throw err;
  }
};


export const handlePayosWebhook = async (
  payload: PayosWebhookPayload
): Promise<any> => {
  try {
    const res = await axiosInstance.post("/v1/payment/webhook/payos", payload);
    console.log("📩 Webhook processed:", res.data);
    return res.data;
  } catch (err) {
    console.error("❌ Error handling PayOS webhook:", err);
    throw err;
  }
};
