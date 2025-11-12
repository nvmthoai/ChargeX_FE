"use client";

import type React from "react";
import { Form, Input, message } from "antd";
import { useState } from "react";
import { CheckCircle } from "lucide-react";
import useAdminWallet from "../../../hooks/useAdminWallet";
import BankSelect from "../../../layouts/Header/BankSelect";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

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
    <Dialog open={visible} onOpenChange={(open) => !open && !loading && handleClose()}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-ocean-600 to-energy-600 bg-clip-text text-transparent flex items-center gap-2">
            <CheckCircle className="w-6 h-6 text-ocean-600" />
            Approve Payout Request
          </DialogTitle>
          <DialogDescription>
            Confirm and approve this payout request
          </DialogDescription>
        </DialogHeader>

        <Form form={form} layout="vertical" onFinish={handleSubmit} className="space-y-4">
          <Form.Item
            label={<span className="font-medium text-dark-800 dark:text-dark-200">Account Number</span>}
            name="accountNumber"
            rules={[{ required: true, message: "Please enter account number" }]}
          >
            <Input placeholder="e.g., 0123456789012" className="rounded-lg" size="large" />
          </Form.Item>

          <Form.Item
            label={<span className="font-medium text-dark-800 dark:text-dark-200">Bank</span>}
            name="bankCode"
            rules={[{ required: true, message: "Please enter bank code" }]}
          >
            <BankSelect banks={banks} loading={loadingBanks} />
          </Form.Item>

          <Form.Item
            label={<span className="font-medium text-dark-800 dark:text-dark-200">Approval Note</span>}
            name="note"
            rules={[{ required: true, message: "Please enter a note" }]}
          >
            <Input.TextArea
              placeholder="Approval note"
              rows={3}
              className="rounded-lg"
            />
          </Form.Item>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
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
                  Approving...
                </>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4" />
                  Approve
                </>
              )}
            </Button>
          </DialogFooter>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
