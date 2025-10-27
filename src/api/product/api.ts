import axiosInstance from "../../app/config/axios";
import type { Product, ProductListResponse } from "./type";

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

export const getMyProducts = async (
  page = 1,
  limit = 10
): Promise<ProductListResponse> => {
  try {
    const response = await axiosInstance.get(
      `/product-listing/mine?page=${page}&limit=${limit}`
    );

    const res = response.data; // { success, statusCode, data: { data: [...], total, ... } }
    const payload = res.data || {};

    return {
      data: payload.data || [],
      total: payload.total || 0,
      page: payload.page || 1,
      limit: payload.limit || limit,
    };
  } catch (error) {
    console.error("Error fetching my products:", error);
    throw error;
  }
};

