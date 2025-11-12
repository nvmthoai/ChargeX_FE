
import type React from "react";
import { useState, useEffect } from "react";
import {
  Table,
  Button,
  Tag,
  Space,
  message,
  Spin,
} from "antd";
import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  LoadingOutlined,
} from "@ant-design/icons";
import { ApprovePayoutModal } from "./ApprovePayoutModal";
import { DenyPayoutModal } from "./DenyPayoutModal";
import "../NavigationBar/NavigationBar.css";
import "./index.css";

import type {
  PayoutDescription,
  PayoutRequest,
} from "../../../models/wallet.model";
import useAdminWallet from "../../../hooks/useAdminWallet";

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
  const { requests, handleApproveRequest, fetchRequestWithdraw} = useAdminWallet();
  // TODO: Replace with actual hook call
  const fetchPayouts = async (page = 1, status?: string) => {
    try {
      setLoading(true);
      // Mock data - replace with actual API call
      const filteredData = status
        ? requests.filter((p) => p.status === status)
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

      setPayouts(searchFiltered);
      setPagination({
        page,
        limit: pagination.limit,
        total: searchFiltered.length,
      });
    } catch (error) {
      message.error("Failed to fetch payout requests");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayouts(1, statusFilter);
  }, [statusFilter, searchText, requests]);

  const handleApprove = async (payoutId: string) => {
    setLoadingHandleRequest(true);
    const response = await handleApproveRequest(payoutId);
    if (response) {
      setLoadingHandleRequest(true);
      setTimeout(() => {
        setLoadingHandleRequest(false);
        fetchRequestWithdraw();
      }, 60000); // 60000ms = 60s
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

  const columns = [
    {
      title: "User",
      dataIndex: ["userData", "fullName"],
      key: "user",
      width: "15%",
      render: (text: string, record: PayoutRequest) => (
        <div className="text-sm">
          <div className="font-medium">{text}</div>
          <div className="text-gray-600">{record.userData.email}</div>
        </div>
      ),
    },
    {
      title: "Phone",
      dataIndex: ["userData", "phone"],
      key: "phone",
      width: "15%",
      render: (text: string) => <span className="text-sm">{text}</span>,
    },
    {
      title: "Amount",
      dataIndex: "amount",
      key: "amount",
      width: "10%",
      render: (amount: string) => (
        <span className="text-sm font-medium">
          ${Number.parseFloat(amount).toLocaleString()}
        </span>
      ),
    },
    {
      title: "Bank Info",
      width: "10%",
      dataIndex: "description",
      key: "bankInfo",
      render: (desc: string) => {
        const info = getDescription(desc);
        return (
          <div className="text-sm">
            <div>{info.bankCode}</div>
            <div className="text-gray-600">{info.accountNumber}</div>
          </div>
        );
      },
    },
    {
      title: "Status",
      width: "10%",
      dataIndex: "status",
      key: "status",
      render: (status: string) => {
        const colors: Record<string, string> = {
          pending: "orange",
          approved: "green",
          rejected: "red",
        };
        return (
          <Tag color={colors[status]}>
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </Tag>
        );
      },
    },
    {
      title: "Actions",
      key: "actions",

      render: (_: any, record: PayoutRequest) => (
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
              <Button
                danger
                size="small"
                icon={<CloseCircleOutlined />}
                onClick={() => handleDeny(record.id)}
              >
                Deny
              </Button>
            </>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div className="admin-container">
      {!loadingHandleRequest ? (
        <div className="inner-container management-container withdraw-management-container">
          <header className="main-header">
            <h1>Withdraw Request Management</h1>
          </header>

          <div className="controls">
            <div className="search-bar">
              <i className="fa-solid fa-magnifying-glass" />
              <input
                type="text"
                placeholder="Find by name, email or phone..."
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
              />
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
            <button className="btn btn-secondary" onClick={() => fetchPayouts(1, statusFilter)}>
              Refresh
            </button>
          </div>

          <div style={{ width: '100%', overflow: 'hidden' }}>
            <section className="admin-table-container">
              <Spin spinning={loading}>
                <Table
                  columns={columns}
                  dataSource={payouts}
                  rowKey="id"
                  pagination={{
                    current: pagination.page,
                    pageSize: pagination.limit,
                    total: pagination.total,
                    onChange: (page) => fetchPayouts(page, statusFilter),
                  }}
                />
              </Spin>
            </section>
          </div>

          <ApprovePayoutModal
            visible={approveModalVisible}
            payoutId={selectedPayoutId}
            onClose={() => setApproveModalVisible(false)}
            onSuccess={() => fetchPayouts(pagination.page, statusFilter)}
          />

          <DenyPayoutModal
            visible={denyModalVisible}
            payoutId={selectedPayoutId}
            onClose={() => setDenyModalVisible(false)}
            onSuccess={() => fetchPayouts(pagination.page, statusFilter)}
          />
        </div>
      ) : (
        <div className="h-screen flex justify-center items-center">
          <Spin indicator={<LoadingOutlined spin />} size="large" />
        </div>
      )}
    </div>
  );
};

export default WithdrawManagement;
