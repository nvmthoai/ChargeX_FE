"use client";

import type React from "react";

import { Modal, Form, Input, Button, message } from "antd";
import { useState } from "react";
import useAdminWallet from "../../../hooks/useAdminWallet";
import BankSelect from "../../../layouts/Header/BankSelect";

interface ApprovePayoutModalProps {
  visible: boolean;
  payoutId: string;
  onClose: () => void;
  onSuccess: () => void;
}

export const ApprovePayoutModal: React.FC<ApprovePayoutModalProps> = ({
  visible,
  payoutId,
  onClose,
  onSuccess,
}) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const { handleApproveRequest, banks, loadingBanks } = useAdminWallet();

  const handleSubmit = async () => {
    try {
      setLoading(true);
      const response = await handleApproveRequest(payoutId);
      if (response) {
        form.resetFields();
        onSuccess();
        onClose();
      }
    } catch (error) {
      message.error("Failed to approve payout");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    form.resetFields();
    onClose();
  };
  
  return (
    <Modal
      title="Approve Payout Request"
      open={visible}
      onCancel={handleClose}
      footer={null}
      width={500}
    >
      <Form form={form} layout="vertical" onFinish={handleSubmit}>
        <Form.Item
          label="Account Number"
          name="accountNumber"
          rules={[{ required: true, message: "Please enter account number" }]}
        >
          <Input placeholder="e.g., 0123456789012" />
        </Form.Item>

        <Form.Item
          label="Bank"
          name="bankCode"
          rules={[{ required: true, message: "Please enter bank code" }]}
        >
          <BankSelect banks={banks} loading={loadingBanks} />
        </Form.Item>

        <Form.Item
          label="Approval Note"
          name="note"
          rules={[{ required: true, message: "Please enter a note" }]}
        >
          <Input.TextArea placeholder="Approval note" rows={3} />
        </Form.Item>

        <div className="flex gap-2 justify-end">
          <Button onClick={onClose}>Cancel</Button>
          <Button type="primary" htmlType="submit" loading={loading}>
            Approve
          </Button>
        </div>
      </Form>
    </Modal>
  );
};
