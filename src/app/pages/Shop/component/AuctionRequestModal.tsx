import { useState } from "react";
import { Form, Input, message } from "antd";
import { Gavel, FileText } from "lucide-react";
import { getUserInfo } from "../../../hooks/useAddress";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

interface AuctionRequestModalProps {
  open: boolean;
  productId: string;
  productTitle: string;
  onClose: () => void;
  onSubmit: any;
}

export default function AuctionRequestModal({
  open,
  productId,
  productTitle,
  onClose,
  onSubmit,
}: AuctionRequestModalProps) {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  const userData = getUserInfo();

  const handleSubmit = async (values: { note: string }) => {
    try {
      setLoading(true);
      const response = await onSubmit({
        sellerId: userData.sub,
        productId,
        note: values.note,
      });
      if (response) {
        form.resetFields();
        onClose();
      }
    } catch (error) {
      message.error("Failed to submit auction request");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(open) => !open && !loading && onClose()}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-ocean-600 to-energy-600 bg-clip-text text-transparent flex items-center gap-2">
            <Gavel className="w-6 h-6 text-ocean-600" />
            Request Auction Permission
          </DialogTitle>
          <DialogDescription>
            Request permission to create an auction for your product
          </DialogDescription>
        </DialogHeader>

        <div className="p-4 bg-ocean-50 dark:bg-ocean-900/20 rounded-lg mb-4">
          <p className="text-sm text-muted-foreground">
            <span className="font-semibold text-dark-800 dark:text-dark-200">Product:</span>{" "}
            <span className="text-dark-700 dark:text-dark-300">{productTitle}</span>
          </p>
        </div>

        <Form form={form} layout="vertical" onFinish={handleSubmit} className="space-y-4">
          <Form.Item
            label={<span className="font-medium text-dark-800 dark:text-dark-200 flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Note
            </span>}
            name="note"
            rules={[
              {
                required: true,
                message: "Please enter a note for the auction request",
              },
              {
                min: 10,
                message: "Note must be at least 10 characters",
              },
            ]}
          >
            <Input.TextArea
              rows={4}
              placeholder="Enter your reason for requesting auction permission..."
              className="rounded-lg"
            />
          </Form.Item>
          <Form.Item name="productId" initialValue={productId} hidden>
            <Input />
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
                  Submitting...
                </>
              ) : (
                <>
                  <Gavel className="w-4 h-4" />
                  Submit Request
                </>
              )}
            </Button>
          </DialogFooter>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
