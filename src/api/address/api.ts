import axiosInstance from "../../app/config/axios";

export interface AddressFormData {
  label: string;
  fullName: string;
  phone: string;
  line1: string;
  wardCode: string;
  districtId: number;
  provinceId: number;
  note?: string;
  isDefault?: boolean;
}

export interface Address {
  addressId: string;
  label: string;
  fullName: string;
  phone: string;
  line1: string;
  wardCode: string;
  districtId: number;
  provinceId: number;
  note?: string;
  isDefault?: boolean;
  createdAt: string;
  updatedAt: string;
}

export const addressApi = {
  getMyAddress: async (userId: string) => {
    const response = await axiosInstance.get(`/address/user/${userId}`);
    return response.data;
  },

  createAddress: async (data: AddressFormData) => {
    const response = await axiosInstance.post("/address", data);
    return response.data;
  },

  updateAddress: async (addressId: string, data: AddressFormData) => {
    const response = await axiosInstance.patch(`/address/${addressId}`, data);
    return response.data;
  },

  deleteAddress: async (addressId: string) => {
    const response = await axiosInstance.delete(`/address/${addressId}`);
    return response.data;
  },
};





