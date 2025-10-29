import { CheckCircle, Clock, FileText, Shield, XCircle } from "lucide-react";
import type { KycProfile } from "../../../../api/kyc/type";
import KycActionButton from "./KycActionButton";

export default function KycProfileView({ kyc }: { kyc: KycProfile }) {
  const statusColor =
    kyc.status === "approved"
      ? "bg-green-100 text-green-700 border-green-300"
      : kyc.status === "rejected"
      ? "bg-red-100 text-red-700 border-red-300"
      : "bg-yellow-100 text-yellow-700 border-yellow-300";

  const statusIcon =
    kyc.status === "approved"
      ? <CheckCircle className="text-green-600" size={18} />
      : kyc.status === "rejected"
      ? <XCircle className="text-red-600" size={18} />
      : <Clock className="text-yellow-600" size={18} />;

  return (
    <div className="rounded-2xl border border-slate-200 bg-gradient-to-br from-indigo-50 via-white to-blue-50 shadow-md p-6 space-y-6 transition-all duration-300 hover:shadow-lg">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-full bg-indigo-100 text-indigo-600">
            <Shield size={26} />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-indigo-800">
              Your KYC Profile
            </h2>
            <p className="text-sm text-gray-500">
              Verification details and document status
            </p>
          </div>
        </div>

        <div
          className={`flex items-center gap-2 text-sm font-medium px-3 py-1.5 rounded-full border ${statusColor}`}
        >
          {statusIcon}
          <span className="capitalize">{kyc.status}</span>
        </div>
      </div>

      {/* Info grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
        <div className="bg-white/60 rounded-lg p-4 shadow-sm border border-slate-100">
          <p className="text-xs text-gray-500 uppercase">Verification Level</p>
          <p className="text-base font-semibold text-slate-800 capitalize">
            {kyc.level}
          </p>
        </div>
        <div className="bg-white/60 rounded-lg p-4 shadow-sm border border-slate-100">
          <p className="text-xs text-gray-500 uppercase">Last Updated</p>
          <p className="text-base font-semibold text-slate-800">
          {kyc.updatedAt ? new Date(kyc.updatedAt).toLocaleDateString() : "—"}

          </p>
        </div>
      </div>

      {kyc.note && (
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-3 rounded-md text-sm text-yellow-800">
          <strong>Note:</strong> {kyc.note}
        </div>
      )}

      {/* Documents */}
      {kyc.documents?.length > 0 ? (
        <div className="bg-white rounded-lg border border-slate-100 p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <FileText className="text-indigo-500" size={18} />
            <p className="font-medium text-slate-800">Uploaded Documents</p>
          </div>
          <ul className="space-y-2 text-sm">
            {kyc.documents.map((doc) => (
              <li
                key={doc.kycDocumentId}
                className="flex justify-between items-center bg-slate-50 hover:bg-indigo-50 px-3 py-2 rounded-md transition"
              >
                <span className="capitalize text-slate-700">{doc.type} </span>
                {doc.fileUrl ? (
                  /\.(jpe?g|png|gif|webp|avif|svg|bmp)(\?.*)?$/i.test(doc.fileUrl) ? (
                    <a
                      href={doc.fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 ml-3"
                    >
                      <img
                        src={doc.fileUrl}
                        alt={`${doc.type} preview`}
                        className="w-16 h-10 object-cover rounded-md border"
                        onError={(e) => {
                          (e.currentTarget as HTMLImageElement).style.display = "none";
                        }}
                      />
                     
                    </a>
                  ) : (
                    <a
                      href={doc.fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 ml-3 text-indigo-600 hover:underline"
                    >
                      <FileText size={16} />
                      <span className="truncate text-sm">{doc.type || doc.fileUrl}</span>
                    </a>
                  )
                ) : (
                  <span className="ml-3 text-sm text-gray-400">No file</span>
                )}

                {/* <span
                  className={`text-xs font-semibold px-2 py-1 rounded-md ${
                    doc.status === "approved"
                      ? "bg-green-100 text-green-700"
                      : doc.status === "pending"
                      ? "bg-yellow-100 text-yellow-700"
                      : "bg-red-100 text-red-700"
                  }`}
                >
                  {doc.status}
                </span> */}
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <div className="text-sm text-gray-500 italic">
          No documents uploaded yet.
        </div>
      )}

      {/* Actions */}
      <div className="pt-2">
        <KycActionButton kyc={kyc} />
      </div>
    </div>
  );
}
