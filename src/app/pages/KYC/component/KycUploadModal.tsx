import { useState } from "react";
import { UploadCloud, X, RefreshCcw, Trash2, Loader2 } from "lucide-react";
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
  const [uploadingType, setUploadingType] = useState<string | null>(null);
  const [uploadedFiles, setUploadedFiles] = useState<Record<string, string>>({});

  const isBasic = mode === "basic";

  const uploadFields: {
    type: "front_id" | "back_id" | "selfie" | "passport";
    label: string;
    desc: string;
  }[] = isBasic
    ? [
        { type: "front_id", label: "Front of ID", desc: "Tải lên hình ảnh rõ ràng về mặt trước giấy tờ tùy thân của bạn.." },
        { type: "back_id", label: "Back of ID", desc: "Tải lên hình ảnh rõ ràng về mặt sau giấy tờ tùy thân của bạn.." },
      ]
    : [
        { type: "selfie", label: "Selfie", desc: "Chụp ảnh selfie cùng giấy tờ tùy thân của bạn." },
        { type: "passport", label: "Passport", desc: "Tải lên hình ảnh rõ ràng về hộ chiếu của bạn." },
      ];

  const requiredTypes = uploadFields.map((f) => f.type);
  const allUploaded = requiredTypes.every(
    (t) => uploadedFiles[t] || existingDocs.some((d) => d.type === t)
  );

// 📤 Handle upload
const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>, type: string) => {
  const file = event.target.files?.[0];
  if (!file) return;

  try {
    setUploadingType(type);
    const res = await uploadKycDocument(profileId, {
      type: type as "front_id" | "back_id" | "selfie" | "passport",
      file,
    });

    if (res.success && res.data && res.data.fileUrl) {
      // ✅ Ép kiểu rõ ràng, đảm bảo fileUrl là string
      const fileUrl: string = res.data.fileUrl;
      setUploadedFiles((prev): Record<string, string> => ({
        ...prev,
        [type]: fileUrl,
      }));
    } else {
      alert(`❌ Upload failed: ${res.message ?? "Unknown error"}`);
    }
  } catch (err) {
    console.error("❌ Upload error:", err);
    alert("Upload failed!");
  } finally {
    setUploadingType(null);
  }
};

// 🗑 Handle remove
const handleRemove = (type: string) => {
  setUploadedFiles((prev): Record<string, string> => {
    const updated = { ...prev };
    delete updated[type];
    return updated; // ✅ đảm bảo return lại object hoàn chỉnh
  });
};


  const handleSend = () => {
    if (!allUploaded) {
      alert("⚠️ Please upload all required documents before saving.");
      return;
    }
    alert("📤 Documents uploaded successfully!");
    onUploaded?.();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center">
      <div className="bg-white rounded-xl shadow-lg w-full max-w-2xl relative animate-fade-in">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-xl font-semibold">
            Tải lên tài liệu
            <span className="block text-sm text-gray-500 mt-1">
              {isBasic ? "Xác minh cơ bản" : "Xác minh nâng cao"}
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
            const fileUrl = uploadedFiles[field.type] || existing?.fileUrl;
            const isUploading = uploadingType === field.type;

            return (
              <div key={field.type} className="border border-gray-300 rounded-lg p-4 flex flex-col gap-3">
                <div>
                  <h4 className="font-semibold text-gray-800 text-sm">{field.label}</h4>
                  <p className="text-xs text-gray-500">{field.desc}</p>
                </div>

                {fileUrl ? (
                  <div className="relative w-full aspect-[4/3] rounded-lg overflow-hidden border border-gray-200 shadow-sm">
                    <img
                      src={fileUrl}
                      alt={field.label}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/50 opacity-0 hover:opacity-100 flex items-center justify-center gap-4 transition-opacity">
                      <label className="bg-yellow-500 hover:bg-yellow-600 text-white p-2 rounded-full cursor-pointer">
                        <RefreshCcw size={16} />
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => handleFileChange(e, field.type)}
                        />
                      </label>
                      <button
                        onClick={() => handleRemove(field.type)}
                        className="bg-red-500 hover:bg-red-600 text-white p-2 rounded-full"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ) : (
                  <label className="relative border-2 border-dashed border-indigo-300 rounded-md py-8 flex flex-col items-center justify-center text-indigo-500 hover:bg-indigo-50 cursor-pointer transition">
                    {isUploading ? (
                      <div className="flex flex-col items-center gap-2">
                        <Loader2 size={28} className="animate-spin text-indigo-500" />
                        <p className="text-xs text-gray-500">Uploading...</p>
                      </div>
                    ) : (
                      <>
                        <UploadCloud size={28} />
                        <p className="text-xs mt-2">Click to upload or drop a file</p>
                      </>
                    )}
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleFileChange(e, field.type)}
                      className="hidden"
                      disabled={isUploading}
                    />
                  </label>
                )}
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="border-t p-5 flex justify-end">
          <button
            onClick={handleSend}
            disabled={uploadingType !== null || !allUploaded}
            className={`text-white text-sm font-medium rounded-lg py-2 px-5 ${
              allUploaded
                ? "bg-indigo-600 hover:bg-indigo-700"
                : "bg-gray-400 cursor-not-allowed"
            }`}
          >
            {uploadingType
              ? "Đang tải..."
              : allUploaded
              ? "Lưu và đóng"
              : "Tải lên tất cả các tệp yêu cầu"}
          </button>
        </div>
      </div>
    </div>
  );
}
