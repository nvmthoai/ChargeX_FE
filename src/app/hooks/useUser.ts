import { useState, useEffect } from "react";
import userService from "../services/UserService";
import type { ShopDetail, UserDetail } from "../models/user.model";

const useUser = () => {
  const [userDetail, setUserDetail] = useState<UserDetail | null>(null);
  const [shopDetail, setShopDetail] = useState<ShopDetail | null>(null);
  const { getUserDetail, getShopDetail, loading } = userService();

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

  return {
    userDetail,
    fetchShopDetail,
    loading,
    shopDetail
  };
};

export default useUser;
