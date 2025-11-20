// src/app/pages/Manage-Address/AddressFormModal.tsx
import React, { useState, useEffect } from "react";
import { Form, Input, Select, Checkbox, Button, message } from "antd";
import useProvinces from "../../hooks/useProvinces";

interface AddressFormModalProps {
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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-[800px] max-h-[90vh] overflow-y-auto py-10 px-20">
        <h2 className="text-2xl font-semibold mb-6 text-center">
          {address ? "Cập nhật địa chỉ" : "Thêm địa chỉ mới"}
        </h2>

        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <div className="grid grid-cols-2 gap-4">
            <Form.Item name="fullName" label="Họ và tên" rules={[{ required: true, message: "Vui lòng nhập họ tên" }]}>
              <Input size="large" placeholder="Nguyễn Văn A" />
            </Form.Item>
            <Form.Item name="phone" label="Số điện thoại" rules={[{ required: true, message: "Vui lòng nhập số điện thoại" }]}>
              <Input size="large" placeholder="0901234567" />
            </Form.Item>
          </div>

          <Form.Item name="provinceId" label="Tỉnh/Thành phố" rules={[{ required: true }]}>
            <Select
              size="large"
              loading={loadingProvinces}
              placeholder={loadingProvinces ? "Đang tải tỉnh..." : "Chọn tỉnh/thành phố"}
              onChange={handleProvinceChange}
              showSearch
              optionFilterProp="children"
            >
              {provinces.map((p) => (
                <Select.Option key={p.code} value={p.code}>
                  {p.name}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item name="districtId" label="Quận/Huyện" rules={[{ required: true }]}>
            <Select
              size="large"
              disabled={hookDistricts.length === 0}
              placeholder={hookDistricts.length === 0 ? "Chọn tỉnh trước" : "Chọn quận/huyện"}
              onChange={handleDistrictChange}
              showSearch
              optionFilterProp="children"
            >
              {hookDistricts.map((d) => (
                <Select.Option key={d.code} value={d.code}>
                  {d.name}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item name="wardCode" label="Phường/Xã" rules={[{ required: true }]}>
            <Select
              size="large"
              disabled={hookWards.length === 0}
              placeholder={hookWards.length === 0 ? "Chọn quận/huyện trước" : "Chọn phường/xã"}
              showSearch
              optionFilterProp="children"
            >
              {hookWards.map((w) => (
                <Select.Option key={w.code} value={w.code}>
                  {w.name}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item name="line1" label="Địa chỉ chi tiết" rules={[{ required: true }]}>
            <Input.TextArea rows={3} placeholder="Ví dụ: 123 Đường Láng, Phường Láng Thượng" />
          </Form.Item>

          <Form.Item name="note" label="Ghi chú (tùy chọn)">
            <Input.TextArea rows={2} />
          </Form.Item>

          <div className="mb-6">
            <label className="font-medium block mb-2">Loại địa chỉ</label>
            <div className="flex gap-4">
              <Button
                type={selectedLabel === "Home" ? "primary" : "default"}
                onClick={() => setSelectedLabel("Home")}
              >
                Nhà riêng
              </Button>
              <Button
                type={selectedLabel === "Office" ? "primary" : "default"}
                onClick={() => setSelectedLabel("Office")}
              >
                Công ty
              </Button>
            </div>
          </div>

          <Form.Item name="isDefault" valuePropName="checked">
            <Checkbox>Đặt làm địa chỉ mặc định</Checkbox>
          </Form.Item>

          <div className="flex justify-end gap-4 mt-8">
            <Button size="large" onClick={onClose}>Hủy</Button>
            <Button size="large" type="primary" htmlType="submit" loading={loading}>
              {address ? "Cập nhật" : "Thêm địa chỉ"}
            </Button>
          </div>
        </Form>
      </div>
    </div>
  );
};

export default AddressFormModal;