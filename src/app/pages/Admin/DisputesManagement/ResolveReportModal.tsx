"use client";

import type React from "react";
import { useState } from "react";
import { Modal, Form, Input, InputNumber, Select, Button, message } from "antd";
import type { ResolvePayload } from "../../../models/dispute.model";
import useDisputes from "../../../hooks/useDisputes";

interface ResolveReportModalProps {
  visible: boolean;
  reportId: string;
  orderId: string;
  grandTotal: string;
  onClose: () => void;
  onSuccess: () => void;
}

export const ResolveReportModal: React.FC<ResolveReportModalProps> = ({
  visible,
  reportId,
  grandTotal,
  onClose,
  onSuccess,
}) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const { handleResolve } = useDisputes();

  const handleSubmit = async (values: any) => {
    try {
      setLoading(true);
      const payload: ResolvePayload = {
        status: values.status,
        refundAmount:
          values.status === "refunded" ? values.refundAmount : undefined,
        adminNote: values.adminNote,
      };
      const response = await handleResolve(reportId, payload);
      if (response) {
        form.resetFields();
        onSuccess();
        onClose();
      }
    } catch (error) {
      message.error("Failed to resolve report");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title="Resolve Report"
      open={visible}
      onCancel={onClose}
      width={600}
      footer={[
        <Button key="cancel" onClick={onClose}>
          Cancel
        </Button>,
        <Button
          key="submit"
          type="primary"
          loading={loading}
          onClick={() => form.submit()}
        >
          Resolve
        </Button>,
      ]}
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        initialValues={{ status: "resolved" }}
        className="mt-4"
      >
        <Form.Item
          label="Status"
          name="status"
          rules={[{ required: true, message: "Please select a status" }]}
        >
          <Select
            options={[
              { label: "Resolved", value: "resolved" },
              { label: "Refunded", value: "refunded" },
              { label: "Rejected", value: "rejected" },
            ]}
          />
        </Form.Item>

        <Form.Item
          noStyle
          shouldUpdate={(prevValues, currentValues) =>
            prevValues.status !== currentValues.status
          }
        >
          {({ getFieldValue }) =>
            getFieldValue("status") === "refunded" ? (
              <Form.Item
                label="Refund Amount"
                name="refundAmount"
                rules={[
                  { required: true, message: "Please enter refund amount" },
                  { pattern: /^\d+$/, message: "Please enter a valid amount" },
                ]}
              >
                <InputNumber
                  className="w-full"
                  placeholder="0"
                  max={Number.parseFloat(grandTotal)}
                  formatter={(value) =>
                    `₫ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                  }
                />
              </Form.Item>
            ) : null
          }
        </Form.Item>

        <Form.Item
          label="Admin Note"
          name="adminNote"
          rules={[{ required: true, message: "Please enter admin note" }]}
        >
          <Input.TextArea
            rows={4}
            placeholder="Enter your resolution note..."
          />
        </Form.Item>
      </Form>
    </Modal>
  );
};
