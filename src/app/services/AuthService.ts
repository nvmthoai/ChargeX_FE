import { useCallback } from "react";
import useApiService from "../hooks/useApi";
import { HTTP_METHOD } from "../constants/enum";
import { message } from "antd";

const authSerivce = () => {
  const { callApi, loading, setIsLoading } = useApiService();


  const register = useCallback(
    async (values: any) => {
      try {
        const response = await callApi(HTTP_METHOD.POST, '/auth/register', {
          ...values,
        });
        return response;
      } catch (e: any) {
        message.error(e?.response?.data);
      }
    },
    [callApi]
  );


  return {
    register,
    loading,
    setIsLoading,
  };
};

export default authSerivce;
