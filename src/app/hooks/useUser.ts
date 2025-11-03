import { useState, useEffect } from "react";
import userService from "../services/UserService";
import type { UserDetail } from "../models/user.model";

const useUser = () => {
  const [userDetail, setUserDetail] = useState<UserDetail | null>(null);

  const { getUserDetail } = userService();
  useEffect(() => {
    fetchUserDetail();
  }, []);

  const fetchUserDetail = async () => {
    const response = await getUserDetail();
    if (response) {
      setUserDetail(response.data);
    }
  };

  return {
    userDetail,
  };
};

export default useUser;
