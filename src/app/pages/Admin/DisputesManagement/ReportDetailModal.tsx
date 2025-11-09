"use client";

import type React from "react";
import { Modal, Descriptions, Tag, Avatar, Button, Divider, Image } from "antd";
import dayjs from "dayjs";
import type { Report } from "../../../models/dispute.model";


interface ReportDetailModalProps {
  visible: boolean;
  report: Report | null;
  onClose: () => void;
  onResolve: (reportId: string) => void;
}

export const ReportDetailModal: React.FC<ReportDetailModalProps> = ({
  visible,
  report,
  onClose,
  onResolve,
}) => {
  if (!report) return null;

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

  return (
    <Modal
      title="Report Details"
      open={visible}
      onCancel={onClose}
      width={900}
      footer={[
        <Button key="close" onClick={onClose}>
          Close
        </Button>,
        report.status === "pending" && (
          <Button
            key="resolve"
            type="primary"
            onClick={() => onResolve(report.id)}
          >
            Resolve Report
          </Button>
        ),
      ]}
    >
      <div className="space-y-6">
        {/* Report Info */}
        <div>
          <h3 className="text-lg font-semibold mb-3">Report Information</h3>
          <Descriptions bordered size="small" column={2}>
            <Descriptions.Item label="Report ID">
              {report.id.slice(0, 8)}...
            </Descriptions.Item>
            <Descriptions.Item label="Type">
              <Tag color={getTypeColor(report.type)}>
                {report.type.toUpperCase()}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Status">
              <Tag color={getStatusColor(report.status)}>
                {report.status.toUpperCase()}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Created">
              {dayjs(report.createdAt).format("YYYY-MM-DD HH:mm")}
            </Descriptions.Item>
          </Descriptions>
        </div>

        <Divider />

        {/* User Info */}
        <div>
          <h3 className="text-lg font-semibold mb-3">User Information</h3>
          <div className="flex items-center gap-3 mb-3">
            <Avatar src={report.openedBy.image} size={48} />
            <div>
              <div className="font-medium">{report.openedBy.fullName}</div>
              <div className="text-sm text-gray-600">
                {report.openedBy.email}
              </div>
              <div className="text-sm text-gray-600">
                {report.openedBy.phone}
              </div>
            </div>
          </div>
        </div>

        <Divider />

        {/* Order Info */}
        <div>
          <h3 className="text-lg font-semibold mb-3">Order Information</h3>
          <Descriptions bordered size="small" column={2}>
            <Descriptions.Item label="Order Status">
              {report.order.status.toUpperCase()}
            </Descriptions.Item>
            <Descriptions.Item label="Receiver Name">
              {report.order.receiverName}
            </Descriptions.Item>
            <Descriptions.Item label="Receiver Phone">
              {report.order.receiverPhone}
            </Descriptions.Item>
            <Descriptions.Item label="Total Price">
              ₫{Number.parseFloat(report.order.totalPrice).toLocaleString()}
            </Descriptions.Item>
            <Descriptions.Item label="Shipping Fee">
              ₫
              {Number.parseFloat(
                report.order.totalShippingFee
              ).toLocaleString()}
            </Descriptions.Item>
            <Descriptions.Item label="Grand Total" span={2}>
              <span className="font-semibold">
                ₫{Number.parseFloat(report.order.grandTotal).toLocaleString()}
              </span>
            </Descriptions.Item>
          </Descriptions>
        </div>

        <Divider />

        {/* Messages */}
        <div>
          <h3 className="text-lg font-semibold mb-3">Messages</h3>
          <div className="space-y-4">
            {report.messages.map((msg) => (
              <div key={msg.id} className="border rounded-lg p-4 bg-slate-50">
                {msg.sender && (
                  <div className="flex items-center gap-2 mb-2">
                    <Avatar src={msg.sender.image} size={24} />
                    <span className="font-medium text-sm">
                      {msg.sender.fullName}
                    </span>
                    <span className="text-gray-500 text-xs">
                      {dayjs(msg.createdAt).format("HH:mm DD/MM")}
                    </span>
                  </div>
                )}
                <p className="text-sm mb-2">{msg.body}</p>
                {msg.attachments && (
                  <Image
                    src={msg.attachments || "/placeholder.svg"}
                    alt="Attachment"
                    width={200}
                    className="rounded"
                    preview={{ mask: "View" }}
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </Modal>
  );
};
