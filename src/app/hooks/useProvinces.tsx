import { useState, useEffect } from "react";
import axios from "axios";
import ENV from "../config/env";

export interface Province {
  Code: number;
  NameExtension: string[];
}

export interface District {
  code: number;
  name: string;
  wards?: Ward[];
}

export interface Ward {
  code: number;
  name: string;
}

const useProvinces = () => {
  const [provinces, setProvinces] = useState<Province[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    getProvinces();
    fetchDistricts(298);
    fetchWards(1556);
  }, []);

  const GHN_API = axios.create({
    baseURL: "https://dev-online-gateway.ghn.vn/shiip/public-api",
    headers: {
      "Content-Type": "application/json",
      Token: "a6e9f694-b57a-11f0-b040-4e257d8388b4",
    },
  });

  // Lấy danh sách tỉnh
  const getProvinces = async () => {
    const res = await GHN_API.get("/master-data/province");
    if (res && res.data) {
      setProvinces(res.data);
    }
    return res.data;
  };

  const fetchDistricts = async (province_id: number) => {
    const res = await GHN_API.post("/master-data/district", { province_id });
    return res.data;
  };

  // Lấy danh sách phường theo quận
  const fetchWards = async (district_id: number) => {
    const res = await GHN_API.post(
      `/master-data/ward?district_id=${district_id}`,
      { district_id }
    );
    return res.data;
  };

  return {
    provinces,
    loading,
    fetchDistricts,
    fetchWards,
  };
};

export default useProvinces;
