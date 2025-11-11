import type React from "react"
import { useState, useEffect, useCallback, useRef } from "react"
import { Table, Button, Tag, Space, message, Spin } from "antd"
import { CheckCircleOutlined} from "@ant-design/icons"
import "./index.css"
import Pagination from "../../../components/Pagination/Pagination"

import dayjs from "dayjs"
import useAuction from "../../../hooks/useAuction"
import type { AuctionRequest } from "../../../models/auction.model"
import { ApproveAuctionModal } from "./ApproveAuctionModal"

export const AuctionRequestManagement: React.FC = () => {
  const [requests, setRequests] = useState<AuctionRequest[]>([])
  const [loading, setLoading] = useState(false)
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0 })
  const [statusFilter, setStatusFilter] = useState<string | undefined>()
  const [approveModalVisible, setApproveModalVisible] = useState(false)
  const [selectedRequestId, setSelectedRequestId] = useState<string>("")

  const { getRequestCreateAuction } = useAuction()

  const fetchRequests = useCallback(async (page = 1, status?: string, search?: string) => {
    try {
      setLoading(true)
      const response = await getRequestCreateAuction()
      if (response) {
        // Backend should include sellerName; fallback to sellerId if absent
        const filteredData: AuctionRequest[] = status ? response.filter((req: AuctionRequest) => req.status === status) : response
        let withNames = filteredData.map((r) => ({ ...r, sellerName: (r as any).sellerName ?? r.sellerId }))

        // Apply search filter if provided
        if (search && search.trim() !== '') {
          const s = search.toLowerCase()
          withNames = withNames.filter((r) =>
            (r.sellerName && r.sellerName.toLowerCase().includes(s)) ||
            (r.productId && String(r.productId).toLowerCase().includes(s)) ||
            (r.note && r.note.toLowerCase().includes(s))
          )
        }

        // client-side pagination
        const total = withNames.length
        const start = (page - 1) * pagination.limit
        const end = start + pagination.limit
        const pageSlice = withNames.slice(start, end)

        setRequests(pageSlice)
        setPagination({ page, limit: pagination.limit, total })
      }
    } catch (_err) {
      console.error(_err)
      message.error("Failed to fetch auction requests")
    } finally {
      setLoading(false)
    }
  }, [getRequestCreateAuction, pagination.limit])

  // search with simple debounce
  const [searchText, setSearchText] = useState('')
  // keep a stable ref to fetchRequests so debounce effect doesn't re-run when function identity changes
  const fetchRequestsRef = useRef(fetchRequests)
  useEffect(() => { fetchRequestsRef.current = fetchRequests }, [fetchRequests])

  // initial load on mount
  useEffect(() => {
    fetchRequestsRef.current(1, statusFilter, searchText)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // debounce when search or status changes
  useEffect(() => {
    const t = setTimeout(() => {
      // call the latest fetchRequests via ref
      fetchRequestsRef.current(1, statusFilter, searchText)
    }, 300)
    return () => clearTimeout(t)
  }, [statusFilter, searchText])

  const handleApprove = (requestId: string) => {
    setSelectedRequestId(requestId)
    setApproveModalVisible(true)
  }

  // const handleReject = async (requestId: string) => {
  //   try {
  //     await rejectRequest(requestId)
  //     message.success("Auction request rejected")
  //     fetchRequests(pagination.page, statusFilter)
  //   } catch (error) {
  //     message.error("Failed to reject auction request")
  //   }
  // }

  const columns = [
    {
      title: "Request ID",
      dataIndex: "id",
      key: "id",
      width: 150,
      render: (text: string) => <span className="text-sm">{text.slice(0, 8)}...</span>,
    },
    {
      title: "Product ID",
      dataIndex: "productId",
      key: "productId",
      width: 150,
      render: (text: string) => <span className="text-sm">{text.slice(0, 8)}...</span>,
    },
    {
      title: "Seller",
      dataIndex: "sellerName",
      key: "seller",
      width: 180,
      render: (text: string, record: AuctionRequest) => (
        <div className="text-sm">
          <div className="font-medium">{text || (record.sellerId ? record.sellerId.slice(0, 8) + '...' : '')}</div>
          <div className="text-gray-500">{record.sellerId}</div>
        </div>
      ),
    },
    {
      title: "Note",
      dataIndex: "note",
      key: "note",
      width: 200,
      render: (text: string) => <span className="text-sm truncate max-w-xs">{text}</span>,
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      width: 100,
      render: (status: string) => {
        const colors: Record<string, string> = {
          pending: "orange",
          approved: "green",
          rejected: "red",
        }
        return <Tag color={colors[status]}>{status.toUpperCase()}</Tag>
      },
    },
    {
      title: "Requested At",
      dataIndex: "requestedAt",
      key: "requestedAt",
      width: 180,
      render: (date: string) => <span className="text-sm">{dayjs(date).format("YYYY-MM-DD HH:mm")}</span>,
    },
    {
      title: "Actions",
      key: "actions",
      width: 200,
      render: (_: React.ReactNode, record: AuctionRequest) => (
        <Space size="small">
          {record.status === "pending" && (
            <>
              <Button
                type="primary"
                size="small"
                icon={<CheckCircleOutlined />}
                onClick={() => handleApprove(record.id)}
              >
                Approve
              </Button>
            </>
          )}
          {record.status !== "pending" && (
            <span className="text-gray-500 text-sm">{record.status === "approved" ? "Approved" : "Rejected"}</span>
          )}
        </Space>
      ),
    },
  ]

  return (
    <div className="admin-container">
      <div className="inner-container management-container auction-request-management-container">
        <header className="main-header">
          <h1>Auction Request Management</h1>
        </header>

        <div className="controls">
          <div className="search-bar">
            <i className="fa-solid fa-magnifying-glass" />
            <input value={searchText} onChange={(e) => setSearchText(e.target.value)} type="text" placeholder="Find by product, seller or note..." />
          </div>
          <form>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="">-- Status --</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
          </form>
          <button className="btn btn-secondary" onClick={() => fetchRequests(pagination.page, statusFilter, searchText)}>
            Refresh
          </button>
        </div>

        <section className="admin-table-container">
          <Spin spinning={loading}>
            <Table
              columns={columns}
              dataSource={requests}
              rowKey="id"
              pagination={false}
              scroll={{ x: 1200 }}
            />
          </Spin>
        </section>

        <Pagination
          currentPage={pagination.page}
          totalPages={Math.ceil(pagination.total / pagination.limit)}
          onPageChange={(page: number) => fetchRequests(page, statusFilter, searchText)}
        />
      </div>

      <ApproveAuctionModal
        visible={approveModalVisible}
        auctionRequestId={selectedRequestId}
        onClose={() => setApproveModalVisible(false)}
        onSuccess={() => fetchRequests(pagination.page, statusFilter, searchText)}
      />
    </div>
  )
}

export default AuctionRequestManagement
