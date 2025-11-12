"use client";

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
import { EyeOutlined, CheckCircleOutlined, CloseCircleOutlined } from "@ant-design/icons";
import { ReportDetailModal } from "./ReportDetailModal";
import { ResolveReportModal } from "./ResolveReportModal";
import "../NavigationBar/NavigationBar.css";
import "./index.css";
import type { Report } from "../../../models/dispute.model";
import useDisputes from "../../../hooks/useDisputes";

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
      // TODO: Replace with actual hook call
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

      setReports(searchFiltered);
      setPagination({
        page,
        limit: pagination.limit,
        total: searchFiltered.length,
      });
    } catch (error) {
      message.error("Failed to fetch reports");
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
      refund: "blue",
      damaged: "red",
      not_received: "orange",
      other: "gray",
    };
    return colors[type] || "gray";
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      pending: "orange",
      resolved: "green",
      rejected: "red",
      refunded: "blue",
    };
    return colors[status] || "gray";
  };

  const columns = [
    {
      title: "User",
      dataIndex: ["openedBy", "fullName"],
      key: "user",
      width: "18%",
      render: (text: string, record: Report) => (
        <div className="text-sm">
          <div className="font-medium">{text}</div>
          <div className="text-gray-600">{record.openedBy.email}</div>
        </div>
      ),
    },
    {
      title: "Phone",
      dataIndex: ["openedBy", "phone"],
      key: "phone",
      width: "12%",
      render: (phone: string) => <span className="text-sm">{phone}</span>,
    },
    {
      title: "Amount",
      dataIndex: ["order", "grandTotal"],
      key: "amount",
      width: "12%",
      render: (amount: string) => (
        <span className="text-sm font-medium">
          ₫{Number.parseFloat(amount).toLocaleString()}
        </span>
      ),
    },
    {
      title: "Type",
      dataIndex: "type",
      key: "type",
      width: "12%",
      render: (type: string) => (
        <Tag color={getTypeColor(type)}>{type.toUpperCase()}</Tag>
      ),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      width: "12%",
      render: (status: string) => (
        <Tag color={getStatusColor(status)}>{status.toUpperCase()}</Tag>
      ),
    },
    {
      title: "Actions",
      key: "actions",
      render: (_: any, record: Report) => (
        <Space size="small">
          <Button
            type="primary"
            ghost
            size="small"
            icon={<EyeOutlined />}
            onClick={() => handleViewDetail(record)}
          >
            Details
          </Button>
          {record.status === "pending" && (
            <>
              <Button
                type="primary"
                size="small"
                icon={<CheckCircleOutlined />}
                onClick={() => handleResolve(record)}
              >
                Resolve
              </Button>
              <Button
                danger
                size="small"
                icon={<CloseCircleOutlined />}
                onClick={() => handleResolve(record)}
              >
                Reject
              </Button>
            </>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div className="admin-container">
      <div className="inner-container management-container withdraw-management-container">
        <header className="main-header">
          <h1>Report Management</h1>
        </header>

        <div className="controls">
          <div className="search-bar">
            <i className="fa-solid fa-magnifying-glass" />
            <input
              type="text"
              placeholder="Find by name, email, phone or order..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
            />
          </div>

          <form>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
            >
              <option value="">-- Type --</option>
              <option value="refund">Refund</option>
              <option value="damaged">Damaged</option>
              <option value="not_received">Not received</option>
              <option value="other">Other</option>
            </select>
          </form>

          <form>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="">-- Status --</option>
              <option value="pending">Pending</option>
              <option value="resolved">Resolved</option>
              <option value="refunded">Refunded</option>
              <option value="rejected">Rejected</option>
            </select>
          </form>

          <button className="btn btn-secondary" onClick={() => fetchReports(1, statusFilter, typeFilter)}>
            Refresh
          </button>
        </div>

        <div style={{ width: '100%', overflow: 'hidden' }}>
          <div className="admin-table-container">
            <Spin spinning={loading}>
              <Table
                columns={columns}
                dataSource={reports}
                rowKey="id"
                pagination={{
                  current: pagination.page,
                  pageSize: pagination.limit,
                  total: pagination.total,
                  onChange: (page) => fetchReports(page, statusFilter, typeFilter),
                }}
              />
            </Spin>
          </div>
        </div>

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
    </div>
  );
};

export default DisputesManagement;
