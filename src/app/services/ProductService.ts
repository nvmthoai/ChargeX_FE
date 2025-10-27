import { useCallback } from "react";
import useApiService from "../hooks/useApi";
import { HTTP_METHOD } from "../constants/enum";

const productService = () => {
  const { callApi, loading, setIsLoading } = useApiService();

  const getAllProduct = useCallback(
    async () => {
      try {
        const response = await callApi(HTTP_METHOD.GET, `/product-listing/all`);
        return response;
      } catch (e: any) {
        console.log(e?.response?.data);
      }
    },
    [callApi]
  );

  return {
    getAllProduct,
    loading,
    setIsLoading,
  };
};

export default productService;
