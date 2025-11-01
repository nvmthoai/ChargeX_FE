/**
 * Error Mapping Utility
 * Maps HTTP error codes and server messages to user-friendly display messages
 */

export interface ApiError {
  code: number;
  message: string;
}

/**
 * Map error response to user-friendly message
 */
export function mapErrorMessage(code: number, message: string): string {
  // 400 Bad Request - validation errors
  if (code === 400) {
    if (message.toLowerCase().includes("insufficient funds")) {
      return "💰 Not enough balance. Please deposit funds to continue.";
    }
    if (message.toLowerCase().includes("out of time")) {
      return "⏰ Auction is not currently active.";
    }
    if (message.toLowerCase().includes("bid must be")) {
      return `📊 ${message}`; // Keep server's specific amount message
    }
    if (message.toLowerCase().includes("buy now not available")) {
      return "❌ Buy now option is not available for this auction.";
    }
    return `⚠️ ${message}`;
  }

  // 401 Unauthorized
  if (code === 401) {
    return "🔒 Please log in to continue.";
  }

  // 403 Forbidden
  if (code === 403) {
    if (message.toLowerCase().includes("not live")) {
      return "⏸️ This auction is not currently active.";
    }
    if (message.toLowerCase().includes("another auction")) {
      return "⏳ Another auction is currently live. Please wait.";
    }
    if (message.toLowerCase().includes("seller cannot bid")) {
      return "🚫 You cannot bid on your own auction.";
    }
    if (message.toLowerCase().includes("not admin")) {
      return "🔐 Admin access required.";
    }
    return `🚫 ${message}`;
  }

  // 404 Not Found
  if (code === 404) {
    return "❓ Auction not found.";
  }

  // 409 Conflict - concurrency issues
  if (code === 409) {
    return "⚡ Request conflict. Please try again.";
  }

  // 500 Internal Server Error
  if (code === 500) {
    return "🔧 Server error. Please try again later.";
  }

  // Default fallback
  return message || "An unexpected error occurred.";
}

/**
 * Extract error info from axios error response
 */
export function extractApiError(error: any): ApiError {
  const code = error?.response?.status ?? 500;
  const message = error?.response?.data?.message ?? error?.message ?? "Unknown error";
  return { code, message };
}

/**
 * Check if error is retryable (transient failure)
 */
export function isRetryableError(code: number): boolean {
  // 409 Conflict and 500 Internal Error are typically transient
  return code === 409 || code === 500;
}

/**
 * Check if error is insufficient funds
 */
export function isInsufficientFundsError(code: number, message: string): boolean {
  return code === 400 && message.toLowerCase().includes("insufficient funds");
}

/**
 * Extract required deposit amount from error message
 * Example: "Insufficient funds for deposit: required 5500" -> 5500
 */
export function extractRequiredDeposit(message: string): number | null {
  const match = message.match(/required\s+(\d+)/i);
  if (match && match[1]) {
    return parseInt(match[1], 10);
  }
  return null;
}
