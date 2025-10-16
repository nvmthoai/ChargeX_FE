import axiosInstance from "../../app/config/axios";

export const getProductById = async (id: string) => {
  try {
    const response = await axiosInstance.get(`/product-listing/${id}`);
    console.log("Product detail:", response.data);
    return response.data;
  } catch (error) {
    console.error("Error fetching product:", error);
    throw error;
  }
};
