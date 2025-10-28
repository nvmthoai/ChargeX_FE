"use client"

import { Modal, Form, InputNumber, DatePicker, Button } from "antd"
import { useState } from "react"

interface GoLiveModalProps {
  visible: boolean
  onCancel: () => void
  onSubmit: (data: any) => Promise<void>
  auctionId: string
  loading: boolean
}

export const GoLiveModal = ({ visible, onCancel, onSubmit, auctionId }: GoLiveModalProps) => {
  const [form] = Form.useForm()
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (values: any) => {
    setSubmitting(true)
    try {
      await onSubmit({
        auctionId,
        startTime: values.startTime.toISOString(),
        endTime: values.endTime.toISOString(),
        reservePrice: values.reservePrice,
        minBidIncrement: values.minBidIncrement,
        antiSnipingSeconds: values.antiSnipingSeconds,
        bidDepositPercent: values.bidDepositPercent,
      })
      form.resetFields()
      onCancel()
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Modal title="Go Live" open={visible} onCancel={onCancel} footer={null} style={{ backgroundColor: "#111827" }}>
      <Form form={form} layout="vertical" onFinish={handleSubmit} style={{ color: "#D1D5DB" }}>
        <Form.Item
          label="Start Time"
          name="startTime"
          rules={[{ required: true, message: "Please select start time" }]}
        >
          <DatePicker showTime style={{ width: "100%" }} />
        </Form.Item>

        <Form.Item label="End Time" name="endTime" rules={[{ required: true, message: "Please select end time" }]}>
          <DatePicker showTime style={{ width: "100%" }} />
        </Form.Item>

        <Form.Item
          label="Reserve Price"
          name="reservePrice"
          rules={[{ required: true, message: "Please enter reserve price" }]}
        >
          <InputNumber style={{ width: "100%" }} />
        </Form.Item>

        <Form.Item
          label="Min Bid Increment"
          name="minBidIncrement"
          rules={[{ required: true, message: "Please enter min bid increment" }]}
        >
          <InputNumber style={{ width: "100%" }} />
        </Form.Item>

        <Form.Item
          label="Anti Sniping Seconds"
          name="antiSnipingSeconds"
          rules={[{ required: true, message: "Please enter anti sniping seconds" }]}
        >
          <InputNumber style={{ width: "100%" }} />
        </Form.Item>

        <Form.Item
          label="Bid Deposit Percent"
          name="bidDepositPercent"
          rules={[{ required: true, message: "Please enter bid deposit percent" }]}
        >
          <InputNumber style={{ width: "100%" }} />
        </Form.Item>

        <Form.Item>
          <Button type="primary" htmlType="submit" loading={submitting} style={{ width: "100%" }}>
            Go Live
          </Button>
        </Form.Item>
      </Form>
    </Modal>
  )
}
