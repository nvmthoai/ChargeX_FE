import { Input, Select, Button, Space, Tooltip } from "antd";
import {
  SearchOutlined,
  ReloadOutlined,
  FilterOutlined,
  SortAscendingOutlined,
  SortDescendingOutlined,
} from "@ant-design/icons";
// import type { OrderStatus } from "../../../../api/order/type";

interface StatusOption {
  label: string;
  value: string;
}

interface Props {
  keyword: string;
  onKeywordChange: (v: string) => void;

  status?: string;
  onStatusChange: (v?: string) => void;

  sort?: string;
  onSortChange: (v?: string) => void;

  onSearch: () => void;
  onReset: () => void;

  /** 🟢 Cho phép truyền option trạng thái từ ngoài vào */
  statusOptions?: StatusOption[];
}

export default function FilterProduct({
  keyword,
  onKeywordChange,

  status,
  onStatusChange,

  sort,
  onSortChange,

  onSearch,
  onReset,

  statusOptions,
}: Props) {

  // 🟢 Default option dành cho sản phẩm (nếu không truyền từ ngoài vào)
  const defaultStatusOptions: StatusOption[] = [
    { label: "Đang bán", value: "active" },
    { label: "Đã bán", value: "sold" },
    { label: "Tạm ẩn", value: "draft" },
  ];

  const finalStatusOptions = statusOptions ?? defaultStatusOptions;

  return (
    <div className="flex flex-wrap justify-between items-center gap-3 bg-white px-5 py-4">

      {/* 🔍 Tìm kiếm */}
      <Input
        placeholder="Tìm..."
        prefix={<SearchOutlined className="text-gray-400" />}
        value={keyword}
        onChange={(e) => onKeywordChange(e.target.value)}
        style={{ width: 250 }}
        allowClear
      />

      {/* 📦 Trạng thái */}
      <Select
        allowClear
        placeholder="Trạng thái"
        value={status}
        onChange={(val) => onStatusChange(val ?? undefined)}
        style={{ width: 160 }}
        options={finalStatusOptions}
      />

      {/* 🕒 Sắp xếp */}
      <Select
        allowClear
        placeholder="Sắp xếp theo"
        value={sort}
        onChange={(val) => onSortChange(val ?? undefined)}
        style={{ width: 180 }}
        options={[
          {
            label: (
              <span className="flex items-center gap-2">
                <SortDescendingOutlined /> Ngày tạo (mới nhất)
              </span>
            ),
            value: "newest",
          },
          {
            label: (
              <span className="flex items-center gap-2">
                <SortAscendingOutlined /> Ngày tạo (cũ nhất)
              </span>
            ),
            value: "oldest",
          },
        ]}
      />

      {/* ⚙️ Nút hành động */}
      <Space>
        <Tooltip title="Tìm theo điều kiện hiện tại">
          <Button
            type="primary"
            icon={<FilterOutlined />}
            onClick={onSearch}
            className="bg-blue-600 hover:bg-blue-700"
          >
            Tìm kiếm
          </Button>
        </Tooltip>

        <Tooltip title="Đặt lại tất cả bộ lọc">
          <Button icon={<ReloadOutlined />} onClick={onReset}>
            Làm mới
          </Button>
        </Tooltip>
      </Space>
    </div>
  );
}
