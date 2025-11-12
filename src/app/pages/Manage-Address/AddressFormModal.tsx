import type React from "react";
import { useState, useEffect } from "react";
import { Form, Input, Select, Checkbox, message } from "antd";
import { MapPin, Home, Building2 } from "lucide-react";
import useProvinces from "../../hooks/useProvinces";
import type { District, Ward } from "../../hooks/useProvinces";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

interface Address {
  addressId: string;
  label: string;
  fullName: string;
  phone: string;
  line1: string;
  wardCode: string;
  districtId: number;
  provinceId: number;
  note: string;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

interface AddressFormData {
  label: string;
  fullName: string;
  phone: string;
  line1: string;
  wardCode: string;
  districtId: number;
  provinceId: number;
  note: string;
  isDefault: boolean;
}

interface AddressFormModalProps {
  address: Address | null;
  onClose: () => void;
  onSuccess: () => void;
  handleCreateAddress: (address: AddressFormData) => Promise<void>;
  handleUpdateAddress: (addressId: string, address: AddressFormData) => Promise<void>;
}

const AddressFormModal: React.FC<AddressFormModalProps> = ({
  address,
  onClose,
  onSuccess,
  handleCreateAddress,
  handleUpdateAddress,
}) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const { provinces, fetchDistricts, fetchWards } = useProvinces();

  const [districts, setDistricts] = useState<District[]>([]);
  const [wards, setWards] = useState<Ward[]>([]);
  const [selectedLabel, setSelectedLabel] = useState(address?.label || "Home");

  const handleProvinceChange = async (provinceId: number) => {
    form.setFieldsValue({ districtId: undefined, wardCode: undefined });
    setDistricts([]);
    setWards([]);

    const fetchedDistricts = await fetchDistricts(provinceId);
    setDistricts(fetchedDistricts);
  };

  const handleDistrictChange = async (districtId: number) => {
    form.setFieldsValue({ wardCode: undefined });
    setWards([]);

    const fetchedWards = await fetchWards(districtId);
    setWards(fetchedWards);
  };

  useEffect(() => {
    const loadAddressData = async () => {
      if (address) {
        const fetchedDistricts = await fetchDistricts(address.provinceId);
        setDistricts(fetchedDistricts);

        const fetchedWards = await fetchWards(address.districtId);
        setWards(fetchedWards);

        form.setFieldsValue({
          fullName: address.fullName,
          phone: address.phone,
          line1: address.line1,
          wardCode: address.wardCode,
          districtId: address.districtId,
          provinceId: address.provinceId,
          note: address.note,
          isDefault: address.isDefault,
        });

        setSelectedLabel(address.label);
      }
    };

    loadAddressData();
  }, [address, form, fetchDistricts, fetchWards]);

  const handleSubmit = async (values: AddressFormData) => {
    setLoading(true);
    try {
      const formData = {
        ...values,
        label: selectedLabel,
      };
      if (address) {
        await handleUpdateAddress(address.addressId, formData);
      } else {
        await handleCreateAddress(formData);
      }

      message.success(address ? "Address updated successfully" : "Address created successfully");
      onSuccess();
    } catch (error) {
      console.error("Error saving address:", error);
      message.error("Failed to save address");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={true} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-ocean-600 to-energy-600 bg-clip-text text-transparent flex items-center gap-2">
            <MapPin className="w-6 h-6 text-ocean-600" />
            {address ? "Update Address" : "Add New Address"}
          </DialogTitle>
          <DialogDescription>
            {address ? "Update your address information" : "Add a new delivery address to your account"}
          </DialogDescription>
        </DialogHeader>

        <Form form={form} layout="vertical" onFinish={handleSubmit} className="space-y-4">
          {/* Full Name and Phone */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Form.Item
              name="fullName"
              label={<span className="font-medium text-dark-800 dark:text-dark-200">Full Name</span>}
              rules={[{ required: true, message: "Please enter full name" }]}
            >
              <Input placeholder="Enter full name" size="large" className="rounded-lg" />
            </Form.Item>

            <Form.Item
              name="phone"
              label={<span className="font-medium text-dark-800 dark:text-dark-200">Phone Number</span>}
              rules={[{ required: true, message: "Please enter phone number" }]}
            >
              <Input placeholder="0912345678" size="large" className="rounded-lg" />
            </Form.Item>
          </div>

          {/* Province */}
          <Form.Item
            name="provinceId"
            label={<span className="font-medium text-dark-800 dark:text-dark-200">Province / City</span>}
            rules={[{ required: true, message: "Please select province" }]}
          >
            <Select
              placeholder="Select province"
              size="large"
              onChange={handleProvinceChange}
              showSearch
              filterOption={(input, option) =>
                (option?.children + "").toLowerCase().includes(input.toLowerCase())
              }
              className="rounded-lg"
            >
              {provinces.map((province) => (
                <Select.Option key={province.code} value={province.code}>
                  {province.name}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          {/* District */}
          <Form.Item
            name="districtId"
            label={<span className="font-medium text-dark-800 dark:text-dark-200">District</span>}
            rules={[{ required: true, message: "Please select district" }]}
          >
            <Select
              placeholder="Select district"
              size="large"
              onChange={handleDistrictChange}
              disabled={districts.length === 0}
              showSearch
              filterOption={(input, option) =>
                (option?.children + "").toLowerCase().includes(input.toLowerCase())
              }
              className="rounded-lg"
            >
              {districts.map((district) => (
                <Select.Option key={district.code} value={district.code}>
                  {district.name}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          {/* Ward */}
          <Form.Item
            name="wardCode"
            label={<span className="font-medium text-dark-800 dark:text-dark-200">Ward</span>}
            rules={[{ required: true, message: "Please select ward" }]}
          >
            <Select
              placeholder="Select ward"
              size="large"
              disabled={wards.length === 0}
              showSearch
              filterOption={(input, option) =>
                (option?.children + "").toLowerCase().includes(input.toLowerCase())
              }
              className="rounded-lg"
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
            label={<span className="font-medium text-dark-800 dark:text-dark-200">Detailed Address</span>}
            rules={[{ required: true, message: "Please enter detailed address" }]}
          >
            <Input.TextArea
              placeholder="Enter street address, building number, etc."
              rows={3}
              className="rounded-lg"
            />
          </Form.Item>

          {/* Note */}
          <Form.Item
            name="note"
            label={<span className="font-medium text-dark-800 dark:text-dark-200">Delivery Note (Optional)</span>}
          >
            <Input.TextArea
              placeholder="Any special delivery instructions..."
              rows={2}
              className="rounded-lg"
            />
          </Form.Item>

          {/* Address Type */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-dark-800 dark:text-dark-200">
              Address Type
            </label>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setSelectedLabel("Home")}
                className={cn(
                  "flex items-center gap-2 px-4 py-3 rounded-lg border-2 font-medium transition-all",
                  selectedLabel === "Home"
                    ? "border-ocean-500 bg-ocean-50 dark:bg-ocean-900/30 text-ocean-700 dark:text-ocean-300"
                    : "border-ocean-200 dark:border-ocean-800 text-dark-700 dark:text-dark-300 hover:border-ocean-300"
                )}
              >
                <Home className="w-5 h-5" />
                Home
              </button>
              <button
                type="button"
                onClick={() => setSelectedLabel("Office")}
                className={cn(
                  "flex items-center gap-2 px-4 py-3 rounded-lg border-2 font-medium transition-all",
                  selectedLabel === "Office"
                    ? "border-ocean-500 bg-ocean-50 dark:bg-ocean-900/30 text-ocean-700 dark:text-ocean-300"
                    : "border-ocean-200 dark:border-ocean-800 text-dark-700 dark:text-dark-300 hover:border-ocean-300"
                )}
              >
                <Building2 className="w-5 h-5" />
                Office
              </button>
            </div>
          </div>

          {/* Set as Default */}
          <Form.Item name="isDefault" valuePropName="checked">
            <Checkbox className="text-dark-800 dark:text-dark-200">
              Set as default address
            </Checkbox>
          </Form.Item>

          {/* Action Buttons */}
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={loading}
              className="w-full sm:w-auto"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="w-full sm:w-auto"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  {address ? "Updating..." : "Creating..."}
                </>
              ) : (
                address ? "Update Address" : "Create Address"
              )}
            </Button>
          </DialogFooter>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default AddressFormModal;
