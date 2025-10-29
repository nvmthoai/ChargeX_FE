"use client";

import { Modal, Form, Input, Button, message } from "antd";
import { useState } from "react";

interface DepositModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit?: (amount: any) => void;
}

export default function DepositModal({
  open,
  onClose,
  onSubmit,
}: DepositModalProps) {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (values: { amount: string }) => {
    try {
      setLoading(true);
      const amount = Number.parseFloat(values.amount);

      if (amount <= 0) {
        message.error("Amount must be greater than 0");
        return;
      }

      // Call the onSubmit callback if provided
      if (onSubmit) {
        onSubmit(amount);
      }

      message.success("Deposit request submitted successfully");
      form.resetFields();
      onClose();
    } catch (error) {
      message.error("Failed to submit deposit request");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title="Deposit Money"
      open={open}
      onCancel={onClose}
      footer={null}
      centered
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        className="mt-6"
      >
        <Form.Item
          label="Amount"
          name="amount"
          rules={[
            { required: true, message: "Please enter amount" },
            {
              pattern: /^\d+(\.\d{1,2})?$/,
              message: "Please enter a valid amount",
            },
          ]}
        >
          <Input
            placeholder="Enter amount"
            prefix="$"
            type="number"
            step="0.01"
            min="0"
          />
        </Form.Item>

        <Form.Item className="mb-0">
          <Button
            type="primary"
            htmlType="submit"
            loading={loading}
            block
            className="bg-blue-500 hover:bg-blue-600"
          >
            Deposit
          </Button>
        </Form.Item>
      </Form>
    </Modal>
  );
}
