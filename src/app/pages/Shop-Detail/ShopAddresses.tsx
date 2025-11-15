import { Empty } from "antd";
import { HomeOutlined } from "@ant-design/icons";

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
      <div className="bg-slate-50 p-6 rounded-lg">
        <Empty description="No default address available" />
      </div>
    );
  }

  return (
    <div className="bg-slate-50 p-6 rounded-lg">
      <div className="bg-white p-4 rounded-lg border border-slate-200">
        <div className="flex items-center gap-3 mb-4">
          <HomeOutlined className="text-blue-500" />
          <span className="font-medium">{defaultAddress.label}</span>
        </div>

        <div className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <span className="text-slate-500 text-sm">Recipient Name:</span>
              <p className="font-medium text-slate-900">
                {defaultAddress.fullName}
              </p>
            </div>
            <div>
              <span className="text-slate-500 text-sm">Phone:</span>
              <p className="font-medium text-slate-900">
                {defaultAddress.phone}
              </p>
            </div>
          </div>

          <div>
            <span className="text-slate-500 text-sm">Address:</span>
            <p className="font-medium text-slate-900">{defaultAddress.line1}</p>
          </div>

          {defaultAddress.note && (
            <div>
              <span className="text-slate-500 text-sm">Note:</span>
              <p className="text-slate-700">{defaultAddress.note}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
