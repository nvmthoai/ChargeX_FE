import type React from "react"
import { useState, useEffect } from "react"
import { Form, Input, Select, Checkbox, Button, message } from "antd"
import useProvinces from "../../hooks/useProvinces"
import type { District, Ward } from "../../hooks/useProvinces"

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

interface AddressFormData {
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

interface AddressFormModalProps {
  address: Address | null
  onClose: () => void
  onSuccess: () => void
  handleCreateAddress: (address: AddressFormData) => Promise<void>
  handleUpdateAddress: (addressId: string, address: AddressFormData) => Promise<void>
}

const AddressFormModal: React.FC<AddressFormModalProps> = ({
  address,
  onClose,
  onSuccess,
  handleCreateAddress,
  handleUpdateAddress,
}) => {
  const [form] = Form.useForm()
  const [loading, setLoading] = useState(false)
  const { provinces, fetchDistricts, fetchWards } = useProvinces()

  const [districts, setDistricts] = useState<District[]>([])
  const [wards, setWards] = useState<Ward[]>([])
  const [selectedLabel, setSelectedLabel] = useState(address?.label || "Home")

  const handleProvinceChange = async (provinceId: number) => {
    form.setFieldsValue({ districtId: undefined, wardCode: undefined })
    setDistricts([])
    setWards([])

    const fetchedDistricts = await fetchDistricts(provinceId)
    setDistricts(fetchedDistricts)
  }

  const handleDistrictChange = async (districtId: number) => {
    form.setFieldsValue({ wardCode: undefined })
    setWards([])

    const fetchedWards = await fetchWards(districtId)
    setWards(fetchedWards)
  }

  useEffect(() => {
    const loadAddressData = async () => {
      if (address) {
        // First load districts for the province
        const fetchedDistricts = await fetchDistricts(address.provinceId)
        setDistricts(fetchedDistricts)

        // Then load wards for the district
        const fetchedWards = await fetchWards(address.districtId)
        setWards(fetchedWards)

        // Set form values after data is loaded
        form.setFieldsValue({
          fullName: address.fullName,
          phone: address.phone,
          line1: address.line1,
          wardCode: address.wardCode,
          districtId: address.districtId,
          provinceId: address.provinceId,
          note: address.note,
          isDefault: address.isDefault,
        })

        setSelectedLabel(address.label)
      }
    }

    loadAddressData()
  }, [address])

  const handleSubmit = async (values: AddressFormData) => {
    setLoading(true)
    try {
      const formData = {
        ...values,
        label: selectedLabel,
      }
      if (address) {
        await handleUpdateAddress(address.addressId, formData)
      } else {
        await handleCreateAddress(formData)
      }

      onSuccess()
    } catch (error) {
      console.error("Error saving address:", error)
      message.error("Failed to save address")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-[800px] max-h-[90vh] overflow-y-auto py-10 px-20">
        <div className="p-6">
          <h2 className="text-2xl font-semibold text-gray-900">{address ? "Update Address" : "Add New Address"}</h2>
        </div>

        <Form form={form} layout="vertical" onFinish={handleSubmit} className="p-6">
          {/* Full Name and Phone */}
          <div className="grid grid-cols-2 gap-4">
            <Form.Item
              name="fullName"
              label="Full Name"
              rules={[{ required: true, message: "Please enter full name" }]}
            >
              <Input placeholder="Leonardo DiCaprio" size="large" />
            </Form.Item>

            <Form.Item
              name="phone"
              label="Phone Number"
              rules={[{ required: true, message: "Please enter phone number" }]}
            >
              <Input placeholder="0912345678" size="large" />
            </Form.Item>
          </div>

          {/* Province */}
          <Form.Item
            name="provinceId"
            label="Province / City"
            rules={[{ required: true, message: "Please select province" }]}
          >
            <Select
              placeholder="Select province"
              size="large"
              onChange={handleProvinceChange}
              showSearch
              filterOption={(input, option) => (option?.children +'').toLowerCase().includes(input.toLowerCase())}
            >
              {provinces.map((province) => (
                <Select.Option key={province.code} value={province.code}>
                  {province.name}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          {/* District */}
          <Form.Item name="districtId" label="District" rules={[{ required: true, message: "Please select district" }]}>
            <Select
              placeholder="Select district"
              size="large"
              onChange={handleDistrictChange}
              disabled={districts.length === 0}
              showSearch
              filterOption={(input, option) => (option?.children +'').toLowerCase().includes(input.toLowerCase())}
            >
              {districts.map((district) => (
                <Select.Option key={district.code} value={district.code}>
                  {district.name}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          {/* Ward */}
          <Form.Item name="wardCode" label="Ward" rules={[{ required: true, message: "Please select ward" }]}>
            <Select
              placeholder="Select ward"
              size="large"
              disabled={wards.length === 0}
              showSearch
              filterOption={(input, option) => (option?.children +'').toLowerCase().includes(input.toLowerCase())}
            >
              {wards.map((ward) => (
                <Select.Option key={ward.code} value={ward.code.toString()}>
                  {ward.name}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          {/* Detailed Address */}
          <Form.Item
            name="line1"
            label="Detailed Address"
            rules={[{ required: true, message: "Please enter detailed address" }]}
          >
            <Input.TextArea placeholder="123 google, hehe" rows={3} />
          </Form.Item>

          {/* Note */}
          <Form.Item name="note" label="Delivery Note">
            <Input.TextArea placeholder="Delivery note" rows={2} />
          </Form.Item>

          {/* Map Placeholder */}
          <div className="bg-gray-100 rounded-lg h-48 flex items-center justify-center mb-6">
            <div className="text-center text-gray-500">
              <svg className="w-12 h-12 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
              <p>Google Maps Integration</p>
            </div>
          </div>

          {/* Address Type */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">Address Type</label>
            <div className="flex gap-4">
              <Button
                type={selectedLabel === "Home" ? "primary" : "default"}
                danger={selectedLabel === "Home"}
                size="large"
                onClick={() => setSelectedLabel("Home")}
              >
                Home
              </Button>
              <Button
                type={selectedLabel === "Office" ? "primary" : "default"}
                danger={selectedLabel === "Office"}
                size="large"
                onClick={() => setSelectedLabel("Office")}
              >
                Office
              </Button>
            </div>
          </div>

          {/* Set as Default */}
          <Form.Item name="isDefault" valuePropName="checked">
            <Checkbox>Set as default address</Checkbox>
          </Form.Item>

          {/* Action Buttons */}
          <div className="flex justify-end gap-4 pt-4">
            <Button size="large" onClick={onClose}>
              Cancel
            </Button>
            <Button type="primary" danger size="large" htmlType="submit" loading={loading}>
              {address ? "Update" : "Create"}
            </Button>
          </div>
        </Form>
      </div>
    </div>
  )
}

export default AddressFormModal
