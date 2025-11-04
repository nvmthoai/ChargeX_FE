import { useState, useEffect } from "react";
import walletService from "../services/WalletService";
import type { PayoutRequest } from "../models/wallet.model";
import { App } from "antd";
import type { Bank } from "../layouts/Header/Header";

const useAdminWallet = () => {
  const [requests, setRequest] = useState<PayoutRequest[]>([]);
  const { message } = App.useApp();
  const { adminGetWithdrawRequest, adminApproveRequest, adminDenyRequest } = walletService();
  const [banks, setBanks] = useState<Bank[]>([]);
  const [loadingBanks, setLoadingBanks] = useState(false);

  useEffect(() => {
    fetchRequestWithdraw();
    fetchBanks();
  }, []);

  const fetchRequestWithdraw = async () => {
    const response = await adminGetWithdrawRequest();
    if (response) {
      setRequest(response.data.items);
    }
  };

  const handleApproveRequest = async (
    paymentId: string,
  ) => {
    const response = await adminApproveRequest(paymentId);
    if (response) {
      message.success("Request Approved!");
      return response;
    }
    return null;
  };

  const handleDenyRequest = async (
    paymentId: string,
    values: any
  ) => {
    const response = await adminDenyRequest(paymentId, values);
    if (response) {
      message.success("Request Denied!");
      return response;
    }
    return null;
  };

  const fetchBanks = async () => {
    try {
      const response = await fetch("https://api.vietqr.io/v2/banks");
      const data = await response.json();
      if (data.code === "00" && data.data) {
        setBanks(data.data);
      }
    } catch (error) {
      console.error("Failed to fetch banks:", error);
    } finally {
      setLoadingBanks(false);
    }
  };
  return {
    requests,
    handleApproveRequest,
    handleDenyRequest,
    fetchRequestWithdraw,
    banks,
    loadingBanks
  };
};

export default useAdminWallet;
