import { useState } from "react";
import { Form, Input, InputNumber, message } from "antd";
import { Gavel, FileText, DollarSign, Clock, Percent } from "lucide-react";
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

  const handleSubmit = async (values: any) => {
    try {
      setLoading(true);

      // Validate prices
      if (values.reservePrice < values.startingPrice) {
        message.error("Reserve price must be >= starting price");
        return;
      }

      if (values.buyNowPrice && values.buyNowPrice <= values.reservePrice) {
        message.error("Buy-now price must be > reserve price");
        return;
      }

      const response = await onSubmit({
        sellerId: userData.sub,
        productId,
        startingPrice: values.startingPrice,
        reservePrice: values.reservePrice,
        minBidIncrement: values.minBidIncrement,
        antiSnipingSeconds: values.antiSnipingSeconds,
        buyNowPrice: values.buyNowPrice || null,
        bidDepositPercent: values.bidDepositPercent || 0,
        note: values.note,
      });
      if (response) {
        message.success("Auction request submitted successfully");
        form.resetFields();
        onClose();
      }
    } catch (error: any) {
      message.error(error?.message || "Failed to submit auction request");
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
          {/* Starting Price */}
          <Form.Item
            label={<span className="font-medium text-dark-800 dark:text-dark-200 flex items-center gap-2">
              <DollarSign className="w-4 h-4" />
              Starting Price
            </span>}
            name="startingPrice"
            rules={[
              { required: true, message: "Starting price is required" },
              { type: "number", min: 0, message: "Must be >= 0" },
            ]}
          >
            <InputNumber
              placeholder="0"
              className="w-full"
              formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
              parser={(value) => parseFloat(value?.replace(/,/g, '') || '0')}
            />
          </Form.Item>

          {/* Reserve Price */}
          <Form.Item
            label={<span className="font-medium text-dark-800 dark:text-dark-200 flex items-center gap-2">
              <DollarSign className="w-4 h-4" />
              Reserve Price (Minimum to Sell)
            </span>}
            name="reservePrice"
            rules={[
              { required: true, message: "Reserve price is required" },
              { type: "number", min: 0, message: "Must be >= 0" },
            ]}
          >
            <InputNumber
              placeholder="0"
              className="w-full"
              formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
              parser={(value) => parseFloat(value?.replace(/,/g, '') || '0')}
            />
          </Form.Item>

          {/* Min Bid Increment */}
          <Form.Item
            label={<span className="font-medium text-dark-800 dark:text-dark-200 flex items-center gap-2">
              <DollarSign className="w-4 h-4" />
              Minimum Bid Increment
            </span>}
            name="minBidIncrement"
            initialValue={0}
            rules={[
              { type: "number", min: 0, message: "Must be >= 0" },
            ]}
          >
            <InputNumber
              placeholder="0"
              className="w-full"
              formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
              parser={(value) => parseFloat(value?.replace(/,/g, '') || '0')}
            />
          </Form.Item>

          {/* Anti-Sniping Seconds */}
          <Form.Item
            label={<span className="font-medium text-dark-800 dark:text-dark-200 flex items-center gap-2">
              <Clock className="w-4 h-4" />
              Anti-Sniping Time (Seconds)
            </span>}
            name="antiSnipingSeconds"
            initialValue={30}
            rules={[
              { type: "number", min: 0, message: "Must be >= 0" },
            ]}
            tooltip="Extends auction time if bid is placed within N seconds of end"
          >
            <InputNumber
              placeholder="30"
              className="w-full"
            />
          </Form.Item>

          {/* Buy Now Price */}
          <Form.Item
            label={<span className="font-medium text-dark-800 dark:text-dark-200 flex items-center gap-2">
              <DollarSign className="w-4 h-4" />
              Buy Now Price (Optional)
            </span>}
            name="buyNowPrice"
            rules={[
              { type: "number", min: 0, message: "Must be >= 0" },
            ]}
            tooltip="Leave empty to disable buy-now"
          >
            <InputNumber
              placeholder="Leave empty to disable"
              className="w-full"
              formatter={(value) => value ? `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',') : ''}
              parser={(value) => parseFloat(value?.replace(/,/g, '') || '0')}
            />
          </Form.Item>

          {/* Bid Deposit Percent */}
          <Form.Item
            label={<span className="font-medium text-dark-800 dark:text-dark-200 flex items-center gap-2">
              <Percent className="w-4 h-4" />
              Bid Deposit Percent (0-100)
            </span>}
            name="bidDepositPercent"
            initialValue={10}
            rules={[
              { type: "number", min: 0, max: 100, message: "Must be between 0 and 100" },
            ]}
            tooltip="Percentage of bid amount to hold as deposit"
          >
            <InputNumber
              placeholder="10"
              min={0}
              max={100}
              className="w-full"
            />
          </Form.Item>

          {/* Note */}
          <Form.Item
            label={<span className="font-medium text-dark-800 dark:text-dark-200 flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Note (Optional)
            </span>}
            name="note"
            rules={[
              {
                min: 0,
                message: "Note is optional",
              },
            ]}
          >
            <Input.TextArea
              rows={3}
              placeholder="Add any additional notes for admin review..."
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
