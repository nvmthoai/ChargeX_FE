"use client";

import { Modal, Form, Input, Rate, Button, message } from "antd";
import { useState } from "react";

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
    <Modal
      title={`Review Seller: ${sellerName}`}
      open={visible}
      onCancel={onClose}
      footer={null}
      centered
    >
      <Form form={form} layout="vertical" onFinish={handleSubmit}>
        <Form.Item
          label="Rating"
          name="rating"
          rules={[{ required: true, message: "Please select a rating" }]}
        >
          <Rate />
        </Form.Item>

        <Form.Item
          label="Comment"
          name="comment"
          rules={[{ required: true, message: "Please enter your comment" }]}
        >
          <Input.TextArea rows={4} placeholder="Share your feedback..." />
        </Form.Item>

        <div className="flex gap-2 justify-end">
          <Button onClick={onClose}>Cancel</Button>
          <Button type="primary" htmlType="submit" loading={loading}>
            Submit Review
          </Button>
        </div>
      </Form>
    </Modal>
  );
}
