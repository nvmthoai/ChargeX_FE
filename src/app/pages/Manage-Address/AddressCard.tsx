"use client"

import type React from "react"

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

interface AddressCardProps {
  address: Address
  onEdit: (address: Address) => void
  onDelete: (addressId: string) => void
  onSetDefault: (addressId: string) => void
}

const AddressCard: React.FC<AddressCardProps> = ({ address, onEdit, onDelete, onSetDefault }) => {
  return (
    <div className="p-6 hover:bg-gray-50 transition-colors">
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <h3 className="text-lg font-semibold text-gray-900">{address.fullName}</h3>
            <span className="text-gray-500">|</span>
            <span className="text-gray-600">{address.phone}</span>
            {address.isDefault && (
              <span className="px-3 py-1 bg-red-100 text-red-600 text-sm font-medium rounded border border-red-300">
                Default
              </span>
            )}
            {address.label === "Office" && (
              <span className="px-3 py-1 bg-gray-100 text-gray-600 text-sm font-medium rounded border border-gray-300">
                Pickup Address
              </span>
            )}
          </div>
          <p className="text-gray-600 mb-1">{address.line1}</p>
          <p className="text-gray-600">{address.note}</p>
        </div>

        <div className="flex items-center gap-3 ml-6">
          <button onClick={() => onEdit(address)} className="text-blue-600 hover:text-blue-700 font-medium">
            Update
          </button>
          {!address.isDefault && (
            <>
              <button
                onClick={() => onDelete(address.addressId)}
                className="text-blue-600 hover:text-blue-700 font-medium"
              >
                Delete
              </button>
              <button
                onClick={() => onSetDefault(address.addressId)}
                className="px-4 py-2 border border-gray-300 hover:border-gray-400 text-gray-700 rounded-lg font-medium transition-colors"
              >
                Set as Default
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default AddressCard
