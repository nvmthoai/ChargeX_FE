import type React from "react";
import { useState, useEffect } from "react";
import { CheckCircle, XCircle, Loader2 } from "lucide-react";
import { ApprovePayoutModal } from "./ApprovePayoutModal";
import { DenyPayoutModal } from "./DenyPayoutModal";
import type {
  PayoutDescription,
  PayoutRequest,
} from "../../../models/wallet.model";
import useAdminWallet from "../../../hooks/useAdminWallet";
import AdminDataTable, { type Column, type FilterOption } from "../../../layouts/components/AdminDataTable";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const WithdrawManagement: React.FC = () => {
  const [payouts, setPayouts] = useState<PayoutRequest[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingHandleRequest, setLoadingHandleRequest] = useState(false);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
  });
  const [statusFilter, setStatusFilter] = useState<string | undefined>();
  const [searchText, setSearchText] = useState("");
  const [approveModalVisible, setApproveModalVisible] = useState(false);
  const [denyModalVisible, setDenyModalVisible] = useState(false);
  const [selectedPayoutId, setSelectedPayoutId] = useState<string>("");
  const { requests, handleApproveRequest, fetchRequestWithdraw } = useAdminWallet();

  // Fetch and filter payouts
  useEffect(() => {
    if (requests.length === 0) {
      setPayouts([]);
      setPagination((p) => ({ ...p, total: 0 }));
      return;
    }

    const fetchData = () => {
      try {
        setLoading(true);
        let filteredData = statusFilter
          ? requests.filter((p) => p.status === statusFilter)
          : requests;
        
        const searchFiltered = searchText
          ? filteredData.filter(
              (p) =>
                p.userData.fullName
                  .toLowerCase()
                  .includes(searchText.toLowerCase()) ||
                p.userData.email
                  .toLowerCase()
                  .includes(searchText.toLowerCase()) ||
                p.userData.phone.includes(searchText)
            )
          : filteredData;

        const total = searchFiltered.length;
        const start = (pagination.page - 1) * pagination.limit;
        const end = start + pagination.limit;
        const pageSlice = searchFiltered.slice(start, end);

        setPayouts(pageSlice);
        setPagination((p) => ({
          ...p,
          total,
        }));
      } catch (error) {
        console.error("Failed to fetch payout requests", error);
      } finally {
        setLoading(false);
      }
    };

    const timer = setTimeout(() => {
      fetchData();
    }, 300);
    
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [requests.length, statusFilter, searchText, pagination.page, pagination.limit]);

  const handleApprove = async (payoutId: string) => {
    setLoadingHandleRequest(true);
    const response = await handleApproveRequest(payoutId);
    if (response) {
      setLoadingHandleRequest(true);
      setTimeout(() => {
        setLoadingHandleRequest(false);
        fetchRequestWithdraw();
      }, 60000);
    } else {
      setLoadingHandleRequest(false);
    }
  };

  const handleDeny = (payoutId: string) => {
    setSelectedPayoutId(payoutId);
    setDenyModalVisible(true);
  };

  const getDescription = (descStr: string): PayoutDescription => {
    try {
      return JSON.parse(descStr);
    } catch {
      return { accountNumber: "", bankCode: "", note: "" };
    }
  };

  const filters: FilterOption[] = [
    {
      key: "status",
      label: "Status",
      options: [
        { value: "pending", label: "Pending" },
        { value: "approved", label: "Approved" },
        { value: "rejected", label: "Rejected" },
      ],
    },
  ];

  const filterValues = {
    status: statusFilter || "",
  };

  const handleFilterChange = (key: string, value: string) => {
    if (key === "status") {
      setStatusFilter(value || undefined);
    }
    setPagination((p) => ({ ...p, page: 1 }));
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      pending: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400",
      approved: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
      rejected: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
    };
    return colors[status] || "bg-gray-100 text-gray-800";
  };

  const columns: Column<PayoutRequest>[] = [
    {
      key: "user",
      title: "User",
      render: (record) => (
        <div>
          <div className="font-medium text-dark-800 dark:text-dark-200">
            {record.userData.fullName}
          </div>
          <div className="text-sm text-muted-foreground">
            {record.userData.email}
          </div>
        </div>
      ),
    },
    {
      key: "phone",
      title: "Phone",
      render: (record) => (
        <span className="text-sm">{record.userData.phone}</span>
      ),
    },
    {
      key: "amount",
      title: "Amount",
      render: (record) => (
        <span className="text-sm font-semibold text-energy-600 dark:text-energy-400">
          ${Number.parseFloat(record.amount).toLocaleString()}
        </span>
      ),
    },
    {
      key: "bankInfo",
      title: "Bank Info",
      render: (record) => {
        const info = getDescription(record.description);
        return (
          <div className="text-sm">
            <div className="font-medium text-dark-800 dark:text-dark-200">
              {info.bankCode || 'N/A'}
            </div>
            <div className="text-muted-foreground font-mono">
              {info.accountNumber || 'N/A'}
            </div>
          </div>
        );
      },
    },
    {
      key: "status",
      title: "Status",
      render: (record) => (
        <span className={cn("px-2 py-1 rounded-md text-xs font-medium", getStatusColor(record.status))}>
          {record.status.charAt(0).toUpperCase() + record.status.slice(1)}
        </span>
      ),
    },
    {
      key: "actions",
      title: "Actions",
      render: (record) => (
        <div className="flex items-center gap-2">
          {record.status === "pending" && (
            <>
              <Button
                size="sm"
                onClick={() => handleApprove(record.id)}
                className="gap-1"
              >
                <CheckCircle className="w-4 h-4" />
                Approve
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => handleDeny(record.id)}
                className="gap-1"
              >
                <XCircle className="w-4 h-4" />
                Deny
              </Button>
            </>
          )}
        </div>
      ),
    },
  ];

  if (loadingHandleRequest) {
    return (
      <div className="h-screen flex justify-center items-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-ocean-600" />
          <p className="text-sm text-muted-foreground">Processing request...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <AdminDataTable
        title="Withdraw Request Management"
        data={payouts}
        columns={columns}
        loading={loading}
        searchPlaceholder="Find by name, email or phone..."
        searchValue={searchText}
        onSearchChange={setSearchText}
        filters={filters}
        filterValues={filterValues}
        onFilterChange={handleFilterChange}
        onRefresh={() => {
          // Trigger re-fetch by updating a dependency
          setPagination((p) => ({ ...p }));
        }}
        pagination={{
          page: pagination.page,
          limit: pagination.limit,
          total: pagination.total,
          onPageChange: (page) => {
            setPagination((p) => ({ ...p, page }));
          },
        }}
      />

      <ApprovePayoutModal
        visible={approveModalVisible}
        payoutId={selectedPayoutId}
        onClose={() => setApproveModalVisible(false)}
        onSuccess={() => {
          fetchRequestWithdraw();
        }}
      />

      <DenyPayoutModal
        visible={denyModalVisible}
        payoutId={selectedPayoutId}
        onClose={() => setDenyModalVisible(false)}
        onSuccess={() => {
          fetchRequestWithdraw();
        }}
      />
    </div>
  );
};

export default WithdrawManagement;
