import { useEffect, useState } from "react";
import { App } from "antd";
import addressService from "../services/AddressService";
import type { Address, AddressFormData } from "../models/address.model";

export const getUserInfo = () => {
  const user = localStorage.getItem("user");
  if (user) {
    const userInfo = JSON.parse(user);
    return userInfo;
  }
  return null;
};

const userAddress = () => {
  const {
    createNewAddress,
    deleteAddress,
    getMyAddress,
    updateNewAddress,
    loading,
  } = addressService();
  const { message } = App.useApp();

  const [addresses, setAddresses] = useState<Address[]>([]);

  useEffect(() => {
    fetchMyAddresses();
  }, []);

  const userData = getUserInfo();

  const fetchMyAddresses = async () => {
    if (userData) {
      const response = await getMyAddress(userData.sub + "");
      console.log("response: ", response);
      setAddresses(response.data);
    }
  };

  const handleCreateAddress = async (values: AddressFormData) => {
    const response = await createNewAddress(values);
    if (response) {
      fetchMyAddresses();
      message.success("Create address successfully!");
      return response;
    }
    return null;
  };

  const handleUpdateAddress = async (addressId: string, values: AddressFormData) => {
    const response = await updateNewAddress(addressId, values);
    if (response) {
      fetchMyAddresses();
      message.success("Update address successfully!");
      return response;
    }
    return null;
  };

  const handleDeleteAddress = async (id: string) => {
    const response = await deleteAddress(id);
    if (response) {
      fetchMyAddresses();
      message.success("Delete address successfully!");
      return response;
    }
    return null;
  };

  return { handleCreateAddress, handleUpdateAddress, handleDeleteAddress, addresses, isLoading: loading };
};

export default userAddress;
