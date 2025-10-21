import { useState } from "react";
import { UploadCloud, X } from "lucide-react";
import { uploadKycDocument } from "../../../../api/kyc/api";
import type { KycDocument } from "../../../../api/kyc/type";

interface KycUploadModalProps {
  mode: "basic" | "advanced";
  profileId: string;
  existingDocs?: KycDocument[];
  onClose: () => void;
  onUploaded?: () => void;
}

export default function KycUploadModal({
  mode,
  profileId,
  existingDocs = [],
  onClose,
  onUploaded,
}: KycUploadModalProps) {
  const [uploading, setUploading] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<Record<string, string>>({});

  const isBasic = mode === "basic";

  // 🔹 Danh sách field yêu cầu theo mode
  const uploadFields: {
    type: "front_id" | "back_id" | "selfie" | "passport";
    label: string;
    desc: string;
  }[] = isBasic
    ? [
        { type: "front_id", label: "Front of ID", desc: "Upload a clear image of the front of your ID." },
        { type: "back_id", label: "Back of ID", desc: "Upload a clear image of the back of your ID." },
      ]
    : [
        { type: "front_id", label: "Front of ID", desc: "Front image of your ID." },
        { type: "back_id", label: "Back of ID", desc: "Back image of your ID." },
        { type: "selfie", label: "Selfie", desc: "Take a selfie holding your ID." },
        { type: "passport", label: "Passport", desc: "Upload a clear photo of your passport." },
      ];

  // 🧠 Kiểm tra đã đủ file chưa
  const requiredTypes = uploadFields.map((f) => f.type);
  const allUploaded = requiredTypes.every(
    (t) => uploadedFiles[t] || existingDocs.some((d) => d.type === t)
  );

  // 🔹 Handler: upload hoặc update document
  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>, type: string) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setUploading(true);

      // 🧩 Sau này upload file lên storage rồi lấy URL thật
      const fakeUrl = `https://example.com/uploads/${encodeURIComponent(file.name)}`;

      const res = await uploadKycDocument(profileId, {
        type: type as "front_id" | "back_id" | "selfie" | "passport",
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
    if (!allUploaded) {
      alert("⚠️ Please upload all required documents before saving.");
      return;
    }
    alert("📤 Documents updated successfully!");
    onUploaded?.();
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
          {uploadFields.map((field) => {
            const existing = existingDocs.find((doc) => doc.type === field.type);
            const isUploaded = uploadedFiles[field.type] || existing;

            return (
              <div key={field.type} className="border border-gray-300 rounded-lg p-4 flex flex-col gap-3">
                <div>
                  <h4 className="font-semibold text-gray-800 text-sm">{field.label}</h4>
                  <p className="text-xs text-gray-500">{field.desc}</p>
                </div>

                <label className="border-2 border-dashed border-indigo-300 rounded-md py-8 flex flex-col items-center justify-center text-indigo-500 hover:bg-indigo-50 cursor-pointer">
                  <UploadCloud size={28} />
                  <p className="text-xs mt-2">
                    {isUploaded ? "Uploaded ✓" : "Drag & drop or click to upload"}
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
            );
          })}
        </div>

        {/* Footer */}
        <div className="border-t p-5 flex justify-end">
          <button
            onClick={handleSend}
            disabled={uploading || !allUploaded}
            className={`text-white text-sm font-medium rounded-lg py-2 px-5 ${
              allUploaded
                ? "bg-indigo-600 hover:bg-indigo-700"
                : "bg-gray-400 cursor-not-allowed"
            }`}
          >
            {uploading ? "Uploading..." : allUploaded ? "Save and Close" : "Upload All Required Files"}
          </button>
        </div>
      </div>
    </div>
  );
}
