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
  Select,
  Row,
  Col,
  Input,
} from "antd";
import { EyeOutlined } from "@ant-design/icons";
import { ReportDetailModal } from "./ReportDetailModal";
import { ResolveReportModal } from "./ResolveReportModal";
import "../NavigationBar/NavigationBar.css";
import dayjs from "dayjs";
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
      width: 150,
      render: (text: string, record: Report) => (
        <div className="text-sm">
          <div className="font-medium">{text}</div>
          <div className="text-gray-600">{record.openedBy.email}</div>
        </div>
      ),
    },
    {
      title: "Type",
      dataIndex: "type",
      key: "type",
      width: 100,
      render: (type: string) => (
        <Tag color={getTypeColor(type)}>{type.toUpperCase()}</Tag>
      ),
    },
    {
      title: "Amount",
      dataIndex: ["order", "grandTotal"],
      key: "amount",
      width: 120,
      render: (amount: string) => (
        <span className="text-sm font-medium">
          ₫{Number.parseFloat(amount).toLocaleString()}
        </span>
      ),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      width: 100,
      render: (status: string) => (
        <Tag color={getStatusColor(status)}>{status.toUpperCase()}</Tag>
      ),
    },
    {
      title: "Created",
      dataIndex: "createdAt",
      key: "createdAt",
      width: 160,
      render: (date: string) => (
        <span className="text-sm">
          {dayjs(date).format("YYYY-MM-DD HH:mm")}
        </span>
      ),
    },
    {
      title: "Actions",
      key: "actions",
      width: 200,
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
            <Button
              type="primary"
              size="small"
              onClick={() => handleResolve(record)}
            >
              Resolve
            </Button>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div className="admin-container">
      <div className="p-6 bg-slate-50 min-h-screen">
        <div className="bg-slate-900 rounded-lg p-6 mb-6">
          <h1 className="text-2xl font-bold text-white mb-4">
            Report Management
          </h1>
          <Row gutter={16}>
            <Col xs={24} sm={12} lg={6}>
              <Input.Search
                placeholder="Search by user, email or order"
                allowClear
                onChange={(e) => setSearchText(e.target.value)}
                className="w-full"
              />
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <Select
                placeholder="Filter by type"
                allowClear
                onChange={(value) => setTypeFilter(value)}
                options={[
                  { label: "Refund", value: "refund" },
                  { label: "Damaged", value: "damaged" },
                  { label: "Not Received", value: "not_received" },
                  { label: "Other", value: "other" },
                ]}
                className="w-full"
              />
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <Select
                placeholder="Filter by status"
                allowClear
                onChange={(value) => setStatusFilter(value)}
                options={[
                  { label: "Pending", value: "pending" },
                  { label: "Resolved", value: "resolved" },
                  { label: "Refunded", value: "refunded" },
                  { label: "Rejected", value: "rejected" },
                ]}
                className="w-full"
              />
            </Col>
          </Row>
        </div>

        <div className="bg-white rounded-lg shadow">
          <Spin spinning={loading}>
            <Table
              columns={columns}
              dataSource={reports}
              rowKey="id"
              pagination={{
                current: pagination.page,
                pageSize: pagination.limit,
                total: pagination.total,
                onChange: (page) =>
                  fetchReports(page, statusFilter, typeFilter),
              }}
              scroll={{ x: 1400 }}
            />
          </Spin>
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
            onSuccess={() =>
              fetchDisputes()
            }
          />
        )}
      </div>
    </div>
  );
};

export default DisputesManagement;
