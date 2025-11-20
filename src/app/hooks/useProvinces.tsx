// src/hooks/useProvinces.ts  ← THAY TOÀN BỘ FILE NÀY HOÀN TOÀN
import { useState, useEffect } from "react";

export interface Province {
  code: number;
  name: string;
}

export interface District {
  code: number;
  name: string;
}

export interface Ward {
  code: string;
  name: string;
}

export default function useProvinces() {
  const [provinces, setProvinces] = useState<Province[]>([]);
  const [districts, setDistricts] = useState<District[]>([]);
  const [wards, setWards] = useState<Ward[]>([]);
  const [loading, setLoading] = useState(true);

  // Lấy danh sách tỉnh/thành
  useEffect(() => {
    fetch("https://provinces.open-api.vn/api/p/")
      .then(res => res.json())
      .then(data => {
        setProvinces(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  // Lấy quận/huyện theo tỉnh
  const fetchDistricts = async (provinceCode: number) => {
    setLoading(true);
    try {
      const res = await fetch(`https://provinces.open-api.vn/api/p/${provinceCode}?depth=2`);
      const data = await res.json();
      const mapped = data.districts.map((d: any) => ({
        code: d.code,
        name: d.name,
      }));
      setDistricts(mapped);
      setWards([]); // reset phường/xã
      return mapped;
    } catch (err) {
      return [];
    } finally {
      setLoading(false);
    }
  };

  // Lấy phường/xã theo quận/huyện
  const fetchWards = async (districtCode: number) => {
    setLoading(true);
    try {
      const res = await fetch(`https://provinces.open-api.vn/api/d/${districtCode}?depth=2`);
      const data = await res.json();
      const mapped = data.wards.map((w: any) => ({
        code: String(w.code),
        name: w.name,
      }));
      setWards(mapped);
      return mapped;
    } catch (err) {
      return [];
    } finally {
      setLoading(false);
    }
  };

  return {
    provinces,
    districts,
    wards,
    loading,
    fetchDistricts,
    fetchWards,
  };
}