import { useState, useEffect } from "react";
import productService from "../services/ProductService";

export interface Seller {
  userId: string;
  fullName: string;
}

export interface Product {
  id: string;
  seller: Seller;
  title: string;
  description: string;
  price_start: string;
  price_buy_now: string | null;
  price_now: string | null;
  status: "draft" | "active" | "inactive" | "sold";
  imageUrls: string[];
  soh_percent: number | null;
  cycle_count: number | null;
  nominal_voltage_v: number | null;
  weight_kg: number | null;
  condition_grade: string | null;
  dimension: string | null;
  is_auction: boolean;
  end_time: string | null;
  createdAt: string;
  updatedAt: string;
}

const useProduct = () => {
  const [products, setProducts] = useState<Product[]>([]);

  const { getAllProduct } = productService();
  useEffect(() => {
    fetchAllProducts();
  }, []);

  const fetchAllProducts = async () => {
    const response = await getAllProduct();
    if (response) {
      setProducts(response.data);
    }
  };

  return {
    products,
  };
};

export default useProduct;
