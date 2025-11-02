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
  const { message } = App.useApp();

  useEffect(() => {
    fetchMyWallet();
  }, []);

  const fetchMyWallet = async () => {
    try {
      const response = await walletService.getBalance();
      if (response) {
        setMyWallet(response as any); // cast if MyWallet shape differs
      }
    } catch (e) {
      console.error("fetchMyWallet error", e);
    }
  };

  const handleDeposit = async (amount: string) => {
    try {
      const response = await walletService.deposit({
        amount: parseFloat(amount),
        returnUrl: window.location.origin + "/payment-success",
        cancelUrl: window.location.origin + "/payment-error",
      });
      if (response) {
        fetchMyWallet();
        window.location.href = response.checkoutUrl;
      }
    } catch (e) {
      console.error("handleDeposit error", e);
      message.error("Deposit failed");
    }
  };

  const handleWithdrawls = async (_values: memberWithdrawals) => {
    try {
      // WalletService doesn't have memberWithdrawals method currently
      // You may need to add it or call a different endpoint
      // For now, show a placeholder
      message.info("Withdrawal feature not yet implemented in WalletService");
    } catch (e) {
      console.error("handleWithdrawls error", e);
      message.error("Withdrawal failed");
    }
  };

  return {
    myWallet,
    handleDeposit,
    handleWithdrawls,
  };
};

export default useWallet;
