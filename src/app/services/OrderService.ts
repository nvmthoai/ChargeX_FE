import { useCallback } from "react";
import useApiService from "../hooks/useApi";
import { HTTP_METHOD } from "../constants/enum";

const orderService = () => {
  const { callApi, loading, setIsLoading } = useApiService();

  const getAllOrders = useCallback(
    async () => {
      try {
        const response = await callApi(HTTP_METHOD.GET, `/orders?page=1&limit=50`);
        return response;
      } catch (e: any) {
        console.log(e?.response?.data);
      }
    },
    [callApi]
  );

  return {
    loading,
    getAllOrders,
    setIsLoading,
  };
};

export default orderService;
