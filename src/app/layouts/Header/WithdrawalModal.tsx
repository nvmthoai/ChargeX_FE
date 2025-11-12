import { Form, Input, message } from "antd";
import { useState } from "react";
import { ArrowUp, Wallet } from "lucide-react";
import BankSelect from "./BankSelect";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

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
  }) => Promise<any>;
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
      const response = await onSubmit({
        amount: Number.parseFloat(values.amount),
        accountNumber: values.accountNumber,
        bankCode: values.bankCode,
        note: values.note || "",
      });
      if (response) {
        form.resetFields();
      }
    } catch (error: any) {
      console.error(error.message || "Failed to submit withdrawal request");
      message.error(error.message || "Failed to submit withdrawal request");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    form.resetFields();
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(open) => !open && !loading && handleClose()}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-ocean-600 to-energy-600 bg-clip-text text-transparent flex items-center gap-2">
            <Wallet className="w-6 h-6 text-ocean-600" />
            Withdraw Funds
          </DialogTitle>
          <DialogDescription>
            Transfer money from your wallet to your bank account
          </DialogDescription>
        </DialogHeader>

        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          className="space-y-4"
        >
          <Form.Item
            label={<span className="font-medium text-dark-800 dark:text-dark-200">Amount (VND)</span>}
            name="amount"
            rules={[{ required: true, message: "Please enter amount" }]}
          >
            <Input
              type="number"
              placeholder="Enter amount"
              min={1}
              className="rounded-lg"
              prefix="₫"
              size="large"
            />
          </Form.Item>

          <Form.Item
            label={<span className="font-medium text-dark-800 dark:text-dark-200">Bank Account</span>}
            name="bankCode"
            rules={[{ required: true, message: "Please select a bank" }]}
          >
            <BankSelect banks={banks} loading={loadingBanks} />
          </Form.Item>

          <Form.Item
            label={<span className="font-medium text-dark-800 dark:text-dark-200">Account Number</span>}
            name="accountNumber"
            rules={[
              { required: true, message: "Please enter account number" },
              {
                pattern: /^\d+$/,
                message: "Account number must contain only digits",
              },
            ]}
          >
            <Input placeholder="Enter account number" className="rounded-lg" size="large" />
          </Form.Item>

          <Form.Item
            label={<span className="font-medium text-dark-800 dark:text-dark-200">Note (Optional)</span>}
            name="note"
          >
            <Input.TextArea
              placeholder="Add a note for this withdrawal"
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
                  Processing...
                </>
              ) : (
                <>
                  <ArrowUp className="w-4 h-4" />
                  Submit Withdrawal
                </>
              )}
            </Button>
          </DialogFooter>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
