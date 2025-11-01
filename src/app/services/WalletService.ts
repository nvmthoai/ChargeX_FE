import { useCallback } from "react";
import useApiService from "../hooks/useApi";
import { HTTP_METHOD } from "../constants/enum";
import axiosInstance from "../config/axios";

const walletService = () => {
  const { callApi, loading, setIsLoading } = useApiService();

  const getMyWallet = useCallback(async () => {
    try {
      const response = await callApi(HTTP_METHOD.GET, `/wallet/available`);
      return response;
    } catch (e: any) {
      console.log(e?.response?.data);
    }
  }, [callApi]);

  const deposit = useCallback(
    async (amount: string) => {
      try {
        const response = await callApi(HTTP_METHOD.POST, `/wallet/deposit`, {
          amount,
        });
        return response;
      } catch (e: any) {
        console.log(e?.response?.data);
      }
    },
    [callApi]
  );

  const getBanks = useCallback(async () => {
    try {
      const response = await axiosInstance.get(
        "https://api.vietqr.io/v2/banks"
      );
      return response;
    } catch (e: any) {
      console.log(e?.response?.data);
    }
  }, [callApi]);

  const memberWithdrawals = useCallback(
    async (values: any) => {
      try {
        const response = await callApi(HTTP_METHOD.POST, `/wallet/withdrawals`, {
          ...values,
        });
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
    getBanks,
    memberWithdrawals,
  };
};

export default walletService;
