import { useState, useEffect } from "react";
import type { MyWallet } from "../models/wallet.model";
import walletService from "../services/WalletService";
import { App } from "antd";
export interface memberWithdrawals {
  amount: number;
  accountNumber: string;
  bankCode: string;
  note: string;
}

const useWallet = () => {
  const [myWallet, setMyWallet] = useState<MyWallet | null>(null);
  const { getMyWallet, deposit, memberWithdrawals } = walletService();
  const { message } = App.useApp();

  useEffect(() => {
    fetchMyWallet();
  }, []);

  const fetchMyWallet = async () => {
    const response = await getMyWallet();
    if (response) {
      setMyWallet(response.data);
    }
  };

  const handleDeposit = async (amount: string) => {
    const response = await deposit(amount);
    if (response) {
      fetchMyWallet();
      window.location.href = response.data.checkoutUrl;
    }
  };

  const handleWithdrawls = async (values: memberWithdrawals) => {
    const response = await memberWithdrawals(values);
    if (response) {
      message.success("Please wait admin approve your request!");
    }
  };

  return {
    myWallet,
    handleDeposit,
    handleWithdrawls,
  };
};

export default useWallet;
