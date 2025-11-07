import { useCallback } from "react";
import useApiService from "../hooks/useApi";
import { HTTP_METHOD } from "../constants/enum";

const reviewService = () => {
  const { callApi, loading, setIsLoading } = useApiService();


  const createReview = useCallback(
    async (values: any) => {
      try {
        const response = await callApi(HTTP_METHOD.POST, `/reviews`, {...values});
        return response;
      } catch (e: any) {
        console.log(e?.response?.data);
      }
    },
    [callApi]
  );

  return {
    loading,
    setIsLoading,
    createReview
  };
};

export default reviewService;
