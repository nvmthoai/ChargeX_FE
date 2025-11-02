import { useCallback } from "react";
import useApiService from "../hooks/useApi";
import { HTTP_METHOD } from "../constants/enum";

const auctionService = () => {
  const { callApi, loading, setIsLoading } = useApiService();

  const sendRequestCreateAuction = useCallback(
    async (sellerId: string, productId: string, note: string) => {
      const values = { productId: productId, note: note };
      try {
        const response = await callApi(
          HTTP_METHOD.POST,
          `/auction/request/${sellerId}`,
          { ...values }
        );
        return response;
      } catch (e: any) {
        console.log(e?.response?.data);
      }
    },
    [callApi]
  );

  const adminGetRequestCreateAuction = useCallback(async () => {
    try {
      const response = await callApi(HTTP_METHOD.GET, `/auction/requests`);
      return response;
    } catch (e: any) {
      console.log(e?.response?.data);
    }
  }, [callApi]);

  const adminHandleApproveRequest = useCallback(
    async (adminId: string, values: any) => {
      try {
        const response = await callApi(
          HTTP_METHOD.POST,
          `/auction/approve/${adminId}`,
          { ...values }
        );
        return response;
      } catch (e: any) {
        console.log(e?.response?.data);
      }
    },
    [callApi]
  );

  const adminGetAuctions = useCallback(async () => {
    try {
      const response = await callApi(HTTP_METHOD.GET, `/auction/ids`);
      return response;
    } catch (e: any) {
      console.log(e?.response?.data);
    }
  }, [callApi]);

  const adminCreateLive = useCallback(
    async (id: string) => {
      try {
        const response = await callApi(HTTP_METHOD.POST, `/auction/${id}/live`);
        return response;
      } catch (e: any) {
        console.log(e?.response?.data);
        // Rethrow so callers can access the error details and show useful messages
        throw e;
      }
    },
    [callApi]
  );

  return {
    loading,
    setIsLoading,
    sendRequestCreateAuction,
    adminGetRequestCreateAuction,
    adminHandleApproveRequest,
    adminGetAuctions,
    adminCreateLive,
  };
};

export default auctionService;
