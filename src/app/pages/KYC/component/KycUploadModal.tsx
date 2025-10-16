import { useState } from "react";
import { UploadCloud, X } from "lucide-react";
import { uploadKycDocument } from "../../../../api/kyc/api";

interface KycUploadModalProps {
  mode: "basic" | "advanced";
  profileId: string; // ✅ thêm prop
  onClose: () => void;
  onUploaded?: () => void; // để reload lại hồ sơ sau khi upload
}

export default function KycUploadModal({ mode, profileId, onClose, onUploaded }: KycUploadModalProps) {
  const [uploading, setUploading] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<Record<string, string>>({});
  const isBasic = mode === "basic";

  const uploadFields = isBasic
    ? [
        { type: "front_id", label: "Front of ID", desc: "Upload a clear image of the front of your ID." },
        { type: "back_id", label: "Back of ID", desc: "Upload a clear image of the back of your ID." },
      ]
    : [
        { type: "front_id", label: "Front of ID", desc: "Front image of your ID." },
        { type: "back_id", label: "Back of ID", desc: "Back image of your ID." },
        { type: "financial_proof", label: "Proof of Financials", desc: "Upload financial proof (e.g. bank statement)." },
      ];

  // 🔹 Handler: upload từng file
  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>, type: string) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setUploading(true);
      // Giả sử bạn đã có storage (Firebase/S3...) thì upload file lấy URL ở đây.
      // Tạm thời demo bằng fake URL:
      const fakeUrl = URL.createObjectURL(file);

      // ✅ Gọi API thật để lưu vào KYC Document
      const res = await uploadKycDocument(profileId, {
        type,
        fileUrl: fakeUrl,
      });

      if (res.success) {
        setUploadedFiles((prev) => ({ ...prev, [type]: fakeUrl }));
        console.log(`✅ Uploaded ${type}:`, res.data);
      } else {
        alert(`❌ Upload failed: ${res.message}`);
      }
    } catch (err) {
      console.error("❌ Error uploading document:", err);
      alert("Upload failed!");
    } finally {
      setUploading(false);
    }
  };

  const handleSend = () => {
    alert("📤 Documents sent for review!");
    if (onUploaded) onUploaded();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center">
      <div className="bg-white rounded-xl shadow-lg w-full max-w-2xl relative">
        {/* Header */}
        <div className="flex justify-between items-center p-6">
          <h2 className="text-xl font-semibold">
            Upload Your Documents
            <span className="block text-sm text-gray-500 mt-1">
              {isBasic ? "Basic Verification" : "Advanced Verification"}
            </span>
          </h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X size={20} />
          </button>
        </div>

        {/* Upload fields */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 p-6">
          {uploadFields.map((field) => (
            <div key={field.type} className="border border-gray-300 rounded-lg p-4 flex flex-col gap-3">
              <div>
                <h4 className="font-semibold text-gray-800 text-sm">{field.label}</h4>
                <p className="text-xs text-gray-500">{field.desc}</p>
              </div>

              <label className="border-2 border-dashed border-indigo-300 rounded-md py-8 flex flex-col items-center justify-center text-indigo-500 hover:bg-indigo-50 cursor-pointer">
                <UploadCloud size={28} />
                <p className="text-xs mt-2">
                  {uploadedFiles[field.type] ? "Uploaded ✓" : "Drag & drop or click to upload"}
                </p>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFileChange(e, field.type)}
                  className="hidden"
                  disabled={uploading}
                />
              </label>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="border-t p-5 flex justify-end">
          <button
            onClick={handleSend}
            disabled={uploading}
            className="bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg py-2 px-5 disabled:opacity-60"
          >
            {uploading ? "Uploading..." : "Send for Review"}
          </button>
        </div>
      </div>
    </div>
  );
}
