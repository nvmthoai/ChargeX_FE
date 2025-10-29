import { useCallback } from "react";
import useApiService from "../hooks/useApi";
import { HTTP_METHOD } from "../constants/enum";

const walletService = () => {
  const { callApi, loading, setIsLoading } = useApiService();

  const getMyWallet = useCallback(
    async () => {
      try {
        const response = await callApi(HTTP_METHOD.GET, `/wallet/available`);
        return response;
      } catch (e: any) {
        console.log(e?.response?.data);
      }
    },
    [callApi]
  );

  const deposit = useCallback(
    async (amount: string) => {
      try {
        const response = await callApi(HTTP_METHOD.POST, `/wallet/deposit`, {amount});
        return response;
      } catch (e: any) {
        console.log(e?.response?.data);
      }
    },
    [callApi]
  );

  return {
    loading,
    getMyWallet,
    deposit,
    setIsLoading,
  };
};

export default walletService;
