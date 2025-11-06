// ===============================
// ⚙️ ORDER STATUS CONFIG (Final logic - no pending, no shipper)
// ===============================

import { OrderStatus } from "../../api/order/type";

export interface OrderAction {
  key: string;
  label: string;
  nextStatus?: OrderStatus;
  variant?: "primary" | "danger" | "default";
}

export const orderActions: Record<
  OrderStatus,
  { buyer: OrderAction[]; seller: OrderAction[] }
> = {
  // 🟩 1. PAID
  [OrderStatus.PAID]: {
    buyer: [
      {
        key: "cancel",
        label: "Hủy đơn",
        nextStatus: OrderStatus.CANCELLED,
        variant: "danger",
      },
    ],
    seller: [
      {
        key: "confirmShipping",
        label: "Xác nhận giao hàng",
        nextStatus: OrderStatus.IN_TRANSIT,
        variant: "primary",
      }
    ],
  },

  // 🟦 2. IN_TRANSIT
  [OrderStatus.IN_TRANSIT]: {
    buyer: [],
    seller: [
      {
        key: "markDelivered",
        label: "Đã giao xong",
        nextStatus: OrderStatus.DELIVERED_PENDING_CONFIRM,
        variant: "primary",
      },
    ],
  },

  // 🟪 3. DELIVERED_PENDING_CONFIRM
  [OrderStatus.DELIVERED_PENDING_CONFIRM]: {
    buyer: [
      {
        key: "confirmReceived",
        label: "Xác nhận đã nhận hàng",
        nextStatus: OrderStatus.DELIVERED,
        variant: "primary",
      },
      {
        key: "dispute",
        label: "Khiếu nại",
        nextStatus: OrderStatus.DISPUTED,
        variant: "danger",
      },
    ],
    seller: [],
  },

  // 🟩 4. DELIVERED
  [OrderStatus.DELIVERED]: {
    buyer: [],
    seller: [
      {
        key: "completeOrder",
        label: "Hoàn tất giao dịch",
        nextStatus: OrderStatus.COMPLETED,
        variant: "primary",
      },
    ],
  },

  // 🟨 5. COMPLETED
  [OrderStatus.COMPLETED]: { buyer: [], seller: [] },

  // 🟥 6. REFUNDED
  [OrderStatus.REFUNDED]: { buyer: [], seller: [] },

  // 🟧 7. DISPUTED
  [OrderStatus.DISPUTED]: { buyer: [], seller: [] },

  // 🩶 8. CANCELLED
  [OrderStatus.CANCELLED]: { buyer: [], seller: [] },

  // ❄️ Không sử dụng nhưng giữ đồng bộ enum
  [OrderStatus.PENDING]: { buyer: [], seller: [] },
  [OrderStatus.HANDED_TO_CARRIER]: { buyer: [], seller: [] },
};
