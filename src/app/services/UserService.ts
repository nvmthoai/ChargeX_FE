import { useCallback } from "react";
import useApiService from "../hooks/useApi";
import { HTTP_METHOD } from "../constants/enum";

const userService = () => {
  const { callApi, loading, setIsLoading } = useApiService();

  const getUserDetail = useCallback(
    async () => {
      try {
        const response = await callApi(HTTP_METHOD.GET, `/users/me`);
        return response;
      } catch (e: any) {
        console.log(e?.response?.data);
      }
    },
    [callApi]
  );

  return {
    loading,
    getUserDetail,
    setIsLoading,
    
  };
};

export default userService;
