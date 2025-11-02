
import { useState, useEffect } from "react";
import type { MyWallet } from "../models/wallet.model";
import walletService from "../services/WalletService";

const useWallet = () => {
  const [myWallet, setMyWallet] = useState<MyWallet | null>(null);
  const { getMyWallet, deposit } = walletService();
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

  return {
    myWallet,
    handleDeposit,
  };
};

export default useWallet;

