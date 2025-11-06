import type { OrderStatus } from "../order/type";

export interface OrderEvent {
  orderEventId: string;
  orderId: string;
  status: OrderStatus;
  note?: string;
  createdById?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateOrderEventRequest {
  orderId: string;
  status: OrderStatus;
  note?: string;
  createdById?: string;
}
