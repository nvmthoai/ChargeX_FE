import axiosInstance from "../../app/config/axios";
import type { Product } from "./type";

// 🟩 Lấy chi tiết sản phẩm theo ID
export const getProductById = async (id: string): Promise<Product> => {
  try {
    const response = await axiosInstance.get(`/product-listing/${id}`);
    console.log("Product detail:", response.data?.data);
    return response.data?.data;
  } catch (error) {
    console.error("Error fetching product:", error);
    throw error;
  }
};

// 🟦 Tạo sản phẩm mới
export const createProduct = async (formData: FormData): Promise<any> => {
  try {
    const response = await axiosInstance.post("/product-listing", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data;
  } catch (error) {
    console.error("Error creating product:", error);
    throw error;
  }
};

