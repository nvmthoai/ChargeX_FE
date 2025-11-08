import { useCallback } from "react";
import useApiService from "../hooks/useApi";
import { HTTP_METHOD } from "../constants/enum";

const reviewService = () => {
  const { callApi, loading, setIsLoading } = useApiService();

  const getMyReviews = useCallback(
    async (reviewerId: string, revieweeId: string) => {
      try {
        const response = await callApi(HTTP_METHOD.GET, `/reviews?reviewerId=${reviewerId}&revieweeId=${revieweeId}&page=1&limit=10`);
        return response;
      } catch (e: any) {
        console.log(e?.response?.data);
      }
    },
    [callApi]
  );

  const createReview = useCallback(
    async (values: any) => {
      try {
        const response = await callApi(HTTP_METHOD.POST, `/reviews`, { ...values });
        return response;
      } catch (e: any) {
        console.log(e?.response?.data);
      }
    },
    [callApi]
  );

  const updateReview = useCallback(
    async (values: any, id: string) => {
      try {
        const response = await callApi(HTTP_METHOD.PATCH, `/reviews/${id}`, { ...values });
        return response;
      } catch (e: any) {
        console.log(e?.response?.data);
      }
    },
    [callApi]
  );

  const deleteReview = useCallback(
    async (id: string) => {
      try {
        const response = await callApi(HTTP_METHOD.DELETE, `/reviews/${id}`);
        return response;
      } catch (e: any) {
        console.log(e?.response?.data);
      }
    },
    [callApi]
  );

  return {
    loading,
    getMyReviews,
    setIsLoading,
    createReview,
    updateReview,
    deleteReview
  };
};

export default reviewService;
