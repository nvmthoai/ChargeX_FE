import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  XCircle,
  // RefreshCw,
  Home, HelpCircle
} from "lucide-react";

export default function PaymentError() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [isAnimated, setIsAnimated] = useState(false);

  // Get error details from URL params
  const errorCode = searchParams.get("errorCode") || "ERR-UNKNOWN";
  const errorMessage =
    searchParams.get("message") ||
    "An unexpected error occurred during payment processing";
  // const orderId = searchParams.get("orderId") || "N/A";
  const amount = searchParams.get("amount") || "0";

  useEffect(() => {
    setIsAnimated(true);
  }, []);

  // const handleRetry = () => {
  //   // Navigate back to payment page with order details
  //   navigate("/checkout?orderId=" + orderId + "&amount=" + amount);
  // };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-rose-50 to-pink-50 flex items-center justify-center p-4">
      <div
        className={`max-w-md w-full transition-all duration-700 ${isAnimated ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          }`}
      >
        {/* Error Icon */}
        <div className="flex justify-center mb-6">
          <div className="relative">
            <div className="absolute inset-0 bg-red-400 rounded-full blur-2xl opacity-30 animate-pulse"></div>
            <div className="relative bg-white rounded-full p-6 shadow-xl">
              <XCircle
                className="w-20 h-20 text-red-500 animate-[shake_0.5s_ease-in-out]"
                strokeWidth={2}
              />
            </div>
          </div>
        </div>

        {/* Error Card */}
        <div className="bg-white rounded-2xl shadow-2xl p-8 space-y-6">
          {/* Header */}
          <div className="text-center space-y-2">
            <h1 className="text-3xl font-bold text-gray-900">Payment Failed</h1>
            <p className="text-gray-600">We couldn't process your payment</p>
          </div>

          {/* Divider */}
          <div className="border-t border-gray-200"></div>

          {/* Error Details */}
          <div className="space-y-4">
            <div className="bg-red-50 border border-red-200 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <HelpCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-semibold text-red-900 mb-1">
                    Error Details
                  </p>
                  <p className="text-sm text-red-700">{errorMessage}</p>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Error Code</span>
                <span className="font-mono text-sm text-red-600 font-semibold">
                  {errorCode}
                </span>
              </div>
              {/* {orderId !== "N/A" && (
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Order ID</span>
                  <span className="font-semibold text-gray-900">{orderId}</span>
                </div>
              )} */}
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Attempted Amount</span>
                <span className="text-xl font-bold text-gray-900">
                  ${amount}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Date</span>
                <span className="text-gray-900">
                  {new Date().toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>

          {/* Divider */}
          <div className="border-t border-gray-200"></div>

          {/* Common Reasons */}
          <div className="bg-gray-50 rounded-xl p-4">
            <p className="text-sm font-semibold text-gray-900 mb-2">
              Common reasons for payment failure:
            </p>
            <ul className="text-sm text-gray-700 space-y-1 list-disc list-inside">
              <li>Insufficient funds in your account</li>
              <li>Incorrect card details or expired card</li>
              <li>Bank declined the transaction</li>
              <li>Network or connection issues</li>
            </ul>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            {/* <button
              onClick={handleRetry}
              className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-3 px-4 rounded-xl transition-all duration-200 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl"
            >
              <RefreshCw className="w-5 h-5" />
              Try Again
            </button> */}

            <button
              onClick={() => navigate("/support")}
              className="w-full bg-gray-100 hover:bg-gray-200 text-gray-900 font-semibold py-3 px-4 rounded-xl transition-all duration-200 flex items-center justify-center gap-2"
            >
              <HelpCircle className="w-5 h-5" />
              Contact Support
            </button>

            <button
              onClick={() => navigate("/")}
              className="w-full bg-white hover:bg-gray-50 text-gray-700 font-semibold py-3 px-4 rounded-xl transition-all duration-200 flex items-center justify-center gap-2 border-2 border-gray-200"
            >
              <Home className="w-5 h-5" />
              Back to Home
            </button>
          </div>
        </div>

        {/* Additional Info */}
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            Your payment was not charged. You can try again or contact our
            support team for assistance.
          </p>
        </div>
      </div>

      {/* Shake Animation */}
      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
          20%, 40%, 60%, 80% { transform: translateX(5px); }
        }
      `}</style>
    </div>
  );
}
