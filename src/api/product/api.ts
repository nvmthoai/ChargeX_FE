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
export const createProduct = async (formData: FormData): Promise<Product> => {
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
  limit = 10,
  keyword = "",
  status?: string
): Promise<ProductListResponse> => {
  try {
    const userData = localStorage.getItem("user");
    const sellerId = userData ? JSON.parse(userData)?.sub : null;

    if (!sellerId) throw new Error("❌ Missing seller_id — user chưa đăng nhập");

    const response = await axiosInstance.get(`/product-listing`, {
      params: {
        q: keyword || "",
        seller_id: sellerId,
        page,
        limit,
        status: status || undefined,
      },
    });

    const res = response.data;
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

// 🟨 Cập nhật sản phẩm (owner only)
export const updateProduct = async (
  id: string,
  formData: FormData
): Promise<Product> => {
  try {
    const response = await axiosInstance.patch(
      `/product-listing/${id}`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
    console.log("✅ Product updated:", response.data);
    return response.data;
  } catch (error) {
    console.error("❌ Error updating product:", error);
    throw error;
  }
};
