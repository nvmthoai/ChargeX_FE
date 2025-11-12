import axiosInstance from "../../app/config/axios";
import type {
  Payment,
  CreatePaymentRequest,
  UpdatePaymentRequest,
} from "./type";


export const createPaymentForOrder = async (
  payload: CreatePaymentRequest
): Promise<Payment> => {
  try {
    const res = await axiosInstance.post("/payment/order", payload);
    console.log("✅ Payment created:", res.data);
    // 🟦 Backend thường bọc data trong { success, data, ... }
    return res.data.data || res.data;
  } catch (err) {
    console.error("❌ Error creating payment:", err);
    throw err;
  }
};


export const getAllPayments = async (): Promise<Payment[]> => {
  try {
    const res = await axiosInstance.get("/payment");
    console.log("✅ All payments:", res.data);
    return res.data;
  } catch (err) {
    console.error("❌ Error fetching payments:", err);
    throw err;
  }
};


export const getPaymentById = async (id: string): Promise<Payment> => {
  try {
    const res = await axiosInstance.get(`/payment/${id}`);
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
    const res = await axiosInstance.patch(`/payment/${id}`, payload);
    console.log(`✅ Updated payment ${id}:`, res.data);
    return res.data;
  } catch (err) {
    console.error(`❌ Error updating payment ${id}:`, err);
    throw err;
  }
};


export const deletePayment = async (id: string): Promise<void> => {
  try {
    await axiosInstance.delete(`/payment/${id}`);
    console.log(`🗑️ Deleted payment ${id}`);
  } catch (err) {
    console.error(`❌ Error deleting payment ${id}:`, err);
    throw err;
  }
};


export const payOrderWithWallet = async (
  orderId: string,
  amount: number
): Promise<unknown> => {
  try {
    const res = await axiosInstance.post("/wallet/pay-order", {
      orderId,
      amount,
    });
    console.log("✅ Wallet payment result:", res.data);
    return res.data as unknown;
  } catch (err) {
    console.error("❌ Error paying with wallet:", err);
    throw err;
  }
};


export const getWalletAvailable = async (): Promise<{
  balance: number;
  held: number;
  available: number;
}> => {
  try {
    const res = await axiosInstance.get("/wallet/available");
    console.log("💰 Wallet available:", res.data);
    return res.data.data;
  } catch (err) {
    console.error("❌ Error fetching wallet balance:", err);
    throw err;
  }
};
