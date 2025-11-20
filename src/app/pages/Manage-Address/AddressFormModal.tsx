// src/app/pages/Manage-Address/AddressFormModal.tsx
import React, { useState, useEffect } from "react";
import { Form, Input, Select, Checkbox, Button, message } from "antd";
import { MapPin, Home, Building2 } from "lucide-react";
import useProvinces from "../../hooks/useProvinces";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

interface AddressFormModalProps {
  open: boolean;
  address?: {
    addressId?: string;
    fullName: string;
    phone: string;
    provinceId: number;
    districtId: number;
    wardCode: string;
    line1: string;
    note?: string;
    isDefault?: boolean;
    label?: string;
  };
  onClose: () => void;
  onSuccess?: (newAddress: any) => void;
  handleCreateAddress?: (address: any) => Promise<any>;
  handleUpdateAddress?: (addressId: string, address: any) => Promise<void>;
}

const AddressFormModal: React.FC<AddressFormModalProps> = ({
  open,
  address,
  onClose,
  onSuccess,
  handleCreateAddress,
  handleUpdateAddress,
}) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [selectedLabel, setSelectedLabel] = useState<string>(address?.label || "Home");

  const {
    provinces,
    districts: hookDistricts,
    wards: hookWards,
    loading: loadingProvinces,
    fetchDistricts,
    fetchWards,
  } = useProvinces();

  const handleProvinceChange = async (provinceCode: number) => {
    form.setFieldsValue({ districtId: undefined, wardCode: undefined });
    await fetchDistricts(provinceCode);
  };

  const handleDistrictChange = async (districtCode: number) => {
    form.setFieldsValue({ wardCode: undefined });
    await fetchWards(districtCode);
  };

  // Khi sửa địa chỉ → tự động load quận/huyện + phường/xã
  useEffect(() => {
    if (!address || provinces.length === 0) return;

    const loadData = async () => {
      await fetchDistricts(address.provinceId);
      await fetchWards(address.districtId);

      form.setFieldsValue({
        fullName: address.fullName,
        phone: address.phone,
        line1: address.line1,
        provinceId: address.provinceId,
        districtId: address.districtId,
        wardCode: address.wardCode,
        note: address.note,
        isDefault: address.isDefault,
      });
    };

    loadData();
  }, [address, provinces.length, fetchDistricts, fetchWards, form]);

  const handleSubmit = async (values: any) => {
    setLoading(true);
    try {
      const payload = {
        ...values,
        label: selectedLabel,
        provinceId: Number(values.provinceId),
        districtId: Number(values.districtId),
        wardCode: String(values.wardCode),
      };

      let resultAddress: any;

      if (address?.addressId && handleUpdateAddress) {
        await handleUpdateAddress(address.addressId, payload);
        resultAddress = { ...payload, addressId: address.addressId };
      } else if (handleCreateAddress) {
        resultAddress = await handleCreateAddress(payload);
      }

      message.success(address ? "Cập nhật địa chỉ thành công!" : "Thêm địa chỉ mới thành công!");
      onSuccess?.(resultAddress || payload);
      onClose();
    } catch (err: any) {
      message.error(err?.response?.data?.message || "Lưu địa chỉ thất bại!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(open) => !open && !loading && onClose()}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-ocean-600 to-energy-600 bg-clip-text text-transparent flex items-center gap-2">
            <MapPin className="w-6 h-6 text-ocean-600" />
            {address ? "Cập nhật địa chỉ" : "Thêm địa chỉ mới"}
          </DialogTitle>
          <DialogDescription>
            {address
              ? "Cập nhật thông tin địa chỉ của bạn"
              : "Thêm địa chỉ mới để nhận hàng"}
          </DialogDescription>
        </DialogHeader>

        <Form form={form} layout="vertical" onFinish={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Form.Item
              name="fullName"
              label={<span className="font-medium text-dark-800 dark:text-dark-200">Họ và tên</span>}
              rules={[{ required: true, message: "Vui lòng nhập họ tên" }]}
            >
              <Input size="large" placeholder="Nguyễn Văn A" className="rounded-lg" />
            </Form.Item>
            <Form.Item
              name="phone"
              label={<span className="font-medium text-dark-800 dark:text-dark-200">Số điện thoại</span>}
              rules={[{ required: true, message: "Vui lòng nhập số điện thoại" }]}
            >
              <Input size="large" placeholder="0901234567" className="rounded-lg" />
            </Form.Item>
          </div>

          <Form.Item
            name="provinceId"
            label={<span className="font-medium text-dark-800 dark:text-dark-200">Tỉnh/Thành phố</span>}
            rules={[{ required: true, message: "Vui lòng chọn tỉnh/thành phố" }]}
          >
            <Select
              size="large"
              loading={loadingProvinces}
              placeholder={loadingProvinces ? "Đang tải tỉnh..." : "Chọn tỉnh/thành phố"}
              onChange={handleProvinceChange}
              showSearch
              optionFilterProp="children"
              className="rounded-lg"
            >
              {provinces.map((p) => (
                <Select.Option key={p.code} value={p.code}>
                  {p.name}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="districtId"
            label={<span className="font-medium text-dark-800 dark:text-dark-200">Quận/Huyện</span>}
            rules={[{ required: true, message: "Vui lòng chọn quận/huyện" }]}
          >
            <Select
              size="large"
              disabled={hookDistricts.length === 0}
              placeholder={hookDistricts.length === 0 ? "Chọn tỉnh trước" : "Chọn quận/huyện"}
              onChange={handleDistrictChange}
              showSearch
              optionFilterProp="children"
              className="rounded-lg"
            >
              {hookDistricts.map((d) => (
                <Select.Option key={d.code} value={d.code}>
                  {d.name}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="wardCode"
            label={<span className="font-medium text-dark-800 dark:text-dark-200">Phường/Xã</span>}
            rules={[{ required: true, message: "Vui lòng chọn phường/xã" }]}
          >
            <Select
              size="large"
              disabled={hookWards.length === 0}
              placeholder={hookWards.length === 0 ? "Chọn quận/huyện trước" : "Chọn phường/xã"}
              showSearch
              optionFilterProp="children"
              className="rounded-lg"
            >
              {hookWards.map((w) => (
                <Select.Option key={w.code} value={w.code}>
                  {w.name}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="line1"
            label={<span className="font-medium text-dark-800 dark:text-dark-200">Địa chỉ chi tiết</span>}
            rules={[{ required: true, message: "Vui lòng nhập địa chỉ chi tiết" }]}
          >
            <Input.TextArea
              rows={3}
              placeholder="Ví dụ: 123 Đường Láng, Phường Láng Thượng"
              className="rounded-lg"
            />
          </Form.Item>

          <Form.Item
            name="note"
            label={<span className="font-medium text-dark-800 dark:text-dark-200">Ghi chú (tùy chọn)</span>}
          >
            <Input.TextArea rows={2} className="rounded-lg" />
          </Form.Item>

          <div className="p-4 bg-ocean-50 dark:bg-ocean-900/20 rounded-lg">
            <label className="font-medium text-dark-800 dark:text-dark-200 block mb-3">
              Loại địa chỉ
            </label>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setSelectedLabel("Home")}
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl border-2 transition-all ${
                  selectedLabel === "Home"
                    ? "bg-ocean-500 text-white border-ocean-600 shadow-md"
                    : "bg-white text-ocean-700 border-ocean-200 hover:border-ocean-300"
                }`}
              >
                <Home className="w-5 h-5" />
                <span className="font-semibold">Nhà riêng</span>
              </button>
              <button
                type="button"
                onClick={() => setSelectedLabel("Office")}
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl border-2 transition-all ${
                  selectedLabel === "Office"
                    ? "bg-ocean-500 text-white border-ocean-600 shadow-md"
                    : "bg-white text-ocean-700 border-ocean-200 hover:border-ocean-300"
                }`}
              >
                <Building2 className="w-5 h-5" />
                <span className="font-semibold">Công ty</span>
              </button>
            </div>
          </div>

          <Form.Item name="isDefault" valuePropName="checked">
            <div className="flex items-center gap-2 p-3 bg-white rounded-lg border border-ocean-200/50">
              <Checkbox className="rounded" />
              <span className="text-dark-800 dark:text-dark-200 font-medium">
                Đặt làm địa chỉ mặc định
              </span>
            </div>
          </Form.Item>

          <DialogFooter className="gap-2 sm:gap-0 mt-6">
            <Button
              size="large"
              onClick={onClose}
              disabled={loading}
              className="rounded-xl"
            >
              Hủy
            </Button>
            <Button
              size="large"
              type="primary"
              htmlType="submit"
              loading={loading}
              className="bg-gradient-to-r from-ocean-500 to-energy-500 hover:from-ocean-600 hover:to-energy-600 rounded-xl font-semibold"
            >
              {address ? "Cập nhật" : "Thêm địa chỉ"}
            </Button>
          </DialogFooter>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default AddressFormModal;