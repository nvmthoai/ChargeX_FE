"use client";

import { Form, Input, message } from "antd";
import { useState } from "react";
import { Wallet, ArrowDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

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

      if (onSubmit) {
        await onSubmit(amount);
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
    <Dialog open={open} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-ocean-600 to-energy-600 bg-clip-text text-transparent flex items-center gap-2">
            <Wallet className="w-6 h-6 text-ocean-600" />
            Deposit Money
          </DialogTitle>
          <DialogDescription>
            Add funds to your wallet account
          </DialogDescription>
        </DialogHeader>

        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          className="space-y-4"
        >
          <Form.Item
            label={<span className="font-medium text-dark-800 dark:text-dark-200">Amount</span>}
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
              prefix="₫"
              type="number"
              step="0.01"
              min="0"
              size="large"
              className="rounded-lg"
            />
          </Form.Item>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={loading}
              className="w-full sm:w-auto"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="w-full sm:w-auto gap-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <ArrowDown className="w-4 h-4" />
                  Deposit
                </>
              )}
            </Button>
          </DialogFooter>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
