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
  onEdit: (address: Address) => void
  onDelete: (addressId: string) => void
  onSetDefault: (addressId: string) => void
}

const AddressList: React.FC<AddressListProps> = ({ addresses, isLoading, onEdit, onDelete, onSetDefault }) => {
  if (isLoading) {
    return (
      <div className="p-8 text-center">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-gray-300 border-t-red-600"></div>
      </div>
    )
  }

  if (addresses.length === 0) {
    return <div className="p-8 text-center text-gray-500">No addresses yet. Add a new address!</div>
  }

  return (
    <div className="divide-y divide-gray-200">
      {addresses.map((address) => (
        <AddressCard
          key={address.addressId}
          address={address}
          onEdit={onEdit}
          onDelete={onDelete}
          onSetDefault={onSetDefault}
        />
      ))}
    </div>
  )
}

export default AddressList
