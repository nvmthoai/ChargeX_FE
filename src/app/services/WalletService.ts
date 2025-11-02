import axios from "../config/axios";

export interface Wallet {
  walletId: string;
  userId: string;
  balance: number;
  held: number;
  available: number;
}

export interface WalletTransaction {
  id: string;
  walletId: string;
  paymentId?: string;
  amount: number;
  type: "deposit" | "hold" | "refund" | "release" | "withdrawal" | "fee";
  description: string;
  createdAt: string;
}

export interface EscrowHold {
  holdId: string;
  walletId: string;
  amount: number;
  relatedBidId: string;
  status: "held" | "refunded" | "released" | "applied";
  createdAt: string;
  expiresAt?: string;
}

export interface DepositRequest {
  amount: number;
  returnUrl: string;
  cancelUrl?: string;
}

export interface DepositResponse {
  paymentId: string;
  checkoutUrl: string;
  qrCode?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  meta: {
    total: number;
    page: number;
    pageSize: number;
  };
}

/**
 * WalletService
 * Handles all wallet-related API calls: balance, transactions, holds, deposits
 */
class WalletService {
  /**
   * Get current user's wallet balance and state
   */
  async getBalance(): Promise<Wallet> {
    const response = await axios.get<Wallet>("/wallet");
    return response.data;
  }

  /**
   * Get paginated wallet transactions
   */
  async getTransactions(
    page: number = 1,
    pageSize: number = 20
  ): Promise<PaginatedResponse<WalletTransaction>> {
    const response = await axios.get<PaginatedResponse<WalletTransaction>>(
      "/wallet/transactions",
      {
        params: { page, pageSize },
      }
    );
    return response.data;
  }

  /**
   * Get paginated escrow holds
   */
  async getHolds(
    page: number = 1,
    pageSize: number = 20
  ): Promise<PaginatedResponse<EscrowHold>> {
    const response = await axios.get<PaginatedResponse<EscrowHold>>(
      "/wallet/holds",
      {
        params: { page, pageSize },
      }
    );
    return response.data;
  }

  /**
   * Initiate deposit to wallet via PayOS
   * Returns checkout URL for redirect
   */
  async deposit(request: DepositRequest): Promise<DepositResponse> {
    const response = await axios.post<DepositResponse>(
      "/wallet/deposit",
      request
    );
    return response.data;
  }

  /**
   * Calculate required deposit for a bid amount
   * @param bidAmount - The bid amount in smallest unit (e.g. VND đồng)
   * @param depositPercent - Deposit percentage (e.g. 10 for 10%)
   * @returns Required deposit amount
   */
  calculateDeposit(bidAmount: number, depositPercent: number): number {
    return Math.ceil((bidAmount * depositPercent) / 100);
  }

  /**
   * Check if user has sufficient balance for a bid
   * @param bidAmount - The bid amount
   * @param depositPercent - Deposit percentage
   * @param availableBalance - User's available wallet balance
   * @returns { sufficient: boolean, required: number, shortfall: number }
   */
  checkSufficientBalance(
    bidAmount: number,
    depositPercent: number,
    availableBalance: number
  ): { sufficient: boolean; required: number; shortfall: number } {
    const required = this.calculateDeposit(bidAmount, depositPercent);
    const sufficient = availableBalance >= required;
    const shortfall = sufficient ? 0 : required - availableBalance;
    return { sufficient, required, shortfall };
  }
}

export default new WalletService();
