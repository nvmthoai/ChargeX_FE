import { useState } from "react";
import { addressApi, type AddressFormData } from "../../api/address/api";

const addressService = () => {
  const [loading, setLoading] = useState(false);

  const getMyAddress = async (userId: string) => {
    try {
      setLoading(true);
      const response = await addressApi.getMyAddress(userId);
      return response;
    } catch (e: any) {
      console.log(e?.response?.data);
      throw e;
    } finally {
      setLoading(false);
    }
  };

  const deleteAddress = async (addressId: string) => {
    try {
      setLoading(true);
      const response = await addressApi.deleteAddress(addressId);
      return response;
    } catch (e: any) {
      console.log(e?.response?.data);
      throw e;
    } finally {
      setLoading(false);
    }
  };

  const createNewAddress = async (values: AddressFormData) => {
    try {
      setLoading(true);
      const response = await addressApi.createAddress(values);
      return response;
    } catch (e: any) {
      console.log(e?.response?.data);
      throw e;
    } finally {
      setLoading(false);
    }
  };

  const updateNewAddress = async (addressId: string, values: AddressFormData) => {
    try {
      setLoading(true);
      const response = await addressApi.updateAddress(addressId, values);
      return response;
    } catch (e: any) {
      console.log(e?.response?.data);
      throw e;
    } finally {
      setLoading(false);
    }
  };

  return {
    getMyAddress,
    deleteAddress,
    createNewAddress,
    updateNewAddress,
    loading,
    setIsLoading: setLoading,
  };
};

export default addressService;
