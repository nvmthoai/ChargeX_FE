import Select from "@/app/components/Table/Select";
import {
  Search,
  Filter,
  RefreshCw,
  ArrowDownAZ,
  ArrowUpAZ,
} from "lucide-react";

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
  const defaultStatusOptions: StatusOption[] = [
    { label: "Active", value: "active" },
    { label: "Sold", value: "sold" },
    { label: "Draft", value: "draft" },
  ];

  const finalStatusOptions = statusOptions ?? defaultStatusOptions;

  return (
    <div className="flex flex-wrap justify-between items-center gap-3 bg-white px-5 py-4 border-b border-gray-200 rounded-t-xl">

      {/* 🔍 Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          placeholder="Search..."
          value={keyword}
          onChange={(e) => onKeywordChange(e.target.value)}
          className="pl-10 pr-3 py-2 w-60 border border-gray-200 rounded-lg text-sm focus:ring-1 focus:ring-blue-400 focus:outline-none"
        />
      </div>

      {/* 📦 Status */}
      <Select
        value={status}
        placeholder="Status"
        options={finalStatusOptions}
        onChange={(val) => onStatusChange(val)}
      />

      {/* 🕒 Sort */}
      <Select
        value={sort}
        placeholder="Sort by" 
        options={[
          { label: "Created (Newest)", value: "newest" },
          { label: "Created (Oldest)", value: "oldest" },
        ]}
        onChange={(val) => onSortChange(val)}
      />


      {/* ⚙️ Buttons */}
      <div className="flex gap-2">
        {/* Search button */}
        <button
          onClick={onSearch}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 transition"
        >
          <Filter className="w-4 h-4" />
          Apply Filters
        </button>

        {/* Reset button */}
        <button
          onClick={onReset}
          className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg text-sm hover:bg-gray-100 transition"
        >
          <RefreshCw className="w-4 h-4 text-gray-600" />
          Reset
        </button>
      </div>
    </div>
  );
}
