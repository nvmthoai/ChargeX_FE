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

  const getShopDetail = useCallback(
    async (id: string) => {
      try {
        const response = await callApi(HTTP_METHOD.GET, `/users/seller/${id}`);
        return response;
      } catch (e: any) {
        console.log(e?.response?.data);
      }
    },
    [callApi]
  );

  const uploadAvatar = useCallback(
    async (values: any) => {
      const formData = new FormData();
      formData.append("file", values.file);
      try {
        const response = await callApi(HTTP_METHOD.PATCH, `/users/upload-image`, formData);
        return response;
      } catch (e: any) {
        console.log(e?.response?.data);
      }
    },
    [callApi]
  );

  const uploadProfile = useCallback(
    async (values: any) => {

      try {
        const response = await callApi(HTTP_METHOD.PATCH, `/users/profile`, values);
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
    getShopDetail,
    uploadAvatar,
    uploadProfile
  };
};

export default userService;
