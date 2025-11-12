"use client";

import {
  Form,
  Input,
  Select,
  Upload,
  message,
  Radio,
} from "antd";
import { useState } from "react";
import type { RcFile } from "antd/es/upload";
import { AlertTriangle, Upload as UploadIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

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
    <Dialog open={visible} onOpenChange={(open) => !open && !loading && onClose()}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-ocean-600 to-energy-600 bg-clip-text text-transparent flex items-center gap-2">
            <AlertTriangle className="w-6 h-6 text-ocean-600" />
            Create Report for: {sellerName}
          </DialogTitle>
          <DialogDescription>
            Report an issue with this order or seller
          </DialogDescription>
        </DialogHeader>

        <Form form={form} layout="vertical" onFinish={handleSubmit} className="space-y-4">
          <Form.Item
            label={<span className="font-medium text-dark-800 dark:text-dark-200">Report Type</span>}
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
              className="rounded-lg"
            />
          </Form.Item>

          <Form.Item
            label={<span className="font-medium text-dark-800 dark:text-dark-200">Message</span>}
            name="initialMessage"
            rules={[
              { required: true, message: "Please enter your message" },
              { min: 10, message: "Message must be at least 10 characters" },
            ]}
          >
            <Input.TextArea
              rows={4}
              placeholder="Describe the issue in detail..."
              className="rounded-lg"
            />
          </Form.Item>

          <Form.Item label={<span className="font-medium text-dark-800 dark:text-dark-200">Attachment Method</span>}>
            <Radio.Group
              value={attachmentType}
              onChange={(e) => setAttachmentType(e.target.value)}
            >
              <Radio value="file">Upload File</Radio>
            </Radio.Group>
          </Form.Item>

          {attachmentType === "file" ? (
            <Form.Item label={<span className="font-medium text-dark-800 dark:text-dark-200">Upload Image</span>}>
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
                <Button variant="outline" className="gap-2">
                  <UploadIcon className="w-4 h-4" />
                  Upload Image
                </Button>
              </Upload>
            </Form.Item>
          ) : (
            <Form.Item
              label={<span className="font-medium text-dark-800 dark:text-dark-200">Image URL</span>}
              name="attachmentUrl"
              rules={[{ required: true, message: "Please enter an image URL" }]}
            >
              <Input placeholder="https://example.com/image.jpg" className="rounded-lg" />
            </Form.Item>
          )}

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
                  <AlertTriangle className="w-4 h-4" />
                  Submit Report
                </>
              )}
            </Button>
          </DialogFooter>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
