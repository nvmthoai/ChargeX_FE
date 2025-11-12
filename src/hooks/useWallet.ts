import { useState, useEffect, useCallback } from "react";
import axiosInstance from "../app/config/axios";

interface Wallet {
  balance: number;
  available: number;
  locked: number;
  userId: string;
}

interface UseWalletOptions {
  autoFetch?: boolean;
  refreshIntervalSeconds?: number;
}

interface UseWalletReturn {
  wallet: Wallet | null;
  loading: boolean;
  error: string | null;
  deposit: (amount: number) => Promise<void>;
  calculateDeposit: (bidAmount: number, depositPercent: number) => number;
  checkSufficientBalance: (
    bidAmount: number,
    depositPercent: number
  ) => { sufficient: boolean; required: number; available: number };
  formatCurrency: (amount: number) => string;
  fetchBalance: () => Promise<void>;
}

export default function useWallet(
  options: UseWalletOptions = {}
): UseWalletReturn {
  const { autoFetch = false, refreshIntervalSeconds = 0 } = options;

  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch wallet balance
  const fetchBalance = useCallback(async () => {
    setLoading(true);
    try {
      const res = await axiosInstance.get("/wallet/available");
      const data = res.data?.data ?? res.data;
      // normalize expected shape
      const walletData = {
        balance: data?.balance ?? data?.total ?? 0,
        available: data?.available ?? data?.balance ?? 0,
        locked: data?.held ?? data?.locked ?? 0,
        userId: data?.userId ?? data?.user_id ?? null,
      };
      setWallet(walletData as Wallet);
      setError(null);
    } catch (err: any) {
      console.error("[useWallet] Fetch error:", err);
      setError(err.message || "Failed to fetch wallet");
      // do not set mock wallet here — keep wallet null so UI reflects server state
    } finally {
      setLoading(false);
    }
  }, []);

  // Calculate required deposit
  const calculateDeposit = useCallback(
    (bidAmount: number, depositPercent: number): number => {
      return Math.ceil((bidAmount * depositPercent) / 100);
    },
    []
  );

  // Check if user has sufficient balance
  const checkSufficientBalance = useCallback(
    (bidAmount: number, depositPercent: number) => {
      const required = calculateDeposit(bidAmount, depositPercent);
      const available = wallet?.available ?? 0;

      return {
        sufficient: available >= required,
        required,
        available,
      };
    },
    [wallet, calculateDeposit]
  );

  // Format currency (VND)
  const formatCurrency = useCallback((amount: number): string => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  }, []);

  // Deposit money to wallet
  const deposit = useCallback(
    async (amount: number): Promise<void> => {
      try {
        await axiosInstance.post("/wallet/deposit", { amount });
        await fetchBalance();
      } catch (err: any) {
        console.error("[useWallet] Deposit error:", err);
        throw new Error(err.message || "Failed to deposit");
      }
    },
    [fetchBalance]
  );

  // Auto-fetch on mount
  useEffect(() => {
    if (autoFetch) {
      fetchBalance();
    }
  }, [autoFetch, fetchBalance]);

  // Re-fetch when user logs in/out elsewhere in the app
  useEffect(() => {
    const onAuthLogin = () => fetchBalance();
    const onAuthLogout = () => setWallet(null);
    window.addEventListener("auth:login", onAuthLogin);
    window.addEventListener("auth:logout", onAuthLogout);
    return () => {
      window.removeEventListener("auth:login", onAuthLogin);
      window.removeEventListener("auth:logout", onAuthLogout);
    };
  }, [fetchBalance]);

  // Setup refresh interval
  useEffect(() => {
    if (refreshIntervalSeconds <= 0) return;

    const interval = setInterval(() => {
      fetchBalance();
    }, refreshIntervalSeconds * 1000);

    return () => clearInterval(interval);
  }, [refreshIntervalSeconds, fetchBalance]);

  return {
    wallet,
    loading,
    error,
    deposit,
    calculateDeposit,
    checkSufficientBalance,
    formatCurrency,
    fetchBalance,
  };
}
