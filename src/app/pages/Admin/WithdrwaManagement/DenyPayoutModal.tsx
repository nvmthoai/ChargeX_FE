"use client";

import type React from "react";
import { Form, Input, message } from "antd";
import { useState } from "react";
import { XCircle, AlertTriangle } from "lucide-react";
import useAdminWallet from "../../../hooks/useAdminWallet";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

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
    <Dialog open={visible} onOpenChange={(open) => !open && !loading && onClose()}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <div className="mx-auto w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mb-4">
            <XCircle className="w-8 h-8 text-red-600 dark:text-red-400" />
          </div>
          <DialogTitle className="text-2xl font-bold text-center">
            Deny Payout Request
          </DialogTitle>
          <DialogDescription className="text-center">
            Please provide a reason for denying this payout request
          </DialogDescription>
        </DialogHeader>

        <Form form={form} layout="vertical" onFinish={handleSubmit} className="space-y-4">
          <Form.Item
            label={<span className="font-medium text-dark-800 dark:text-dark-200 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" />
              Reason
            </span>}
            name="reason"
            rules={[{ required: true, message: "Please enter a reason" }]}
          >
            <Input.TextArea
              placeholder="Reason for denial"
              rows={4}
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
              variant="destructive"
              disabled={loading}
              className="w-full sm:w-auto gap-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Denying...
                </>
              ) : (
                <>
                  <XCircle className="w-4 h-4" />
                  Deny
                </>
              )}
            </Button>
          </DialogFooter>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
