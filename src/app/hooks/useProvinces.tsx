

import { useState, useEffect } from "react";
import axios from "axios";

export interface Province {
  code: number;
  name: string;
  districts?: District[];
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
    fetchProvinces();
  }, []);

  const fetchProvinces = async () => {
    setLoading(true);
    try {
      const response = await axios.get("https://provinces.open-api.vn/api/p/");
      if(response){
        setProvinces(response.data);
      }
    } catch (error) {
      console.error("Error fetching provinces:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchDistricts = async (provinceCode: number): Promise<District[]> => {
    try {
      const response = await fetch(
        `https://provinces.open-api.vn/api/p/${provinceCode}?depth=2`
      );
      const data = await response.json();
      return data.districts || [];
    } catch (error) {
      console.error("Error fetching districts:", error);
      return [];
    }
  };

  const fetchWards = async (districtCode: number): Promise<Ward[]> => {
    try {
      const response = await fetch(
        `https://provinces.open-api.vn/api/d/${districtCode}?depth=2`
      );
      const data = await response.json();
      return data.wards || [];
    } catch (error) {
      console.error("Error fetching wards:", error);
      return [];
    }
  };

  return {
    provinces,
    loading,
    fetchDistricts,
    fetchWards,
  };
};

export default useProvinces;
