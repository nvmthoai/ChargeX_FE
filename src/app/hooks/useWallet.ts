import { useState, useEffect } from "react";
import type { MyWallet } from "../models/wallet.model";
import walletService from "../services/WalletService";
import { App } from "antd";
import type { Transaction } from "../pages/Profile/ProfileWallet/ProfileWallet";
import { getUserInfo } from "./useAddress";
export interface memberWithdrawals {
  amount: number;
  accountNumber: string;
  bankCode: string;
  note: string;
}

const useWallet = () => {
  const [myWallet, setMyWallet] = useState<MyWallet | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const { getMyWallet, deposit, memberWithdrawals, memberGetTransacions } =
    walletService();
  const { message } = App.useApp();
  const [withdrawalModalOpen, setWithdrawalModalOpen] = useState(false);
  const userInfo = getUserInfo();

  useEffect(() => {
    if(userInfo != null){
      fetchMyWallet();
      fetchTransactions();
    }
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
      setWithdrawalModalOpen(false);
      console.log("test");
      message.success("Please wait admin approve your request!");
      return response;
    }
    return null;
  };

  const fetchTransactions = async () => {
    const response = await memberGetTransacions();
    if (response) {
      setTransactions(response.data.items);
    }
  };

  return {
    myWallet,
    transactions,
    withdrawalModalOpen,
    handleDeposit,
    handleWithdrawls,
    setWithdrawalModalOpen,
    fetchTransactions,
  };
};

export default useWallet;
