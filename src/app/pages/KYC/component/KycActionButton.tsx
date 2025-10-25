import { useState } from "react";
import type { KycProfile } from "../../../../api/kyc/type";
import KycUploadModal from "./KycUploadModal";

export default function KycActionButton({ kyc }: { kyc: KycProfile }) {
  const [showModal, setShowModal] = useState(false);

  const hasPendingDocs = kyc.documents?.some((d) => d.status === "pending");
  const hasNoDocs = !kyc.documents?.length;

  const handleOpenModal = () => setShowModal(true);
  const handleCloseModal = () => setShowModal(false);

  const handleUpgrade = () => {
    console.log("⚡ Upgrade to Advanced clicked");
    // sau này bạn có thể gọi postKycProfile({ level: "advanced" })
  };

  // 🔹 Logic hiển thị nút hành động
  if (kyc.level === "basic") {
    if (kyc.status === "pending" && (hasNoDocs || hasPendingDocs)) {
      return (
        <>
          <button
            onClick={handleOpenModal}
            className="px-4 py-2 rounded-lg bg-yellow-500 hover:bg-yellow-600 text-white font-medium"
          >
            Continue Verify Basic
          </button>

          {showModal && (
            <KycUploadModal
              mode="basic"
              profileId={kyc.kycProfileId}
              existingDocs={kyc.documents}
              onClose={handleCloseModal}
              onUploaded={() => window.location.reload()}
            />
          )}
        </>
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
        <>
          <button
            onClick={handleOpenModal}
            className="px-4 py-2 rounded-lg bg-yellow-500 hover:bg-yellow-600 text-white font-medium"
          >
            Continue Verify Advanced
          </button>

          {showModal && (
            <KycUploadModal
              mode="advanced"
              profileId={kyc.kycProfileId}
              existingDocs={kyc.documents}
              onClose={handleCloseModal}
              onUploaded={() => window.location.reload()}
            />
          )}
        </>
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
