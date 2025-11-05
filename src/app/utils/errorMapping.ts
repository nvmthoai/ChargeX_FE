// Error mapping utilities for auction bidding

export interface ApiError {
  code: string;
  message: string;
  statusCode?: number;
}

/**
 * Extract API error from various error formats
 */
export function extractApiError(error: any): ApiError {
  // If error.response.data exists (Axios format)
  if (error?.response?.data) {
    return {
      code: error.response.data.code || error.response.data.error || 'UNKNOWN_ERROR',
      message: error.response.data.message || error.message || 'An error occurred',
      statusCode: error.response.status,
    };
  }

  // If error is already in the right format
  if (error?.code && error?.message) {
    return error;
  }

  // Default error
  return {
    code: 'UNKNOWN_ERROR',
    message: error?.message || 'An unknown error occurred',
  };
}

/**
 * Map error codes/messages to user-friendly messages
 */
export function mapErrorMessage(code: string, originalMessage: string): string {
  const errorMap: Record<string, string> = {
    'INSUFFICIENT_FUNDS': 'Số dư không đủ. Vui lòng nạp thêm tiền vào ví.',
    'BID_TOO_LOW': 'Giá đặt quá thấp. Vui lòng đặt giá cao hơn.',
    'AUCTION_ENDED': 'Phiên đấu giá đã kết thúc.',
    'AUCTION_NOT_LIVE': 'Phiên đấu giá chưa bắt đầu.',
    'NOT_AUTHENTICATED': 'Vui lòng đăng nhập để đặt giá.',
    'INVALID_BID': 'Giá đặt không hợp lệ.',
    'ALREADY_HIGHEST_BIDDER': 'Bạn đã là người đặt giá cao nhất.',
    'SELLER_CANNOT_BID': 'Người bán không thể đặt giá.',
    'DEPOSIT_REQUIRED': 'Cần đặt cọc để đặt giá.',
    'WALLET_NOT_FOUND': 'Không tìm thấy ví. Vui lòng tạo ví trước.',
    'CONNECTION_ERROR': 'Lỗi kết nối. Vui lòng thử lại.',
  };

  return errorMap[code] || originalMessage || 'Có lỗi xảy ra. Vui lòng thử lại.';
}

/**
 * Check if error is insufficient funds
 */
export function isInsufficientFundsError(error: any): boolean {
  const apiError = extractApiError(error);
  return apiError.code === 'INSUFFICIENT_FUNDS' || 
         apiError.message.toLowerCase().includes('insufficient') ||
         apiError.message.toLowerCase().includes('not enough');
}

/**
 * Extract required deposit amount from error message
 */
export function extractRequiredDeposit(error: any): number | null {
  const apiError = extractApiError(error);
  const message = apiError.message;

  // Try to extract number from messages like:
  // "Required deposit: 100000"
  // "You need 100000 deposit"
  // "Deposit of 100000 is required"
  
  const patterns = [
    /required deposit[:\s]+(\d+)/i,
    /need[:\s]+(\d+)/i,
    /deposit of[:\s]+(\d+)/i,
    /(\d+)[:\s]+deposit/i,
  ];

  for (const pattern of patterns) {
    const match = message.match(pattern);
    if (match && match[1]) {
      return parseInt(match[1], 10);
    }
  }

  return null;
}

/**
 * Format error for display
 */
export function formatErrorForDisplay(error: any): string {
  const apiError = extractApiError(error);
  const friendlyMessage = mapErrorMessage(apiError.code, apiError.message);
  
  return friendlyMessage;
}

/**
 * Check if error requires user action
 */
export function requiresUserAction(error: any): { action: string; data?: any } | null {
  const apiError = extractApiError(error);

  if (isInsufficientFundsError(error)) {
    return {
      action: 'DEPOSIT_FUNDS',
      data: {
        required: extractRequiredDeposit(error),
      },
    };
  }

  if (apiError.code === 'NOT_AUTHENTICATED') {
    return {
      action: 'LOGIN',
    };
  }

  if (apiError.code === 'WALLET_NOT_FOUND') {
    return {
      action: 'CREATE_WALLET',
    };
  }

  return null;
}
