import { useState, useEffect } from "react";
import { Radio } from "lucide-react";
import useAuction from "../../../hooks/useAuction";
import AdminDataTable, { type Column, type FilterOption } from "../../../layouts/components/AdminDataTable";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function AuctionLiveManagement() {
  const { getAuctions, createLive, loading } = useAuction();
  const [allAuctions, setAllAuctions] = useState<Record<string, any>[]>([]);
  const [auctions, setAuctions] = useState<Record<string, any>[]>([]);
  const [searchText, setSearchText] = useState("");
  const [statusFilter, setStatusFilter] = useState<string | undefined>();
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0 });

  // Fetch auctions with current filters
  useEffect(() => {
    let isMounted = true;
    
    const fetchData = async () => {
      const data = await getAuctions();
      if (!isMounted) return;
      
      if (!data || !Array.isArray(data)) {
        setAllAuctions([]);
        setPagination((p) => ({ ...p, total: 0 }));
        return;
      }

      let filtered = data as Array<Record<string, any>>;
      
      if (searchText) {
        filtered = filtered.filter((a) => 
          String(a.title || '').toLowerCase().includes(searchText.toLowerCase())
        );
      }

      if (statusFilter) {
        filtered = filtered.filter((a) => a.status === statusFilter);
      }

      const withNames = filtered.map((a) => ({ 
        ...a, 
        sellerName: a.sellerName ?? a.sellerId ?? '' 
      }));

      if (isMounted) {
        setAllAuctions(withNames);
        setPagination((p) => ({ ...p, total: withNames.length }));
      }
    };

    const timer = setTimeout(() => {
      fetchData();
    }, 300);
    
    return () => {
      isMounted = false;
      clearTimeout(timer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchText, statusFilter]);

  // Pagination effect
  useEffect(() => {
    const start = (pagination.page - 1) * pagination.limit;
    const end = start + pagination.limit;
    setAuctions(allAuctions.slice(start, end));
  }, [allAuctions, pagination.page, pagination.limit]);

  const handleGoLive = async (auctionId: string) => {
    const result = await createLive(auctionId);
    if (result) {
      // Refresh data
      const data = await getAuctions();
      if (data && Array.isArray(data)) {
        let filtered = data as Array<Record<string, any>>;
        if (searchText) {
          filtered = filtered.filter((a) => 
            String(a.title || '').toLowerCase().includes(searchText.toLowerCase())
          );
        }
        if (statusFilter) {
          filtered = filtered.filter((a) => a.status === statusFilter);
        }
        const withNames = filtered.map((a) => ({ 
          ...a, 
          sellerName: a.sellerName ?? a.sellerId ?? '' 
        }));
        setAllAuctions(withNames);
        setPagination((p) => ({ ...p, total: withNames.length }));
      }
    }
  };

  const filters: FilterOption[] = [
    {
      key: "status",
      label: "Status",
      options: [
        { value: "scheduled", label: "Scheduled" },
        { value: "live", label: "Live" },
        { value: "ended", label: "Ended" },
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
      scheduled: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
      live: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400",
      ended: "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400",
    };
    return colors[status] || "bg-gray-100 text-gray-800";
  };

  const columns: Column<Record<string, any>>[] = [
    {
      key: "title",
      title: "Title",
      render: (record) => (
        <span className="font-medium text-dark-800 dark:text-dark-200">
          {record.title}
        </span>
      ),
    },
    {
      key: "sellerName",
      title: "Seller",
      render: (record) => (
        <span className="text-sm">
          {record.sellerName || (record.sellerId ? String(record.sellerId).slice(0, 8) + '...' : 'N/A')}
        </span>
      ),
    },
    {
      key: "status",
      title: "Status",
      render: (record) => (
        <span className={cn("px-2 py-1 rounded-md text-xs font-medium", getStatusColor(record.status))}>
          {record.status?.toUpperCase() || 'N/A'}
        </span>
      ),
    },
    {
      key: "startTime",
      title: "Start Time",
      render: (record) => (
        <span className="text-sm text-muted-foreground">
          {record.startTime ? new Date(record.startTime).toLocaleString() : 'N/A'}
        </span>
      ),
    },
    {
      key: "endTime",
      title: "End Time",
      render: (record) => (
        <span className="text-sm text-muted-foreground">
          {record.endTime ? new Date(record.endTime).toLocaleString() : 'N/A'}
        </span>
      ),
    },
    {
      key: "currentPrice",
      title: "Current Price",
      render: (record) => (
        <span className="text-sm font-semibold text-energy-600 dark:text-energy-400">
          ${Number(record.currentPrice || 0).toLocaleString()}
        </span>
      ),
    },
    {
      key: "action",
      title: "Action",
      render: (record) => (
        <Button
          onClick={() => handleGoLive(String(record.auctionId))}
          className="bg-energy-500 hover:bg-energy-600 text-white border-0"
        >
          <Radio className="w-4 h-4 mr-2" />
          Go Live
        </Button>
      ),
    },
  ];

  return (
    <div className="p-6">
      <AdminDataTable
        title="Live Auction Management"
        data={auctions}
        columns={columns}
        loading={loading}
        searchPlaceholder="Search auctions..."
        searchValue={searchText}
        onSearchChange={setSearchText}
        filters={filters}
        filterValues={filterValues}
        onFilterChange={handleFilterChange}
        onRefresh={() => {
          const fetchData = async () => {
            const data = await getAuctions();
            if (data && Array.isArray(data)) {
              let filtered = data as Array<Record<string, any>>;
              if (searchText) {
                filtered = filtered.filter((a) => 
                  String(a.title || '').toLowerCase().includes(searchText.toLowerCase())
                );
              }
              if (statusFilter) {
                filtered = filtered.filter((a) => a.status === statusFilter);
              }
              const withNames = filtered.map((a) => ({ 
                ...a, 
                sellerName: a.sellerName ?? a.sellerId ?? '' 
              }));
              setAllAuctions(withNames);
              setPagination((p) => ({ ...p, total: withNames.length }));
            }
          };
          fetchData();
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
    </div>
  );
}
