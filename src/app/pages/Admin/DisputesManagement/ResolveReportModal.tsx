"use client";

import type React from "react";
import { useState, useEffect } from "react";
import { Form, Input, InputNumber, Select, message } from "antd";
import { CheckCircle, AlertCircle } from "lucide-react";
import type { ResolvePayload } from "../../../models/dispute.model";
import useDisputes from "../../../hooks/useDisputes";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

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

  // Prefill refundAmount when modal opens or grandTotal changes
  useEffect(() => {
    if (visible) {
      const amount = Number.parseFloat(grandTotal || "0") || 0;
      form.setFieldsValue({ refundAmount: amount });
      // also reset status default to resolved unless already set
      const currentStatus = form.getFieldValue("status");
      if (!currentStatus) form.setFieldsValue({ status: "resolved" });
    } else {
      form.resetFields();
    }
  }, [visible, grandTotal, form]);

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
    <Dialog open={visible} onOpenChange={(open) => !open && !loading && onClose()}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-ocean-400 to-energy-400 bg-clip-text text-transparent flex items-center gap-2">
            <CheckCircle className="w-6 h-6 text-ocean-400" />
            Resolve Report
          </DialogTitle>
          <DialogDescription>
            Resolve this dispute report with appropriate action
          </DialogDescription>
        </DialogHeader>

        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          initialValues={{ status: "resolved" }}
          className="space-y-4"
        >
          <Form.Item
            label={<span className="font-medium text-dark-200">Status</span>}
            name="status"
            rules={[{ required: true, message: "Please select a status" }]}
          >
            <Select
              className="bg-dark-700 text-dark-100 border-ocean-800"
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
                  label={<span className="font-medium text-dark-200">Refund Amount</span>}
                  name="refundAmount"
                  rules={[
                    { required: true, message: "Please enter refund amount" },
                    { pattern: /^\d+$/, message: "Please enter a valid amount" },
                  ]}
                >
                  <InputNumber
                    className="w-full bg-dark-700 text-dark-100 border-ocean-800"
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
            label={<span className="font-medium text-dark-200 flex items-center gap-2">
              <AlertCircle className="w-4 h-4" />
              Admin Note
            </span>}
            name="adminNote"
            rules={[{ required: true, message: "Please enter admin note" }]}
          >
            <Input.TextArea
              rows={4}
              placeholder="Enter your resolution note..."
              className="bg-dark-700 text-dark-100 border-ocean-800 placeholder:text-dark-400"
            />
          </Form.Item>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={onClose}
              disabled={loading}
              className="w-full sm:w-auto"
            >
              Cancel
            </Button>
            <Button
              onClick={() => form.submit()}
              disabled={loading}
              className="w-full sm:w-auto gap-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Resolving...
                </>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4" />
                  Resolve
                </>
              )}
            </Button>
          </DialogFooter>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
