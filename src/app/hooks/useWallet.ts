import { useCallback, useEffect, useState } from "react";
import WalletService from "../services/WalletService";
import type {
  Wallet,
  WalletTransaction,
  EscrowHold,
  DepositRequest,
} from "../services/WalletService";
import toast from "react-hot-toast";

interface UseWalletOptions {
  autoFetch?: boolean;
  refreshIntervalSeconds?: number;
}

/**
 * useWallet
 * Custom hook to manage wallet state and operations
 * - Fetches wallet balance, transactions, holds
 * - Provides deposit flow
 * - Auto-refreshes balance periodically
 */
export default function useWallet(options?: UseWalletOptions) {
  const autoFetch = options?.autoFetch ?? true;
  const refreshIntervalSeconds = options?.refreshIntervalSeconds ?? 30;

  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [transactions, setTransactions] = useState<WalletTransaction[]>([]);
  const [holds, setHolds] = useState<EscrowHold[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch wallet balance
  const fetchBalance = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await WalletService.getBalance();
      setWallet(data);
      return data;
    } catch (err: any) {
      const message = err?.response?.data?.message || "Failed to fetch wallet balance";
      setError(message);
      console.error("fetchBalance error:", err);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch wallet transactions
  const fetchTransactions = useCallback(async (page: number = 1, pageSize: number = 20) => {
    try {
      setLoading(true);
      setError(null);
      const data = await WalletService.getTransactions(page, pageSize);
      setTransactions(data.items);
      return data;
    } catch (err: any) {
      const message = err?.response?.data?.message || "Failed to fetch transactions";
      setError(message);
      console.error("fetchTransactions error:", err);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch escrow holds
  const fetchHolds = useCallback(async (page: number = 1, pageSize: number = 20) => {
    try {
      setLoading(true);
      setError(null);
      const data = await WalletService.getHolds(page, pageSize);
      setHolds(data.items);
      return data;
    } catch (err: any) {
      const message = err?.response?.data?.message || "Failed to fetch holds";
      setError(message);
      console.error("fetchHolds error:", err);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // Initiate deposit flow
  const deposit = useCallback(async (request: DepositRequest) => {
    try {
      setLoading(true);
      setError(null);
      const response = await WalletService.deposit(request);
      toast.success("Redirecting to payment...");
      // Redirect to checkout URL
      window.location.href = response.checkoutUrl;
      return response;
    } catch (err: any) {
      const message = err?.response?.data?.message || "Failed to initiate deposit";
      setError(message);
      toast.error(message);
      console.error("deposit error:", err);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // Calculate deposit for a bid amount
  const calculateDeposit = useCallback((bidAmount: number, depositPercent: number) => {
    return WalletService.calculateDeposit(bidAmount, depositPercent);
  }, []);

  // Check if balance is sufficient
  const checkSufficientBalance = useCallback((bidAmount: number, depositPercent: number) => {
    const availableBalance = wallet?.available ?? 0;
    return WalletService.checkSufficientBalance(bidAmount, depositPercent, availableBalance);
  }, [wallet]);

  // Format currency (VND)
  const formatCurrency = useCallback((amount: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  }, []);

  // Auto-fetch balance on mount and periodically
  useEffect(() => {
    if (!autoFetch) return;
    fetchBalance();
    const intervalId = window.setInterval(() => {
      fetchBalance();
    }, refreshIntervalSeconds * 1000);
    return () => clearInterval(intervalId);
  }, [autoFetch, refreshIntervalSeconds, fetchBalance]);

  return {
    wallet,
    transactions,
    holds,
    loading,
    error,
    fetchBalance,
    fetchTransactions,
    fetchHolds,
    deposit,
    calculateDeposit,
    checkSufficientBalance,
    formatCurrency,
  };
}
