import { useEffect, useState } from "react";
import { getKycProfileById } from "../../../api/kyc/api";
import type { KycProfile } from "../../../api/kyc/type";
import type { User } from "../../../api/user/type";
import VerifyOptions from "./component/VerifyOptions";
import KycProfileView from "./component/KycProfileView";

export default function KnowYourCus() {
  const [kyc, setKyc] = useState<KycProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const userData = localStorage.getItem("user");
  const user: User | null = userData ? JSON.parse(userData) : null;
  const userId = user?.sub;

  useEffect(() => {
    const fetchKyc = async () => {
      if (!userId) {
        console.warn("⚠️ No user ID found in localStorage");
        setLoading(false);
        return;
      }

      try {
        const res = await getKycProfileById(userId);
        console.log("Fetched KYC:", res);

        if (res.success && res.data) {
          setKyc(res.data);
        } else {
          setKyc(null);
        }
      } catch (err) {
        console.error("❌ Error checking KYC:", err);
        setKyc(null);
      } finally {
        setLoading(false);
      }
    };

    fetchKyc();
  }, [userId]);

  if (loading) {
    return <p className="p-6 text-gray-500">Loading KYC status...</p>;
  }

  /* ==============================
      ✅ GIAO DIỆN CHÍNH
  ============================== */

  return (
    <div className="p-6 w-full max-w-3xl mx-auto">
      {!kyc ? (
        // 🟡 Khi chưa có hồ sơ → giữ nguyên phần giao diện cũ
        <div className="space-y-2">
          <h2 className="text-lg font-semibold mb-2">No KYC Profile Found</h2>
          <p className="text-gray-600 mb-4">
            You haven’t verified your identity yet. Please choose a verification
            method to continue.
          </p>
          <VerifyOptions/>

        </div>
      ) : (
        // 🟢 Khi đã có hồ sơ → hiển thị component mới
        <KycProfileView kyc={kyc} />
      )}
    </div>
  );
}
