"use client";

import type React from "react";

import { Modal, Form, Input, Button, message } from "antd";
import { useState } from "react";
import useAdminWallet from "../../../hooks/useAdminWallet";

interface DenyPayoutModalProps {
  visible: boolean;
  payoutId: string;
  onClose: () => void;
  onSuccess: () => void;
}

export const DenyPayoutModal: React.FC<DenyPayoutModalProps> = ({
  visible,
  payoutId,
  onClose,
  onSuccess,
}) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const { handleDenyRequest } = useAdminWallet();

  const handleSubmit = async (values: any) => {
    try {
      setLoading(true);
      // TODO: Call API with reason
      const payloadData = {
        reason: values.reason,
      };
      const response = await handleDenyRequest(payoutId, payloadData);
      if (response) {
        form.resetFields();
        onSuccess();
        onClose();
      }
    } catch (error) {
      message.error("Failed to deny payout");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title="Deny Payout Request"
      open={visible}
      onCancel={onClose}
      footer={null}
      width={500}
    >
      <Form form={form} layout="vertical" onFinish={handleSubmit}>
        <Form.Item
          label="Reason"
          name="reason"
          rules={[{ required: true, message: "Please enter a reason" }]}
        >
          <Input.TextArea placeholder="Reason for denial" rows={4} />
        </Form.Item>

        <div className="flex gap-2 justify-end">
          <Button onClick={onClose}>Cancel</Button>
          <Button danger htmlType="submit" loading={loading}>
            Deny
          </Button>
        </div>
      </Form>
    </Modal>
  );
};
