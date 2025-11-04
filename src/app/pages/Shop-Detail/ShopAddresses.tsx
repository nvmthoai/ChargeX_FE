import { Empty, Tag, Collapse } from "antd"
import { HomeOutlined } from "@ant-design/icons"

interface Address {
  addressId: string
  label: string
  fullName: string
  phone: string
  line1: string
  wardCode: string
  districtId: number
  provinceId: number
  note?: string | null
  isDefault: boolean
}

export default function ShopAddresses({ addresses }: { addresses: Address[] }) {
  if (addresses.length === 0) {
    return (
      <div className="bg-slate-50 p-6 rounded-lg">
        <Empty description="No addresses available" />
      </div>
    )
  }

  const items = addresses.map((addr) => ({
    key: addr.addressId,
    label: (
      <div className="flex items-center gap-3">
        <HomeOutlined className="text-blue-500" />
        <span className="font-medium">{addr.label}</span>
        {addr.isDefault && <Tag color="blue">Default</Tag>}
      </div>
    ),
    children: (
      <div className="space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <span className="text-slate-500 text-sm">Recipient Name:</span>
            <p className="font-medium text-slate-900">{addr.fullName}</p>
          </div>
          <div>
            <span className="text-slate-500 text-sm">Phone:</span>
            <p className="font-medium text-slate-900">{addr.phone}</p>
          </div>
        </div>

        <div>
          <span className="text-slate-500 text-sm">Address:</span>
          <p className="font-medium text-slate-900">{addr.line1}</p>
        </div>

        {addr.note && (
          <div>
            <span className="text-slate-500 text-sm">Note:</span>
            <p className="text-slate-700">{addr.note}</p>
          </div>
        )}
      </div>
    ),
  }))

  return (
    <div className="bg-slate-50 p-6 rounded-lg">
      <Collapse items={items} />
    </div>
  )
}
