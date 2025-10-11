import { useState } from "react";
// 🧩 Interface cho KYC profile
interface KycProfile {
  level: "basic" | "advanced";
  status: "pending" | "verified" | "rejected";
  message?: string;
  submittedOn?: string;
  lastUpdated?: string;
}

export default function KycStatus() {
      const [kyc] = useState<KycProfile>({
    level: "basic",
    status: "pending",
    message:
      "Your verification documents are under review. This may take up to 2–3 business days.",
    submittedOn: "2024-07-20",
    lastUpdated: "2024-07-21",
  });
  return (
    <div>
        {/* Current KYC Status */}
      <section className="border rounded-xl bg-white shadow-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900">Your Current KYC Status</h2>
          <span
            className={`px-3 py-1 text-sm rounded-full font-medium ${
              kyc.status === "pending"
                ? "bg-yellow-100 text-yellow-700"
                : kyc.status === "verified"
                ? "bg-green-100 text-green-700"
                : "bg-red-100 text-red-700"
            }`}
          >
            {kyc.status.charAt(0).toUpperCase() + kyc.status.slice(1)}
          </span>
        </div>

        <div className="space-y-3 text-gray-700 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-500">Level:</span>
            <span className="font-medium capitalize">{kyc.level}</span>
          </div>

          {kyc.submittedOn && (
            <div className="flex justify-between">
              <span className="text-gray-500">Submitted On:</span>
              <span>{kyc.submittedOn}</span>
            </div>
          )}

          {kyc.lastUpdated && (
            <div className="flex justify-between">
              <span className="text-gray-500">Last Updated:</span>
              <span>{kyc.lastUpdated}</span>
            </div>
          )}

          {kyc.message && (
            <div className="mt-4 border-t pt-3 text-gray-600 leading-relaxed">
              <strong className="text-gray-800">Message:</strong> {kyc.message}
            </div>
          )}
        </div>
      </section>
    </div>
  )
}
