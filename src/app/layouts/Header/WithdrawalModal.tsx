"use client";

import { Modal, Form, Input, Button, message } from "antd";
import { useState } from "react";
import BankSelect from "./BankSelect";

interface Bank {
  id: number;
  name: string;
  code: string;
  bin: string;
  shortName: string;
  logo: string;
  transferSupported: number;
  lookupSupported: number;
}

interface WithdrawalModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: {
    amount: number;
    accountNumber: string;
    bankCode: string;
    note: string;
  }) => Promise<void>;
  banks: Bank[];
  loadingBanks: boolean;
}

export default function WithdrawalModal({
  open,
  onClose,
  onSubmit,
  banks,
  loadingBanks,
}: WithdrawalModalProps) {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (values: any) => {
    try {
      setLoading(true);
      await onSubmit({
        amount: Number.parseFloat(values.amount),
        accountNumber: values.accountNumber,
        bankCode: values.bankCode,
        note: values.note || "",
      });
      message.success("Withdrawal request submitted successfully");
      form.resetFields();
      onClose();
    } catch (error: any) {
      message.error(error.message || "Failed to submit withdrawal request");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title="Withdraw Funds"
      open={open}
      onCancel={() => {
        form.resetFields();
        onClose();
      }}
      footer={null}
      centered
      width={500}
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        className="mt-6"
      >
        <Form.Item
          label="Amount (VND)"
          name="amount"
          rules={[{ required: true, message: "Please enter amount" }]}
        >
          <Input
            type="number"
            placeholder="Enter amount"
            min={1}
            className="rounded-lg"
            prefix="₫"
          />
        </Form.Item>

        <Form.Item
          label="Bank Account"
          name="bankCode"
          rules={[{ required: true, message: "Please select a bank" }]}
        >
          <BankSelect banks={banks} loading={loadingBanks} />
        </Form.Item>

        <Form.Item
          label="Account Number"
          name="accountNumber"
          rules={[
            { required: true, message: "Please enter account number" },
            {
              pattern: /^\d+$/,
              message: "Account number must contain only digits",
            },
          ]}
        >
          <Input placeholder="Enter account number" className="rounded-lg" />
        </Form.Item>

        <Form.Item label="Note (Optional)" name="note">
          <Input.TextArea
            placeholder="Add a note for this withdrawal"
            rows={3}
            className="rounded-lg"
          />
        </Form.Item>

        <div className="flex gap-3 justify-end">
          <Button
            onClick={() => {
              form.resetFields();
              onClose();
            }}
          >
            Cancel
          </Button>
          <Button
            type="primary"
            htmlType="submit"
            loading={loading}
            className="bg-blue-500"
          >
            Submit Withdrawal
          </Button>
        </div>
      </Form>
    </Modal>
  );
}
