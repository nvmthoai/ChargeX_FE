import { Modal, Form, Input, Button } from "antd";
import { getUserInfo } from "../../../hooks/useAddress";

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

  const userData = getUserInfo();

  const handleSubmit = async (values: { note: string }) => {
    const response = await onSubmit({
      sellerId: userData.sub,
      productId,
      note: values.note,
    });
    if (response) {
      onClose();
    }
  };

  return (
    <Modal
      title="Request Auction Permission"
      open={open}
      onCancel={onClose}
      footer={null}
      width={500}
    >
      <div className="mb-4">
        <p className="text-gray-600">
          <strong>Product:</strong> {productTitle}
        </p>
      </div>

      <Form form={form} layout="vertical" onFinish={handleSubmit}>
        <Form.Item
          label="Note"
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
          />
        </Form.Item>
        <Form.Item name="productId" initialValue={productId}>
          <Input hidden />
        </Form.Item>
        <div className="flex gap-2 justify-end">
          <Button onClick={onClose}>Cancel</Button>
          <Button type="primary" htmlType="submit" danger>
            Submit Request
          </Button>
        </div>
      </Form>
    </Modal>
  );
}
