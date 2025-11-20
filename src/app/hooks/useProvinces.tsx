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

const GHN_TOKEN = "a6e9f694-b57a-11f0-b040-4e257d8388b4";
const SHOP_ID = 197845;

const GHN_HEADERS = {
  "Content-Type": "application/json",
  token: GHN_TOKEN,
  ShopId: SHOP_ID.toString(),
};

export default function useProvinces() {
  const [provinces, setProvinces] = useState<Province[]>([]);
  const [districts, setDistricts] = useState<District[]>([]);
  const [wards, setWards] = useState<Ward[]>([]);
  const [loading, setLoading] = useState(true);

  // ================= PROVINCES =================
  useEffect(() => {
    const fetchProvinces = async () => {
      setLoading(true);
      try {
        const res = await fetch(
          "https://dev-online-gateway.ghn.vn/shiip/public-api/master-data/province",
          { headers: GHN_HEADERS }
        );

        const json = await res.json();

        setProvinces(
          json.data.map((p: any) => ({
            code: p.ProvinceID,
            name: p.ProvinceName,
          }))
        );
      } catch (err) {
        console.error("GHN Province error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProvinces();
  }, []);

  // ================= DISTRICTS =================
  const fetchDistricts = async (provinceCode: number) => {
    setLoading(true);
    try {
      const res = await fetch(
        `https://dev-online-gateway.ghn.vn/shiip/public-api/master-data/district?province_id=${provinceCode}`,
        {
          method: "GET",
          headers: GHN_HEADERS,
        }
      );

      const json = await res.json();

      const mapped = json.data.map((d: any) => ({
        code: d.DistrictID,
        name: d.DistrictName,
      }));

      setDistricts(mapped);
      setWards([]);
      return mapped;
    } catch (err) {
      console.error("GHN District error:", err);
      return [];
    } finally {
      setLoading(false);
    }
  };

  // ================= WARDS =================
  const fetchWards = async (districtCode: number) => {
    setLoading(true);
    try {
      const res = await fetch(
        `https://dev-online-gateway.ghn.vn/shiip/public-api/master-data/ward?district_id=${districtCode}`,
        {
          method: "POST",
          headers: GHN_HEADERS,
          body: JSON.stringify({ district_id: districtCode }),
        }
      );

      const json = await res.json();

      const mapped = json.data.map((w: any) => ({
        code: w.WardCode,
        name: w.WardName,
      }));

      setWards(mapped);
      return mapped;
    } catch (err) {
      console.error("GHN Ward error:", err);
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
