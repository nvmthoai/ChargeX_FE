import { useCallback } from "react";
import useApiService from "../hooks/useApi";
import { HTTP_METHOD } from "../constants/enum";

const addressService = () => {
  const { callApi, loading, setIsLoading } = useApiService();

  const getMyAddress = useCallback(
    async (id: any) => {
      try {
        const response = await callApi(HTTP_METHOD.GET, `/address/user/${id}`);
        return response;
      } catch (e: any) {
        console.log(e?.response?.data);
      }
    },
    [callApi]
  );

  const deleteAddress = useCallback(
    async (id: any) => {
      try {
        const response = await callApi(
          HTTP_METHOD.DELETE,
          `/address/${id}`
        );
        return response;
      } catch (e: any) {
        console.log(e?.response?.data);
      }
    },
    [callApi]
  );

  const createNewAddress = useCallback(
    async (values: any) => {
      try {
        const response = await callApi(HTTP_METHOD.POST, `/address`, {
          ...values,
        });
        return response;
      } catch (e: any) {
        console.log(e?.response?.data);
      }
    },
    [callApi]
  );

  const updateNewAddress = useCallback(
    async (addressId: string, values: any) => {
      try {
        const response = await callApi(HTTP_METHOD.PATCH, `/address/${addressId}`, {
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
    getMyAddress,
    deleteAddress,
    createNewAddress,
    updateNewAddress,
    loading,
    setIsLoading,
  };
};

export default addressService;
