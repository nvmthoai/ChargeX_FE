// Re-export error mapping utilities from app/utils for compatibility
export {
  extractApiError,
  mapErrorMessage,
  isInsufficientFundsError,
  extractRequiredDeposit,
  formatErrorForDisplay,
  requiresUserAction,
  type ApiError,
} from "../app/utils/errorMapping";
