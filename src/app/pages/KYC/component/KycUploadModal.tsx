import { UploadCloud, X } from "lucide-react";

interface KycUploadModalProps {
  mode: "basic" | "advanced";
  onClose: () => void;
}

export default function KycUploadModal({ mode, onClose }: KycUploadModalProps) {
  const isBasic = mode === "basic";

  const uploadFields = isBasic
    ? [
        { label: "Front of ID", desc: "Upload a clear image of the front of your ID." },
        { label: "Back of ID", desc: "Upload a clear image of the back of your ID." },
      ]
    : [
        { label: "Front of ID", desc: "Front image of your ID." },
        { label: "Back of ID", desc: "Back image of your ID." },
        { label: "Proof of Financials", desc: "Upload financial proof (e.g. bank statement)." },
      ];

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
            <div key={field.label} className="border border-gray-300 rounded-lg p-4 flex flex-col gap-3">
              <div>
                <h4 className="font-semibold text-gray-800 text-sm">{field.label}</h4>
                <p className="text-xs text-gray-500">{field.desc}</p>
              </div>
              <div className="border-2 border-dashed border-indigo-300 rounded-md py-8 flex flex-col items-center justify-center text-indigo-500 hover:bg-indigo-50 cursor-pointer">
                <UploadCloud size={28} />
                <p className="text-xs mt-2">Drag & drop or click to upload</p>
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="border-t p-5 flex justify-end">
          <button className="bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg py-2 px-5">
            Send for Review
          </button>
        </div>
      </div>
    </div>
  );
}
