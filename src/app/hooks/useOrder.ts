import { useState, useEffect } from "react";
import orderService from "../services/OrderService";
import type { Order } from "../models/order.model";

const useOrder = () => {
  const [orders, setOrders] = useState<Order[]>([]);

  const { getAllOrders } = orderService()
  ;
  useEffect(() => {
    fetchAllOrders();
  }, []);

  const fetchAllOrders = async () => {
    const response = await getAllOrders();
    if (response) {
      setOrders(response.data.data);
    }
  };

  return {
    orders,
  };
};

export default useOrder;
