import { useState } from "react";
import { userApi } from "../../api/user/api";

const userService = () => {
  const [loading, setLoading] = useState(false);

  const getUserDetail = async () => {
    try {
      setLoading(true);
      const response = await userApi.getUserDetail();
      return response;
    } catch (e: any) {
      console.log(e?.response?.data);
      throw e;
    } finally {
      setLoading(false);
    }
  };

  const getShopDetail = async (sellerId: string) => {
    try {
      setLoading(true);
      const response = await userApi.getShopDetail(sellerId);
      return response;
    } catch (e: any) {
      console.log(e?.response?.data);
      throw e;
    } finally {
      setLoading(false);
    }
  };

  const uploadAvatar = async (values: { file: File }) => {
    try {
      setLoading(true);
      const response = await userApi.uploadAvatar(values.file);
      return response;
    } catch (e: any) {
      console.log(e?.response?.data);
      throw e;
    } finally {
      setLoading(false);
    }
  };

  const uploadProfile = async (values: any) => {
    try {
      setLoading(true);
      const response = await userApi.updateProfile(values);
      return response;
    } catch (e: any) {
      console.log(e?.response?.data);
      throw e;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    getUserDetail,
    setIsLoading: setLoading,
    getShopDetail,
    uploadAvatar,
    uploadProfile
  };
};

export default userService;
