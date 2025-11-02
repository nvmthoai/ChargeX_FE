
import type React from "react"
import { useState, useEffect } from "react"
import { Table, Button, Tag, Space, message, Spin, Select, Row, Col } from "antd"
import { CheckCircleOutlined} from "@ant-design/icons"



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

  const fetchRequests = async (page = 1, status?: string) => {
    try {
      setLoading(true)
      const response = await getRequestCreateAuction()
      if (response) {
        const filteredData = status ? response.filter((req: AuctionRequest) => req.status === status) : response
        setRequests(filteredData)
        setPagination({
          page,
          limit: pagination.limit,
          total: filteredData.length,
        })
      }
    } catch (error) {
      message.error("Failed to fetch auction requests")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchRequests(1, statusFilter)
  }, [statusFilter])

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
      title: "Seller ID",
      dataIndex: "sellerId",
      key: "sellerId",
      width: 150,
      render: (text: string) => <span className="text-sm">{text.slice(0, 8)}...</span>,
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
      render: (_: any, record: AuctionRequest) => (
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
              {/* <Button danger size="small" icon={<CloseCircleOutlined />} onClick={() => handleReject(record.id)}>
                Reject
              </Button> */}
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
    <div className="p-6 bg-white rounded-lg container mx-20">
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-4">Auction Request Management</h1>
        <Row gutter={16}>
          <Col span={6}>
            <Select
              placeholder="Filter by status"
              allowClear
              onChange={(value) => setStatusFilter(value)}
              options={[
                { label: "Pending", value: "pending" },
                { label: "Approved", value: "approved" },
                { label: "Rejected", value: "rejected" },
              ]}
              className="w-full"
            />
          </Col>
        </Row>
      </div>

      <Spin spinning={loading}>
        <Table
          columns={columns}
          dataSource={requests}
          rowKey="id"
          pagination={{
            current: pagination.page,
            pageSize: pagination.limit,
            total: pagination.total,
            onChange: (page) => fetchRequests(page, statusFilter),
          }}
          scroll={{ x: 1200 }}
        />
      </Spin>

      <ApproveAuctionModal
        visible={approveModalVisible}
        auctionRequestId={selectedRequestId}
        onClose={() => setApproveModalVisible(false)}
        onSuccess={() => fetchRequests(pagination.page, statusFilter)}
      />
    </div>
  )
}

export default AuctionRequestManagement
