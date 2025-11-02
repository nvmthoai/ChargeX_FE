import { useState } from "react";
import type { KycProfile } from "../../../../api/kyc/type";
import KycUploadModal from "./KycUploadModal";
// import { postKycProfile } from "../../../../api/kyc/api"; 

export default function KycActionButton({ kyc }: { kyc: KycProfile }) {
  const [showModal, setShowModal] = useState(false);
  const [mode, setMode] = useState<"basic" | "advanced">("basic"); // 🟢 track mode
  // const [profileId, setProfileId] = useState(kyc.kycProfileId);
  const profileId = kyc.kycProfileId;

  const hasPendingDocs = kyc.documents?.some((d) => d.status === "pending");
  const hasNoDocs = !kyc.documents?.length;

  const handleOpenModal = (m: "basic" | "advanced") => {
    setMode(m);
    setShowModal(true);
  };

  const handleCloseModal = () => setShowModal(false);

  // 🟢 Khi user muốn nâng cấp lên advanced
  // const handleUpgrade = async () => {
  //   try {
  //     console.log("⚡ Upgrade to Advanced clicked");

  //     // Nếu backend yêu cầu tạo hồ sơ mới (level advanced)
  //     const res = await postKycProfile({ level: "advanced" });
  //     if (res.success && res.data) {
  //       console.log("✅ Created Advanced KYC profile:", res.data);
  //       setProfileId(res.data.kycProfileId);
  //       handleOpenModal("advanced");
  //     } else {
  //       console.warn("⚠️ Could not create advanced profile, fallback using current one");
  //       handleOpenModal("advanced");
  //     }
  //   } catch (err) {
  //     console.error("❌ Failed to upgrade KYC:", err);
  //     alert("Upgrade failed!");
  //   }
  // };


  if (kyc.level === "basic") {
    if (kyc.status === "pending" && (hasNoDocs || hasPendingDocs)) {
      return (
        <>
          <button
            onClick={() => handleOpenModal("basic")}
            className="px-4 py-2 rounded-lg bg-yellow-500 hover:bg-yellow-600 text-white font-medium"
          >
            Continue Verify Basic
          </button>

          {showModal && (
            <KycUploadModal
              mode={mode}
              profileId={profileId}
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
        <>
          {/* <button
            onClick={handleUpgrade}
            className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium"
          >
            Upgrade to Advanced
          </button> */}

          {showModal && (
            <KycUploadModal
              mode={mode}
              profileId={profileId}
              existingDocs={kyc.documents}
              onClose={handleCloseModal}
              onUploaded={() => window.location.reload()}
            />
          )}
        </>
      );
    }
  }


  if (kyc.level === "advanced") {
    if (kyc.status === "pending" && hasPendingDocs) {
      return (
        <>
          <button
            onClick={() => handleOpenModal("advanced")}
            className="px-4 py-2 rounded-lg bg-yellow-500 hover:bg-yellow-600 text-white font-medium"
          >
            Continue Verify Advanced
          </button>

          {showModal && (
            <KycUploadModal
              mode={mode}
              profileId={profileId}
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


  if (kyc.status === "rejected") {
    return (
      <>
        <button
          onClick={() => handleOpenModal("basic")}
          className="px-4 py-2 rounded-lg bg-red-500 hover:bg-red-600 text-white font-medium"
        >
          Re-verify Basic
        </button>

        {showModal && (
          <KycUploadModal
            mode={mode}
            profileId={profileId}
            existingDocs={kyc.documents}
            onClose={handleCloseModal}
            onUploaded={() => window.location.reload()}
          />
        )}
      </>
    );
  }

  return null;
}
