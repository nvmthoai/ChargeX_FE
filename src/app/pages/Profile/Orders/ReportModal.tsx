"use client";

import {
  Modal,
  Form,
  Input,
  Select,
  Upload,
  Button,
  message,
  Radio,
} from "antd";
import { UploadOutlined } from "@ant-design/icons";
import { useState } from "react";
import type { RcFile } from "antd/es/upload";

interface ReportModalProps {
  visible: boolean;
  orderId: string;
  sellerId: string;
  sellerName: string;
  onClose: () => void;
  onSubmit: (orderId: string, values: any) => Promise<any>;
}

export default function ReportModal({
  visible,
  orderId,
  sellerName,
  onClose,
  onSubmit,
}: ReportModalProps) {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [fileList, setFileList] = useState<RcFile[]>([]);
  const [attachmentType, setAttachmentType] = useState<"url" | "file">("file");

  const handleUploadChange = ({ fileList: newFileList }: any) => {
    setFileList(newFileList.map((file: any) => file.originFileObj || file));
  };

  const handleSubmit = async (values: {
    type: string;
    initialMessage: string;
    attachmentUrl?: string;
  }) => {
    try {
      setLoading(true);

      let attachments = "";
      let fileToSubmit: RcFile | undefined;

      if (attachmentType === "file" && fileList.length > 0) {
        attachments = fileList
          .map((file) => URL.createObjectURL(file))
          .join(",");
        fileToSubmit = fileList[0];
      } else if (attachmentType === "url" && values.attachmentUrl) {
        attachments = values.attachmentUrl;
      }

      const response = await onSubmit(
        orderId,
        fileToSubmit
          ? {
              type: values.type,
              initialMessage: values.initialMessage,
              file: fileToSubmit,
            }
          : {
              type: values.type,
              initialMessage: values.initialMessage,
              attachments: attachments,
            }
      );

      if (response) {
        form.resetFields();
        setFileList([]);
        setAttachmentType("file");
        onClose();
      }
    } catch (error) {
      message.error("Failed to submit report");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title={`Create Report for: ${sellerName}`}
      open={visible}
      onCancel={onClose}
      footer={null}
      centered
    >
      <Form form={form} layout="vertical" onFinish={handleSubmit}>
        <Form.Item
          label="Report Type"
          name="type"
          initialValue="refund"
          rules={[{ required: true, message: "Please select a report type" }]}
        >
          <Select
            options={[
              { label: "Refund", value: "refund" },
              { label: "Partial Refund", value: "partial_refund" },
              { label: "Product Issue", value: "product_issue" },
              { label: "Order Issue", value: "order_issue" },
              { label: "Other", value: "other" },
            ]}
          />
        </Form.Item>

        <Form.Item
          label="Message"
          name="initialMessage"
          rules={[
            { required: true, message: "Please enter your message" },
            { min: 10, message: "Message must be at least 10 characters" },
          ]}
        >
          <Input.TextArea
            rows={4}
            placeholder="Describe the issue in detail..."
          />
        </Form.Item>

        <Form.Item label="Attachment Method">
          <Radio.Group
            value={attachmentType}
            onChange={(e) => setAttachmentType(e.target.value)}
          >
            <Radio value="file">Upload File</Radio>
            
          </Radio.Group>
        </Form.Item>

        {attachmentType === "file" ? (
          <Form.Item label="Upload Image">
            <Upload
              fileList={fileList.map((file) => ({
                uid: file.name,
                name: file.name,
                status: "done",
                originFileObj: file,
              }))}
              onChange={handleUploadChange}
              beforeUpload={() => false}
              accept="image/*"
              maxCount={1}
            >
              <Button icon={<UploadOutlined />}>Upload Image</Button>
            </Upload>
          </Form.Item>
        ) : (
          <Form.Item
            label="Image URL"
            name="attachmentUrl"
            rules={[{ required: true, message: "Please enter an image URL" }]}
          >
            <Input placeholder="https://example.com/image.jpg" />
          </Form.Item>
        )}

        <div className="flex gap-2 justify-end">
          <Button onClick={onClose}>Cancel</Button>
          <Button type="primary" htmlType="submit" loading={loading}>
            Submit Report
          </Button>
        </div>
      </Form>
    </Modal>
  );
}
