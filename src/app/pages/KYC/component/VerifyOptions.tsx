import { useState } from "react";
import { AlertTriangle, User, UploadCloud } from "lucide-react";
import { postKycProfile } from "../.././../../api/kyc/api";
import KycUploadModal from "./KycUploadModal";

export default function VerifyOptions() {
  const [modalMode, setModalMode] = useState<"basic" | "advanced" | null>(null);
  const [loading, setLoading] = useState(false);

  const handleVerification = async (mode: "basic" | "advanced") => {
    try {
      setLoading(true);
      const note =
        mode === "basic"
          ? "User started basic verification"
          : "User requested advanced verification";

      const res = await postKycProfile({ level: mode, note });
      console.log("✅ KYC created:", res);

      setModalMode(mode); // mở popup upload tài liệu
    } catch (error) {
      console.error("❌ Failed to create KYC:", error);
      alert("Cannot create KYC profile, please try again later.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto py-10 px-6 space-y-10 profile-content">
      {/* Header */}
      <header>
        <h1 className="text-3xl font-bold text-gray-900">Verify your identity</h1>
        <p className="text-gray-600 mt-1">
          To sell, bid, or withdraw securely, please complete your KYC.
        </p>
      </header>

      {/* Alert */}
      <div className="bg-indigo-50 border border-indigo-200 text-indigo-700 p-4 rounded-lg flex items-center gap-3">
        <AlertTriangle size={20} />
        <span>You haven’t verified your account yet.</span>
      </div>

      {/* Options */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Basic */}
        <div className="border rounded-xl p-6 bg-white shadow-sm hover:shadow-md transition">
          <div className="flex flex-col space-y-4">
            <User size={46} className="text-indigo-600" />
            <h3 className="font-semibold text-lg text-gray-900">Basic Verification</h3>
            <p className="text-gray-600 text-sm leading-relaxed">
              Provide personal info to unlock basic trading features.
            </p>
            <button
              disabled={loading}
              onClick={() => handleVerification("basic")}
              className={`${
                loading ? "bg-gray-400" : "bg-indigo-600 hover:bg-indigo-700"
              } text-white text-sm font-medium rounded-lg py-2 px-5 mt-2`}
            >
              {loading ? "Processing..." : "Start Basic Verification"}
            </button>
          </div>
        </div>

        {/* Advanced */}
        <div className="border rounded-xl p-6 bg-white shadow-sm hover:shadow-md transition">
          <div className="flex flex-col space-y-4">
            <UploadCloud size={46} className="text-indigo-600" />
            <h3 className="font-semibold text-lg text-gray-900">Advanced Verification</h3>
            <p className="text-gray-600 text-sm leading-relaxed">
              Upload ID and financial proof for higher trading limits.
            </p>
            <button
              disabled={loading}
              onClick={() => handleVerification("advanced")}
              className={`${
                loading ? "bg-gray-400" : "bg-indigo-600 hover:bg-indigo-700"
              } text-white text-sm font-medium rounded-lg py-2 px-5 mt-2`}
            >
              {loading ? "Processing..." : "Upgrade Now"}
            </button>
          </div>
        </div>
      </section>

      {/* Modal */}
      {modalMode && (
        <KycUploadModal mode={modalMode} onClose={() => setModalMode(null)} />
      )}
    </div>
  );
}
