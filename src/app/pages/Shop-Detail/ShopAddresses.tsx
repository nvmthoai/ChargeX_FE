import { Empty } from "antd";
import { MapPin, Phone, User, FileText } from "lucide-react";

interface Address {
  addressId: string;
  label: string;
  fullName: string;
  phone: string;
  line1: string;
  wardCode: string;
  districtId: number;
  provinceId: number;
  note?: string | null;
  isDefault: boolean;
}

export default function ShopAddresses({ addresses }: { addresses: Address[] }) {
  const defaultAddress = addresses.find((addr) => addr.isDefault);

  if (!defaultAddress) {
    return (
      <div className="p-6">
        <div className="bg-white rounded-xl shadow-sm p-12 text-center">
          <MapPin className="w-16 h-16 text-slate-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-slate-900 mb-2">
            Chưa có địa chỉ
          </h3>
          <p className="text-slate-600">
            Cửa hàng này chưa cung cấp địa chỉ mặc định.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="bg-gradient-to-br from-white to-blue-50 rounded-2xl shadow-lg border border-blue-100 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-500 to-indigo-600 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
              <MapPin className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-white text-lg">
                {defaultAddress.label}
              </h3>
              {defaultAddress.isDefault && (
                <span className="text-xs text-white/90 bg-white/20 px-2 py-0.5 rounded-full">
                  Địa chỉ mặc định
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-start gap-3 p-3 bg-white/60 rounded-lg">
              <div className="p-2 bg-blue-100 rounded-lg">
                <User className="w-4 h-4 text-blue-600" />
              </div>
              <div>
                <span className="text-xs text-slate-500 block mb-1">Người nhận</span>
                <p className="font-semibold text-slate-900">
                  {defaultAddress.fullName}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 bg-white/60 rounded-lg">
              <div className="p-2 bg-green-100 rounded-lg">
                <Phone className="w-4 h-4 text-green-600" />
              </div>
              <div>
                <span className="text-xs text-slate-500 block mb-1">Số điện thoại</span>
                <p className="font-semibold text-slate-900">
                  {defaultAddress.phone}
                </p>
              </div>
            </div>
          </div>

          <div className="p-4 bg-white/60 rounded-lg">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-indigo-100 rounded-lg">
                <MapPin className="w-4 h-4 text-indigo-600" />
              </div>
              <div className="flex-1">
                <span className="text-xs text-slate-500 block mb-1">Địa chỉ</span>
                <p className="font-medium text-slate-900 leading-relaxed">
                  {defaultAddress.line1}
                </p>
              </div>
            </div>
          </div>

          {defaultAddress.note && (
            <div className="p-4 bg-amber-50 rounded-lg border border-amber-200">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-amber-100 rounded-lg">
                  <FileText className="w-4 h-4 text-amber-600" />
                </div>
                <div className="flex-1">
                  <span className="text-xs text-amber-700 block mb-1 font-medium">Ghi chú</span>
                  <p className="text-sm text-amber-900">{defaultAddress.note}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
