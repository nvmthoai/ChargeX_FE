"use client"

import type React from "react"
import { useState } from "react"
import { Modal, Form, Input, InputNumber, DatePicker, Button } from "antd"
import type { ApproveAuctionPayload } from "../../../models/auction.model"
import useAuction from "../../../hooks/useAuction"

interface ApproveAuctionModalProps {
  visible: boolean
  auctionRequestId: string
  onClose: () => void
  onSuccess: () => void
}

export const ApproveAuctionModal: React.FC<ApproveAuctionModalProps> = ({
  visible,
  auctionRequestId,
  onClose,
  onSuccess,
}) => {
  const [form] = Form.useForm()
  const [loading, setLoading] = useState(false)
    const {handleApproveRequest} = useAuction()
  const handleSubmit = async (values: any) => {
    try {
      setLoading(true)
      const payload: ApproveAuctionPayload = {
        auctionRequestId,
        startTime: values.startTime.toISOString(),
        endTime: values.endTime.toISOString(),
        reservePrice: values.reservePrice,
        minBidIncrement: values.minBidIncrement,
        antiSnipingSeconds: values.antiSnipingSeconds,
        bidDepositPercent: values.bidDepositPercent,
      }
      await handleApproveRequest(payload)
      form.resetFields()
      onSuccess()
      onClose()
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal title="Approve Auction Request" open={visible} onCancel={onClose} footer={null} width={600}>
      <Form form={form} layout="vertical" onFinish={handleSubmit} className="mt-6">
        <Form.Item label="Auction Request ID" initialValue={auctionRequestId}>
          <Input disabled value={auctionRequestId} />
        </Form.Item>

        <Form.Item
          label="Start Time"
          name="startTime"
          rules={[{ required: true, message: "Please select start time" }]}
        >
          <DatePicker showTime format="YYYY-MM-DD HH:mm:ss" />
        </Form.Item>

        <Form.Item label="End Time" name="endTime" rules={[{ required: true, message: "Please select end time" }]}>
          <DatePicker showTime format="YYYY-MM-DD HH:mm:ss" />
        </Form.Item>

        <Form.Item
          label="Reserve Price"
          name="reservePrice"
          rules={[{ required: true, message: "Please enter reserve price" }]}
        >
          <InputNumber min={0} placeholder="Enter reserve price" className="w-full" />
        </Form.Item>

        <Form.Item
          label="Minimum Bid Increment"
          name="minBidIncrement"
          rules={[{ required: true, message: "Please enter minimum bid increment" }]}
        >
          <InputNumber min={0} placeholder="Enter minimum bid increment" className="w-full" />
        </Form.Item>

        <Form.Item
          label="Anti-Sniping Seconds"
          name="antiSnipingSeconds"
          rules={[{ required: true, message: "Please enter anti-sniping seconds" }]}
        >
          <InputNumber min={0} placeholder="Enter anti-sniping seconds" className="w-full" />
        </Form.Item>

        <Form.Item
          label="Bid Deposit Percent"
          name="bidDepositPercent"
          rules={[{ required: true, message: "Please enter bid deposit percent" }]}
        >
          <InputNumber min={0} max={100} placeholder="Enter bid deposit percent" className="w-full" />
        </Form.Item>

        <Form.Item className="mb-0">
          <div className="flex gap-2 justify-end">
            <Button onClick={onClose}>Cancel</Button>
            <Button type="primary" htmlType="submit" loading={loading}>
              Approve
            </Button>
          </div>
        </Form.Item>
      </Form>
    </Modal>
  )
}
