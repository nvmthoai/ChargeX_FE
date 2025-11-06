import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { CheckCircle, Download, Home, Package } from "lucide-react";

export default function PaymentSuccess() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [isAnimated, setIsAnimated] = useState(false);

  // Get payment details from URL params
  const orderId =
    searchParams.get("orderId") ||
    "ORD-" + Math.random().toString(36).substr(2, 9).toUpperCase();
  const amount = searchParams.get("amount") || "0";
  const transactionId =
    searchParams.get("transactionId") ||
    "TXN-" + Math.random().toString(36).substr(2, 12).toUpperCase();

  useEffect(() => {
    setIsAnimated(true);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 flex items-center justify-center p-4">
      <div
        className={`max-w-md w-full transition-all duration-700 ${
          isAnimated ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
        }`}
      >
        {/* Success Icon */}
        <div className="flex justify-center mb-6">
          <div className="relative">
            <div className="absolute inset-0 bg-green-400 rounded-full blur-2xl opacity-30 animate-pulse"></div>
            <div className="relative bg-white rounded-full p-6 shadow-xl">
              <CheckCircle
                className="w-20 h-20 text-green-500 animate-[bounce_1s_ease-in-out]"
                strokeWidth={2}
              />
            </div>
          </div>
        </div>

        {/* Success Card */}
        <div className="bg-white rounded-2xl shadow-2xl p-8 space-y-6">
          {/* Header */}
          <div className="text-center space-y-2">
            <h1 className="text-3xl font-bold text-gray-900">
              Payment Successful!
            </h1>
            <p className="text-gray-600">
              Your payment has been processed successfully
            </p>
          </div>

          {/* Divider */}
          <div className="border-t border-gray-200"></div>

          {/* Payment Details */}
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Order ID</span>
              <span className="font-semibold text-gray-900">{orderId}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Transaction ID</span>
              <span className="font-mono text-sm text-gray-900">
                {transactionId}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Amount Paid</span>
              <span className="text-2xl font-bold text-green-600">
                ${Number(amount).toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Date</span>
              <span className="text-gray-900">
                {new Date().toLocaleDateString()}
              </span>
            </div>
          </div>

          {/* Divider */}
          <div className="border-t border-gray-200"></div>

          {/* Action Buttons */}
          <div className="space-y-3">
            <button
              onClick={() => navigate("/orders/" + orderId)}
              className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-4 rounded-xl transition-all duration-200 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl"
            >
              <Package className="w-5 h-5" />
              View Order Details
            </button>

            <button
              onClick={() => {
                // Download receipt logic here
                alert("Receipt download started");
              }}
              className="w-full bg-gray-100 hover:bg-gray-200 text-gray-900 font-semibold py-3 px-4 rounded-xl transition-all duration-200 flex items-center justify-center gap-2"
            >
              <Download className="w-5 h-5" />
              Download Receipt
            </button>

            <button
              onClick={() => navigate("/")}
              className="w-full bg-white hover:bg-gray-50 text-gray-700 font-semibold py-3 px-4 rounded-xl transition-all duration-200 flex items-center justify-center gap-2 border-2 border-gray-200"
            >
              <Home className="w-5 h-5" />
              Back to Home
            </button>
          </div>

          {/* Footer Note */}
          <div className="text-center pt-4">
            <p className="text-sm text-gray-500">
              A confirmation email has been sent to your registered email
              address
            </p>
          </div>
        </div>

        {/* Additional Info */}
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            Need help?{" "}
            <a
              href="/support"
              className="text-green-600 hover:text-green-700 font-semibold"
            >
              Contact Support
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
