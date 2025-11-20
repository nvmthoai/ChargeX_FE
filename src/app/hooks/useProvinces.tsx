import { useState, useCallback } from "react";
import axios from "axios";

export interface Province {
    code: number;           // dùng cho AddressFormModal
    name: string;           // dùng cho AddressFormModal
    NameExtension?: string[];
    ProvinceID: number;     // GHN API gốc
    ProvinceName: string;   // GHN API gốc
}

export interface District {
    code: number;           // DistrictID
    name: string;           // DistrictName
    DistrictID: number;
    DistrictName: string;
}

export interface Ward {
    code: string;           // WardCode
    name: string;           // WardName
    WardCode: string;
    WardName: string;
}

const GHN_TOKEN = "your-token";
const GHN_BASE = "https://online-gateway.ghn.vn/shiip/public-api";

export default function useProvinces() {
    const [provinces, setProvinces] = useState<Province[]>([]);

    // Fetch provinces
    const fetchProvinces = useCallback(async () => {
        try {
            const res = await axios.get(`${GHN_BASE}/master-data/province`, {
                headers: { Token: GHN_TOKEN },
            });

            const mapped = res.data.data.map((p: any) => ({
                code: p.ProvinceID,
                name: p.ProvinceName,
                NameExtension: p.NameExtension,
                ProvinceID: p.ProvinceID,
                ProvinceName: p.ProvinceName,
            }));

            setProvinces(mapped);
            return mapped;
        } catch (err) {
            console.error("Lỗi tải tỉnh:", err);
            return [];
        }
    }, []);

    // Fetch districts
    const fetchDistricts = useCallback(async (provinceId: number) => {
        try {
            const res = await axios.post(
                `${GHN_BASE}/master-data/district`,
                { province_id: provinceId },
                { headers: { Token: GHN_TOKEN } }
            );

            return res.data.data.map((d: any): District => ({
                code: d.DistrictID,
                name: d.DistrictName,
                DistrictID: d.DistrictID,
                DistrictName: d.DistrictName,
            }));
        } catch (err) {
            console.error("Lỗi tải quận/huyện:", err);
            return [];
        }
    }, []);

    // Fetch wards
    const fetchWards = useCallback(async (districtId: number) => {
        try {
            const res = await axios.post(
                `${GHN_BASE}/master-data/ward`,
                { district_id: districtId },
                { headers: { Token: GHN_TOKEN } }
            );

            return res.data.data.map((w: any): Ward => ({
                code: w.WardCode,
                name: w.WardName,
                WardCode: w.WardCode,
                WardName: w.WardName,
            }));
        } catch (err) {
            console.error("Lỗi tải phường/xã:", err);
            return [];
        }
    }, []);

    return {
        provinces,
        fetchProvinces,
        fetchDistricts,
        fetchWards,
    };
}
