import type React from "react"
import AddressCard from "./AddressCard"

interface Address {
  addressId: string
  label: string
  fullName: string
  phone: string
  line1: string
  wardCode: string
  districtId: number
  provinceId: number
  note: string
  isDefault: boolean
  createdAt: string
  updatedAt: string
}

interface AddressListProps {
  addresses: Address[]
  isLoading: boolean
  mode?: "profile" | "checkout"
  selectedAddressId?: string | null
  onSelect?: (id: string) => void
  onEdit: (address: Address) => void
  onDelete?: (addressId: string) => void
  onSetDefault?: (addressId: string) => void
}

const AddressList: React.FC<AddressListProps> = ({
  addresses,
  isLoading,
  mode = "profile",
  selectedAddressId,
  onSelect,
  onEdit,
  onDelete,
  onSetDefault,
}) => {
  if (isLoading) {
    return (
      <div className="p-8 text-center">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-gray-300 border-t-red-600"></div>
      </div>
    )
  }

  if (addresses.length === 0) {
    return <div className="p-8 text-center text-gray-500">Không có địa chỉ nào, hãy thêm địa chỉ mới!</div>
  }

  return (
    <div className="divide-y divide-gray-200">
      {addresses.map((address) => (
        <div
          key={address.addressId}
          onClick={() => mode === "checkout" && onSelect?.(address.addressId)}
          className={`transition-all ${mode === "checkout"
              ? `cursor-pointer hover:bg-blue-50 ${selectedAddressId === address.addressId ? "bg-blue-100 border-l-4 border-blue-600" : ""
              }`
              : ""
            }`}
        >
          <AddressCard
            address={address}
            mode={mode}
            onEdit={onEdit}
            onDelete={onDelete}
            onSetDefault={onSetDefault}
          />
        </div>
      ))}
    </div>
  )
}

export default AddressList
