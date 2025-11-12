"use client";

import { Form, Input, Rate, message } from "antd";
import { useState } from "react";
import { Star, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

interface ReviewModalProps {
  visible: boolean;
  orderId: string;
  sellerName: string;
  sellerId: string;
  onClose: () => void;
  onSubmit: (reviewData: {
    orderId: string;
    reviewerId: string;
    revieweeId: string;
    rating: number;
    comment: string;
  }) => Promise<void>;
}

export default function ReviewModal({
  visible,
  orderId,
  sellerName,
  sellerId,
  onClose,
  onSubmit,
}: ReviewModalProps) {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (values: { rating: number; comment: string }) => {
    try {
      setLoading(true);
      const currentUser = localStorage.getItem("user");
      const userId = currentUser ? JSON.parse(currentUser).sub : "";

      await onSubmit({
        orderId,
        reviewerId: userId,
        revieweeId: sellerId,
        rating: values.rating,
        comment: values.comment,
      });
      form.resetFields();
      onClose();
    } catch (error) {
      message.error("Failed to submit review");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={visible} onOpenChange={(open) => !open && !loading && onClose()}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-ocean-600 to-energy-600 bg-clip-text text-transparent flex items-center gap-2">
            <Star className="w-6 h-6 text-ocean-600" />
            Review Seller: {sellerName}
          </DialogTitle>
          <DialogDescription>
            Share your experience with this seller
          </DialogDescription>
        </DialogHeader>

        <Form form={form} layout="vertical" onFinish={handleSubmit} className="space-y-4">
          <Form.Item
            label={<span className="font-medium text-dark-800 dark:text-dark-200">Rating</span>}
            name="rating"
            rules={[{ required: true, message: "Please select a rating" }]}
          >
            <Rate className="text-2xl" />
          </Form.Item>

          <Form.Item
            label={<span className="font-medium text-dark-800 dark:text-dark-200 flex items-center gap-2">
              <MessageSquare className="w-4 h-4" />
              Comment
            </span>}
            name="comment"
            rules={[{ required: true, message: "Please enter your comment" }]}
          >
            <Input.TextArea
              rows={4}
              placeholder="Share your feedback..."
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
                  <Star className="w-4 h-4" />
                  Submit Review
                </>
              )}
            </Button>
          </DialogFooter>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
