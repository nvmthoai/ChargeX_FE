import { updateKycProfileStatus } from "../../../../api/kyc/api";
import type { KycProfile } from "../../../../api/kyc/type";

export default function KycActionButton({ kyc }: { kyc: KycProfile }) {
  const hasPendingDocs = kyc.documents?.some((d) => d.status === "pending");
  const hasNoDocs = !kyc.documents?.length;

  const handleContinue = async () => {
    await updateKycProfileStatus(kyc.kycProfileId, {
      status: "pending",
      note: `User continued ${kyc.level} verification`,
    });
    alert("✅ Verification request sent again!");
  };

  const handleUpgrade = async () => {
    console.log("⚡ Upgrade to Advanced clicked");
    // sau này bạn có thể gọi postKycProfile({ level: "advanced" })
  };

  // 🔹 Logic điều kiện hiển thị nút
  if (kyc.level === "basic") {
    if (kyc.status === "pending" && (hasNoDocs || hasPendingDocs)) {
      return (
        <button
          onClick={handleContinue}
          className="px-4 py-2 rounded-lg bg-yellow-500 hover:bg-yellow-600 text-white font-medium"
        >
          Continue Verify Basic
        </button>
      );
    }

    if (kyc.status === "approved") {
      return (
        <button
          onClick={handleUpgrade}
          className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium"
        >
          Upgrade to Advanced
        </button>
      );
    }
  }

  if (kyc.level === "advanced") {
    if (kyc.status === "pending" && hasPendingDocs) {
      return (
        <button
          onClick={handleContinue}
          className="px-4 py-2 rounded-lg bg-yellow-500 hover:bg-yellow-600 text-white font-medium"
        >
          Continue Verify Advanced
        </button>
      );
    }

    if (kyc.status === "approved") {
      return (
        <div className="text-green-600 font-medium">
          ✅ Your account is fully verified!
        </div>
      );
    }
  }

  return null;
}
