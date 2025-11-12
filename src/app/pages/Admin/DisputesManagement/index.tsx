"use client";

import type React from "react";
import { useState, useEffect } from "react";
import { Eye, CheckCircle, XCircle } from "lucide-react";
import { ReportDetailModal } from "./ReportDetailModal";
import { ResolveReportModal } from "./ResolveReportModal";
import "./index.css";
import type { Report } from "../../../models/dispute.model";
import useDisputes from "../../../hooks/useDisputes";
import AdminDataTable, { type Column, type FilterOption } from "../../../layouts/components/AdminDataTable";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export const DisputesManagement: React.FC = () => {
  const { fetchDisputes, disputes } = useDisputes();
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
  });
  const [statusFilter, setStatusFilter] = useState<string | undefined>();
  const [typeFilter, setTypeFilter] = useState<string | undefined>();
  const [searchText, setSearchText] = useState("");
  const [detailVisible, setDetailVisible] = useState(false);
  const [resolveVisible, setResolveVisible] = useState(false);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);

  useEffect(() => {
    fetchDisputes();
  }, []);

  useEffect(() => {
    fetchReports();
  }, [disputes]);

  const fetchReports = async (page = 1, status?: string, type?: string) => {
    try {
      setLoading(true);
      let filteredData = disputes;
      if (status) {
        filteredData = filteredData.filter((r) => r.status === status);
      }
      if (type) {
        filteredData = filteredData.filter((r) => r.type === type);
      }

      const searchFiltered = searchText
        ? filteredData.filter(
            (r) =>
              r.openedBy.fullName
                .toLowerCase()
                .includes(searchText.toLowerCase()) ||
              r.openedBy.email
                .toLowerCase()
                .includes(searchText.toLowerCase()) ||
              r.order.orderId.includes(searchText)
          )
        : filteredData;

      // Pagination
      const start = (page - 1) * pagination.limit;
      const end = start + pagination.limit;
      const paginatedData = searchFiltered.slice(start, end);

      setReports(paginatedData);
      setPagination({
        page,
        limit: pagination.limit,
        total: searchFiltered.length,
      });
    } catch (error) {
      console.error("Failed to fetch reports", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports(1, statusFilter, typeFilter);
  }, [statusFilter, typeFilter, searchText]);

  const handleViewDetail = (report: Report) => {
    setSelectedReport(report);
    setDetailVisible(true);
  };

  const handleResolve = (report: Report) => {
    setSelectedReport(report);
    setResolveVisible(true);
  };

  const getTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      refund: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
      damaged: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
      not_received: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400",
      other: "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400",
    };
    return colors[type] || "bg-gray-100 text-gray-800";
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      pending: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400",
      resolved: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
      rejected: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
      refunded: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
    };
    return colors[status] || "bg-gray-100 text-gray-800";
  };

  const filters: FilterOption[] = [
    {
      key: "type",
      label: "Type",
      options: [
        { value: "refund", label: "Refund" },
        { value: "damaged", label: "Damaged" },
        { value: "not_received", label: "Not Received" },
        { value: "other", label: "Other" },
      ],
    },
    {
      key: "status",
      label: "Status",
      options: [
        { value: "pending", label: "Pending" },
        { value: "resolved", label: "Resolved" },
        { value: "refunded", label: "Refunded" },
        { value: "rejected", label: "Rejected" },
      ],
    },
  ];

  const filterValues = {
    type: typeFilter || "",
    status: statusFilter || "",
  };

  const handleFilterChange = (key: string, value: string) => {
    if (key === "type") {
      setTypeFilter(value || undefined);
    } else if (key === "status") {
      setStatusFilter(value || undefined);
    }
    setPagination((p) => ({ ...p, page: 1 }));
  };

  const columns: Column<Report>[] = [
    {
      key: "user",
      title: "User",
      render: (record) => (
        <div>
          <div className="font-medium text-dark-800 dark:text-dark-200">{record.openedBy.fullName}</div>
          <div className="text-sm text-muted-foreground">{record.openedBy.email}</div>
        </div>
      ),
    },
    {
      key: "phone",
      title: "Phone",
      render: (record) => <span className="text-sm">{record.openedBy.phone}</span>,
    },
    {
      key: "amount",
      title: "Amount",
      render: (record) => (
        <span className="text-sm font-medium">
          ₫{Number.parseFloat(record.order.grandTotal).toLocaleString()}
        </span>
      ),
    },
    {
      key: "type",
      title: "Type",
      render: (record) => (
        <span className={cn("px-2 py-1 rounded-md text-xs font-medium", getTypeColor(record.type))}>
          {record.type.toUpperCase()}
        </span>
      ),
    },
    {
      key: "status",
      title: "Status",
      render: (record) => (
        <span className={cn("px-2 py-1 rounded-md text-xs font-medium", getStatusColor(record.status))}>
          {record.status.toUpperCase()}
        </span>
      ),
    },
    {
      key: "actions",
      title: "Actions",
      render: (record) => (
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleViewDetail(record)}
            className="gap-1"
          >
            <Eye className="w-4 h-4" />
            Details
          </Button>
          {record.status === "pending" && (
            <>
              <Button
                size="sm"
                onClick={() => handleResolve(record)}
                className="gap-1"
              >
                <CheckCircle className="w-4 h-4" />
                Resolve
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => handleResolve(record)}
                className="gap-1"
              >
                <XCircle className="w-4 h-4" />
                Reject
              </Button>
            </>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="p-6">
      <AdminDataTable
        title="Report Management"
        data={reports}
        columns={columns}
        loading={loading}
        searchPlaceholder="Find by name, email, phone or order..."
        searchValue={searchText}
        onSearchChange={setSearchText}
        filters={filters}
        filterValues={filterValues}
        onFilterChange={handleFilterChange}
        onRefresh={() => fetchReports(pagination.page, statusFilter, typeFilter)}
        pagination={{
          page: pagination.page,
          limit: pagination.limit,
          total: pagination.total,
          onPageChange: (page) => fetchReports(page, statusFilter, typeFilter),
        }}
      />

      <ReportDetailModal
        visible={detailVisible}
        report={selectedReport}
        onClose={() => setDetailVisible(false)}
        onResolve={() => {
          setDetailVisible(false);
          setResolveVisible(true);
        }}
      />

      {selectedReport && (
        <ResolveReportModal
          visible={resolveVisible}
          reportId={selectedReport.id}
          orderId={selectedReport.order.orderId}
          grandTotal={selectedReport.order.grandTotal}
          onClose={() => setResolveVisible(false)}
          onSuccess={() => fetchDisputes()}
        />
      )}
    </div>
  );
};

export default DisputesManagement;
