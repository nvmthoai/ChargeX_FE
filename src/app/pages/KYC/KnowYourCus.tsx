// import { useEffect, useState } from "react";
// import { getKycProfileById } from "../.././../api/kyc/api";

// export default function KnowYourCus() {
//   const [kyc, setKyc] = useState(null);
//   const [loading, setLoading] = useState(true);

//   const userId = localStorage.getItem("id"); // hoặc lấy từ context đăng nhập

//   useEffect(() => {
//     const fetchKyc = async () => {
//       try {
//         const data = await getKycProfileById(id);
//         if (Array.isArray(data) && data.length > 0) {
//           setKyc(data[0]); // đã có hồ sơ
//         } else {
//           setKyc(null); // chưa có hồ sơ
//         }
//       } catch (err) {
//         console.error("Error checking KYC:", err);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchKyc();
//   }, [userId]);

//   if (loading) return <p>Loading KYC status...</p>;

//   return (
//     <div className="p-6">
//       {!kyc ? (
//         <div>
//           <h2 className="text-lg font-semibold">You don’t have a KYC profile yet</h2>
//           <p className="text-gray-600">Please start verification to continue trading.</p>
//         </div>
//       ) : (
//         <div>
//           <h2 className="text-lg font-semibold">Your KYC Profile</h2>
//           <p>Level: {kyc.level}</p>
//           <p>Status: {kyc.status}</p>
//         </div>
//       )}
//     </div>
//   );
// }


import VerifyOptions from "./component/VerifyOptions";
import KycStatus from "./component/KycStatus";

export default function KnowYourCus() {
  return (
    <div>
      <VerifyOptions />
      <KycStatus /> 

    </div>
  )
}
