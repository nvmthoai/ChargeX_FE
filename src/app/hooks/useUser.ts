import { useState, useEffect } from "react";
import userService from "../services/UserService";
import type { ShopDetail, UserDetail } from "../models/user.model";
import { App } from "antd";
export interface uploadAvatarValues {
  file: File;
}

const useUser = () => {
  const [userDetail, setUserDetail] = useState<UserDetail | null>(null);
  const [shopDetail, setShopDetail] = useState<ShopDetail | null>(null);
  const { getUserDetail, getShopDetail, uploadAvatar, uploadProfile, loading } = userService();
  const { message } = App.useApp();

  useEffect(() => {
    fetchUserDetail();
  }, []);

  const fetchUserDetail = async () => {
    const response = await getUserDetail();
    if (response) {
      setUserDetail(response.data);
    }
  };

  const fetchShopDetail = async (id: string) => {
    const response = await getShopDetail(id);
    if (response) {
      setShopDetail(response.data);
    }
  };

  const handleUploadAvatar = async (values: uploadAvatarValues) => {
    const response = await uploadAvatar(values);
    if (response) {
      message.success("Upload avatar successfully!");
      fetchUserDetail();
      return response;
    }
    return null;
  };

  const handleUploadProfile = async (values: any) => {
    const response = await uploadProfile(values);
    if (response) {
      message.success("Upload avatar successfully!");
      return response;
    }
    return null;
  };

  return {
    fetchShopDetail,
    handleUploadAvatar,
    handleUploadProfile,
    userDetail,
    loading,
    shopDetail,
  };
};

export default useUser;
