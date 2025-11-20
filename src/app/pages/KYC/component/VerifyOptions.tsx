import { useState } from "react";
import { AlertTriangle, User } from "lucide-react";
import { postKycProfile } from "../.././../../api/kyc/api";
import KycUploadModal from "./KycUploadModal";


export default function VerifyOptions({ profileId }: { profileId?: string }) {

  const [modalMode, setModalMode] = useState<"basic" | "advanced" | null>(null);
  const [loading, setLoading] = useState(false);
  const [createdProfileId, setCreatedProfileId] = useState<string | null>(null);


  const handleVerification = async (mode: "basic" | "advanced") => {
    try {
      setLoading(true);
      const note =
        mode === "basic"
          ? "User started basic verification"
          : "User requested advanced verification";

      const res = await postKycProfile({ level: mode, note });
      console.log("✅ KYC created:", res);

      if (res.success && res.data?.kycProfileId) {
        setCreatedProfileId(res.data.kycProfileId); // ✅ Lưu lại ID mới
        setModalMode(mode); // ✅ Mở modal upload
      } else {
        alert("Failed to create KYC profile.");
      }
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
        <h1 className="text-3xl font-bold text-gray-900">Xác minh danh tính của bạn</h1>
        <p className="text-gray-600 mt-1">
          Để bán, đặt giá thầu hoặc rút tiền một cách an toàn, vui lòng hoàn thành KYC của bạn.
        </p>
      </header>

      {/* Alert */}
      <div className="bg-indigo-50 border border-indigo-200 text-indigo-700 p-4 rounded-lg flex items-center gap-3">
        <AlertTriangle size={20} />
        <span>Bạn chưa xác minh tài khoản của mình.</span>
      </div>

      {/* Options */}
      <section className=" gap-6">
        {/* Basic */}
        <div className="border rounded-xl p-6 bg-white shadow-sm hover:shadow-md transition">
          <div className="flex flex-col space-y-4">
            <User size={46} className="text-indigo-600" />
            <h3 className="font-semibold text-lg text-gray-900">Xác minh cơ bản</h3>
            <p className="text-gray-600 text-sm leading-relaxed">
              Cung cấp thông tin cá nhân để mở khóa các tính năng giao dịch cơ bản
            </p>
            <button
              disabled={loading}
              onClick={() => handleVerification("basic")}
              className={`${loading ? "bg-gray-400" : "bg-indigo-600 hover:bg-indigo-700"
                } text-white text-sm font-medium rounded-lg py-2 px-5 mt-2`}
            >
              {loading ? "Đang xử lý..." : "Bắt đầu xác minh cơ bản"}
            </button>
          </div>
        </div>

        {/* Advanced */}
        {/* <div className="border rounded-xl p-6 bg-white shadow-sm hover:shadow-md transition">
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
        </div> */}
      </section>

      {/* Modal */}
      {modalMode && (
        <KycUploadModal
          mode={modalMode}
          profileId={createdProfileId ?? profileId ?? ""}
          onClose={() => {
            setModalMode(null);
            setCreatedProfileId(null);
          }}
        />
      )}

    </div>
  );
}
