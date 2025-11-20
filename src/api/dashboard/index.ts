import axiosInstance from "../../app/config/axios";

export const getSellerOverview = async (sellerId: string) => {
  const response = await axiosInstance.get(`/dashboard/${sellerId}/overview`);
  let data: any = response.data;
  // Unwrap NestJS-style responses if needed
  if (data && typeof data === "object" && "data" in data && "success" in data) data = data.data;
  return data;
};

export default {
  getSellerOverview,
};
