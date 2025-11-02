import { useState, useEffect, useCallback } from 'react';

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
  checkSufficientBalance: (bidAmount: number, depositPercent: number) => { sufficient: boolean; required: number; available: number };
  formatCurrency: (amount: number) => string;
  fetchBalance: () => Promise<void>;
}

export default function useWallet(options: UseWalletOptions = {}): UseWalletReturn {
  const { autoFetch = false, refreshIntervalSeconds = 0 } = options;

  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch wallet balance
  const fetchBalance = useCallback(async () => {
    setLoading(true);
    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
      const response = await fetch(`${API_URL}/wallet/balance`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token') || ''}`,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setWallet(data);
      setError(null);
    } catch (err: any) {
      console.error('[useWallet] Fetch error:', err);
      setError(err.message || 'Failed to fetch wallet');
      // Set mock data for development
      setWallet({
        balance: 1000000,
        available: 1000000,
        locked: 0,
        userId: 'user-123',
      });
    } finally {
      setLoading(false);
    }
  }, []);

  // Calculate required deposit
  const calculateDeposit = useCallback((bidAmount: number, depositPercent: number): number => {
    return Math.ceil((bidAmount * depositPercent) / 100);
  }, []);

  // Check if user has sufficient balance
  const checkSufficientBalance = useCallback((bidAmount: number, depositPercent: number) => {
    const required = calculateDeposit(bidAmount, depositPercent);
    const available = wallet?.available ?? 0;
    
    return {
      sufficient: available >= required,
      required,
      available,
    };
  }, [wallet, calculateDeposit]);

  // Format currency (VND)
  const formatCurrency = useCallback((amount: number): string => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount);
  }, []);

  // Deposit money to wallet
  const deposit = useCallback(async (amount: number): Promise<void> => {
    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
      const response = await fetch(`${API_URL}/wallet/deposit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token') || ''}`,
        },
        body: JSON.stringify({ amount }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      await fetchBalance();
    } catch (err: any) {
      console.error('[useWallet] Deposit error:', err);
      throw new Error(err.message || 'Failed to deposit');
    }
  }, [fetchBalance]);

  // Auto-fetch on mount
  useEffect(() => {
    if (autoFetch) {
      fetchBalance();
    }
  }, [autoFetch, fetchBalance]);

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
