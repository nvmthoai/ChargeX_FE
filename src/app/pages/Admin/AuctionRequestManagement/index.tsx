import type React from "react";
import { useState, useEffect } from "react";
import { CheckCircle } from "lucide-react";
import dayjs from "dayjs";
import useAuction from "../../../hooks/useAuction";
import type { AuctionRequest } from "../../../models/auction.model";
import { ApproveAuctionModal } from "./ApproveAuctionModal";
import AdminDataTable, { type Column, type FilterOption } from "../../../layouts/components/AdminDataTable";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export const AuctionRequestManagement: React.FC = () => {
  const [requests, setRequests] = useState<AuctionRequest[]>([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0 });
  const [statusFilter, setStatusFilter] = useState<string | undefined>();
  const [searchText, setSearchText] = useState("");
  const [approveModalVisible, setApproveModalVisible] = useState(false);
  const [selectedRequestId, setSelectedRequestId] = useState<string>("");

  const { getRequestCreateAuction } = useAuction();

  // Fetch requests with current filters
  useEffect(() => {
    let isMounted = true;
    
    const fetchData = async (page = 1, status?: string, search?: string) => {
      try {
        setLoading(true);
        const response = await getRequestCreateAuction();
        if (!isMounted) return;
        
        if (response) {
          const filteredData: AuctionRequest[] = status 
            ? response.filter((req: AuctionRequest) => req.status === status) 
            : response;
          
          let withNames = filteredData.map((r) => ({ 
            ...r, 
            sellerName: (r as any).sellerName ?? r.sellerId 
          }));

          if (search && search.trim() !== '') {
            const s = search.toLowerCase();
            withNames = withNames.filter((r) =>
              (r.sellerName && r.sellerName.toLowerCase().includes(s)) ||
              (r.productId && String(r.productId).toLowerCase().includes(s)) ||
              (r.note && r.note.toLowerCase().includes(s))
            );
          }

          const total = withNames.length;
          const start = (page - 1) * pagination.limit;
          const end = start + pagination.limit;
          const pageSlice = withNames.slice(start, end);

          if (isMounted) {
            setRequests(pageSlice);
            setPagination((p) => ({ ...p, page, total }));
          }
        }
      } catch (_err) {
        console.error(_err);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    const timer = setTimeout(() => {
      fetchData(pagination.page, statusFilter, searchText);
    }, 300);
    
    return () => {
      isMounted = false;
      clearTimeout(timer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter, searchText, pagination.page, pagination.limit]);

  const handleApprove = (requestId: string) => {
    setSelectedRequestId(requestId);
    setApproveModalVisible(true);
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

  const columns: Column<AuctionRequest>[] = [
    {
      key: "id",
      title: "Request ID",
      width: "13%",
      render: (record) => (
        <span className="text-sm font-mono text-muted-foreground">
          {record.id.slice(0, 8)}...
        </span>
      ),
    },
    {
      key: "productId",
      title: "Product ID",
      width: "13%",
      render: (record) => (
        <span className="text-sm font-mono text-muted-foreground">
          {record.productId.slice(0, 8)}...
        </span>
      ),
    },
    {
      key: "seller",
      title: "Seller",
      width: "17%",
      render: (record) => {
        const sellerName = (record as any).sellerName;
        return (
          <div>
            <div className="font-medium text-dark-800 dark:text-dark-200">
              {sellerName || (record.sellerId ? record.sellerId.slice(0, 8) + '...' : 'N/A')}
            </div>
            <div className="text-xs text-muted-foreground font-mono">
              {record.sellerId}
            </div>
          </div>
        );
      },
    },
    {
      key: "note",
      title: "Note",
      width: "20%",
      render: (record) => (
        <span className="text-sm truncate max-w-xs block" title={record.note}>
          {record.note}
        </span>
      ),
    },
    {
      key: "status",
      title: "Status",
      width: "12%",
      render: (record) => (
        <span className={cn("px-2 py-1 rounded-md text-xs font-medium", getStatusColor(record.status))}>
          {record.status.toUpperCase()}
        </span>
      ),
    },
    {
      key: "requestedAt",
      title: "Requested At",
      width: "15%",
      render: (record) => (
        <span className="text-sm text-muted-foreground">
          {dayjs(record.requestedAt).format("YYYY-MM-DD HH:mm")}
        </span>
      ),
    },
    {
      key: "actions",
      title: "Actions",
      width: "10%",
      render: (record) => (
        <div className="flex items-center gap-2">
          {record.status === "pending" ? (
            <Button
              size="sm"
              onClick={() => handleApprove(record.id)}
              className="gap-1"
            >
              <CheckCircle className="w-4 h-4" />
              Approve
            </Button>
          ) : (
            <span className="text-sm text-muted-foreground">
              {record.status === "approved" ? "Approved" : "Rejected"}
            </span>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="p-6">
      <AdminDataTable
        title="Auction Request Management"
        data={requests}
        columns={columns}
        loading={loading}
        searchPlaceholder="Find by product, seller or note..."
        searchValue={searchText}
        onSearchChange={setSearchText}
        filters={filters}
        filterValues={filterValues}
        onFilterChange={handleFilterChange}
        onRefresh={() => {
          // Trigger re-fetch by updating pagination
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

      <ApproveAuctionModal
        visible={approveModalVisible}
        auctionRequestId={selectedRequestId}
        onClose={() => setApproveModalVisible(false)}
        onSuccess={() => {
          // Trigger re-fetch
          setPagination((p) => ({ ...p }));
        }}
      />
    </div>
  );
};

export default AuctionRequestManagement;
