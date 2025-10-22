export interface Address {
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
  
  export interface AddressFormData {
    label: string
    fullName: string
    phone: string
    line1: string
    wardCode: string
    districtId: number
    provinceId: number
    note: string
    isDefault: boolean
  }