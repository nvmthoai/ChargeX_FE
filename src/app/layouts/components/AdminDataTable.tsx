import { useState, useEffect, type ReactNode } from "react";
import { Search, RefreshCw, X, Filter, ChevronDown } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export interface FilterOption {
  key: string;
  label: string;
  options: { value: string; label: string }[];
}

export interface Column<T> {
  key: string;
  title: string;
  width?: string;
  render: (record: T, index: number) => ReactNode;
}

interface AdminDataTableProps<T> {
  title: string;
  data: T[];
  columns: Column<T>[];
  loading?: boolean;
  searchPlaceholder?: string;
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  filters?: FilterOption[];
  filterValues?: Record<string, string>;
  onFilterChange?: (key: string, value: string) => void;
  onRefresh?: () => void;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    onPageChange: (page: number) => void;
  };
  emptyMessage?: string;
  headerActions?: ReactNode;
}

export default function AdminDataTable<T extends { id?: string; [key: string]: any }>({
  title,
  data,
  columns,
  loading = false,
  searchPlaceholder = "Search...",
  searchValue = "",
  onSearchChange,
  filters = [],
  filterValues = {},
  onFilterChange,
  onRefresh,
  pagination,
  emptyMessage = "No data available",
  headerActions,
}: AdminDataTableProps<T>) {
  const [localSearch, setLocalSearch] = useState(searchValue);
  const [showFilters, setShowFilters] = useState(false);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (onSearchChange) {
        onSearchChange(localSearch);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [localSearch, onSearchChange]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLocalSearch(e.target.value);
  };

  const activeFiltersCount = Object.values(filterValues).filter(v => v && v !== "").length;
  const hasActiveFilters = activeFiltersCount > 0;

  const clearFilter = (key: string) => {
    onFilterChange?.(key, "");
  };

  const clearAllFilters = () => {
    filters.forEach(filter => {
      onFilterChange?.(filter.key, "");
    });
  };

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-ocean-600 to-energy-600 bg-clip-text text-transparent">
            {title}
          </h1>
          {pagination && pagination.total > 0 && (
            <p className="text-sm text-dark-400 mt-1">
              {pagination.total} total {pagination.total === 1 ? 'record' : 'records'}
            </p>
          )}
        </div>
        {headerActions && (
          <div className="flex-shrink-0">
            {headerActions}
          </div>
        )}
      </div>

      {/* Search and Quick Actions Bar */}
      <div className="bg-dark-800 rounded-xl border border-ocean-800/30 shadow-sm p-4">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search Bar */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-dark-400" />
            <Input
              type="text"
              placeholder={searchPlaceholder}
              value={localSearch}
              onChange={handleSearchChange}
              className="pl-10 h-11 text-base border-ocean-800 bg-dark-700 text-dark-100 placeholder:text-dark-400 focus:border-ocean-400 focus:ring-ocean-400"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            {filters.length > 0 && (
              <Button
                variant={hasActiveFilters ? "default" : "outline"}
                onClick={() => setShowFilters(!showFilters)}
                className={`gap-2 h-11 ${
                  hasActiveFilters 
                    ? "bg-ocean-500 hover:bg-ocean-600" 
                    : "bg-ocean-500/10 hover:bg-ocean-500/20 border-ocean-400/30 text-ocean-200 hover:text-white"
                }`}
              >
                <Filter className="w-4 h-4" />
                Filters
                {hasActiveFilters && (
                  <span className="ml-1 px-2 py-0.5 text-xs font-semibold bg-ocean-500/30 rounded-full text-white">
                    {activeFiltersCount}
                  </span>
                )}
              </Button>
            )}
            {onRefresh && (
              <Button
                variant="outline"
                onClick={onRefresh}
                className="gap-2 h-11 bg-ocean-500/10 hover:bg-ocean-500/20 border-ocean-400/30 text-ocean-200 hover:text-white"
              >
                <RefreshCw className="w-4 h-4" />
                Refresh
              </Button>
            )}
          </div>
        </div>

        {/* Active Filters Chips */}
        {hasActiveFilters && (
            <div className="mt-4 pt-4 border-t border-ocean-800/30">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm text-dark-400 font-medium">Active filters:</span>
              {filters.map((filter) => {
                const value = filterValues[filter.key];
                if (!value || value === "") return null;
                const option = filter.options.find(opt => opt.value === value);
                return (
                  <div
                    key={filter.key}
                    className="inline-flex items-center gap-2 px-3 py-1.5 bg-ocean-900/30 border border-ocean-700 rounded-lg text-sm"
                  >
                    <span className="font-medium text-ocean-300">{filter.label}:</span>
                    <span className="text-ocean-100">{option?.label || value}</span>
                    <button
                      onClick={() => clearFilter(filter.key)}
                      className="ml-1 hover:bg-ocean-700 rounded-full p-0.5 transition-colors"
                    >
                      <X className="w-3.5 h-3.5 text-ocean-400" />
                    </button>
                  </div>
                );
              })}
              <Button
                variant="ghost"
                size="sm"
                onClick={clearAllFilters}
                className="h-7 text-xs text-dark-400 hover:text-dark-200"
              >
                Clear all
              </Button>
            </div>
          </div>
        )}

        {/* Expandable Filters Panel */}
        {showFilters && filters.length > 0 && (
            <div className="mt-4 pt-4 border-t border-ocean-800/30">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filters.map((filter) => (
                <div key={filter.key} className="space-y-2">
                  <label className="text-sm font-medium text-dark-200 block">
                    {filter.label}
                  </label>
                  <Select
                    value={filterValues[filter.key] || ""}
                    onChange={(e) => onFilterChange?.(filter.key, e.target.value)}
                    className="w-full h-10 border-ocean-800 bg-dark-700 text-dark-100 focus:border-ocean-400 focus:ring-ocean-400"
                  >
                    <option value="">All {filter.label}</option>
                    {filter.options.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </Select>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Table Card */}
      <div className="bg-dark-800 rounded-xl border border-ocean-800/30 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-16 text-center">
            <div className="inline-flex items-center gap-3 text-dark-400">
              <RefreshCw className="w-5 h-5 animate-spin" />
              <span className="text-base">Loading data...</span>
            </div>
          </div>
        ) : data.length === 0 ? (
          <div className="p-16 text-center">
            <div className="inline-flex flex-col items-center gap-3 text-dark-400">
              <div className="w-16 h-16 rounded-full bg-ocean-900/30 flex items-center justify-center">
                <Search className="w-8 h-8 text-ocean-400" />
              </div>
              <p className="text-base font-medium">{emptyMessage}</p>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-gradient-to-r from-ocean-500/20 to-ocean-600/20 border-b border-ocean-400/30">
                  {columns.map((column) => (
                    <TableHead
                      key={column.key}
                      style={{ width: column.width }}
                      className="h-14 font-semibold text-sm text-ocean-100 uppercase tracking-wider"
                    >
                      {column.title}
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.map((record, index) => (
                  <TableRow
                    key={record.id || index}
                    className="border-b border-ocean-800/20 hover:bg-ocean-500/10 transition-colors"
                  >
                    {columns.map((column) => (
                      <TableCell key={column.key} className="py-4 text-sm text-dark-200">
                        {column.render(record, index)}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>

      {/* Pagination */}
      {pagination && pagination.total > 0 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-dark-800 rounded-xl border border-ocean-800/30 shadow-sm p-4">
          <div className="text-sm text-dark-400">
            Showing <span className="font-semibold text-dark-200">{(pagination.page - 1) * pagination.limit + 1}</span> to{" "}
            <span className="font-semibold text-dark-200">{Math.min(pagination.page * pagination.limit, pagination.total)}</span> of{" "}
            <span className="font-semibold text-dark-200">{pagination.total}</span> results
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => pagination.onPageChange(pagination.page - 1)}
              disabled={pagination.page === 1}
              className="gap-1 bg-ocean-500/10 hover:bg-ocean-500/20 border-ocean-400/30 text-ocean-200 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronDown className="w-4 h-4 rotate-90" />
              Previous
            </Button>
            <div className="flex items-center gap-1 px-3 py-1.5 bg-ocean-500/20 border border-ocean-400/30 rounded-lg">
              <span className="text-sm font-medium text-ocean-200">
                Page {pagination.page} of {Math.ceil(pagination.total / pagination.limit)}
              </span>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => pagination.onPageChange(pagination.page + 1)}
              disabled={pagination.page >= Math.ceil(pagination.total / pagination.limit)}
              className="gap-1 bg-ocean-500/10 hover:bg-ocean-500/20 border-ocean-400/30 text-ocean-200 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
              <ChevronDown className="w-4 h-4 -rotate-90" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
