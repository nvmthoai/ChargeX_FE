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
export const createProduct = async (data: {
  title: string;
  description: string;
  price_start: number;
  price_buy_now?: number;
  is_auction: boolean;
  file?: File;
}): Promise<Product> => {
  try {
    const formData = new FormData();
    formData.append("title", data.title);
    formData.append("description", data.description);
    formData.append("price_start", data.price_start.toString());
    formData.append("is_auction", String(data.is_auction));
    if (data.price_buy_now) {
      formData.append("price_buy_now", data.price_buy_now.toString());
    }
    if (data.file) {
      formData.append("file", data.file);
    }

    const response = await axiosInstance.post("/product-listing", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    console.log("✅ Product created:", response.data);
    return response.data;
  } catch (error) {
    console.error("Error creating product:", error);
    throw error;
  }
};
