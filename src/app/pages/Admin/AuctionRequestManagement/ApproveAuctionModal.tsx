"use client"

import type React from "react"
import { useState } from "react"
import { Modal, Form, Input, InputNumber, DatePicker, Button, Tooltip } from "antd"
import dayjs from 'dayjs'
import { CheckCircleOutlined, InfoCircleOutlined } from "@ant-design/icons"
import type { ApproveAuctionPayload } from "../../../models/auction.model"
import useAuction from "../../../hooks/useAuction"
import "./ApproveAuctionModal.css"

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
  const { handleApproveRequest } = useAuction()
  
  // disable dates before today
  const disabledDate = (current: any) => {
    return current && current.isBefore(dayjs(), 'day')
  }

  // disable times earlier than now when selecting today
  const disabledTime = (current: any) => {
    if (!current) return {}
    if (!current.isSame(dayjs(), 'day')) return {}
    const h = dayjs().hour()
    const m = dayjs().minute()
    return {
      disabledHours: () => Array.from({ length: h }, (_, i) => i),
      disabledMinutes: (selectedHour: number) => (selectedHour === h ? Array.from({ length: m }, (_, i) => i) : []),
      disabledSeconds: () => []
    }
  }

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
    <Modal
      title={
        <div className="flex items-center gap-2 text-xl font-semibold">
          <span className="text-2xl">✅</span>
          <span>Approve Auction Request</span>
        </div>
      }
      open={visible}
      onCancel={onClose}
      footer={null}
      width={700}
      className="approve-auction-modal"
    >
      <div className="border-t pt-4 mt-2">
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          {/* Request ID Section */}
          <div className="bg-transparent p-4 rounded-lg mb-6">
            <Form.Item
              label={<span className="text-sm font-medium">Auction Request ID</span>}
              className="mb-0"
            >
              <Input disabled value={auctionRequestId} className="font-mono text-sm" />
            </Form.Item>
          </div>

          {/* Time Settings */}
          <div className="mb-6">
            <h3 className="text-base font-semibold mb-4 flex items-center gap-2">
              <span>⏰</span>
              <span>Auction Time</span>
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <Form.Item
                label={<span className="text-sm font-medium">Start Time</span>}
                name="startTime"
                rules={[{ required: true, message: "Please select a start time" }]}
              >
                <DatePicker
                  showTime
                  format="DD/MM/YYYY HH:mm:ss"
                  className="w-full datepicker-white-placeholder"
                  placeholder="Select start time"
                  disabledDate={disabledDate}
                  disabledTime={disabledTime}
                />
              </Form.Item>

              <Form.Item
                label={<span className="text-sm font-medium">End Time</span>}
                name="endTime"
                rules={[
                  { required: true, message: "Please select an end time" },
                  ({ getFieldValue }) => ({
                    validator(_, value) {
                      const start = getFieldValue('startTime')
                      if (value && start && value.isBefore(start)) {
                        return Promise.reject(new Error('End time must be after start time'))
                      }
                      return Promise.resolve()
                    }
                  })
                ]}
              >
                <DatePicker
                  showTime
                  format="DD/MM/YYYY HH:mm:ss"
                  className="w-full datepicker-white-placeholder"
                  placeholder="Select end time"
                  disabledDate={disabledDate}
                  disabledTime={disabledTime}
                />
              </Form.Item>
            </div>
          </div>

          {/* Price Settings */}
          <div className="mb-6">
            <h3 className="text-base font-semibold mb-4 flex items-center gap-2">
              <span>💰</span>
              <span>Price Settings</span>
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <Form.Item
                label={<span className="text-sm font-medium">Reserve Price (₫) <Tooltip title="Minimum price required to sell the item if reserve not met auction won't conclude"><InfoCircleOutlined style={{ marginLeft: 6, color: 'rgba(255,255,255,0.6)' }} /></Tooltip></span>}
                name="reservePrice"
                rules={[{ required: true, message: "Please enter a reserve price" }]}
                tooltip="Minimum price required to sell the item"
                
              >
                <InputNumber
                  min={0}
                  placeholder="0"
                  className="w-full "
                  formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                />
              </Form.Item>

              <Form.Item
                label={<span className="text-sm font-medium">Minimum Bid Increment (₫) <Tooltip title="Smallest allowed increase for each new bid"><InfoCircleOutlined style={{ marginLeft: 6, color: 'rgba(255,255,255,0.6)' }} /></Tooltip></span>}
                name="minBidIncrement"
                rules={[{ required: true, message: "Please enter minimum bid increment" }]}
                tooltip="Minimum amount the bid should increase each time"
              >
                <InputNumber
                  min={0}
                  placeholder="0"
                  className="w-full"
                  formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                />
              </Form.Item>
            </div>
          </div>

          {/* Advanced Settings */}
          <div className="mb-6">
            <h3 className="text-base font-semibold mb-4 flex items-center gap-2">
              <span>⚙️</span>
              <span>Advanced Settings</span>
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <Form.Item
                label={<span className="text-sm font-medium">Anti-sniping (seconds) <Tooltip title="If a bid arrives within this many seconds before end, the auction end time will extend"><InfoCircleOutlined style={{ marginLeft: 6, color: 'rgba(255,255,255,0.6)' }} /></Tooltip></span>}
                name="antiSnipingSeconds"
                rules={[{ required: true, message: "Please enter anti-sniping time" }]}
                tooltip="Extend auction end time if a bid is placed in the final seconds"
                initialValue={30}
              >
                <InputNumber min={0} max={300} placeholder="30" className="w-full" />
              </Form.Item>

              <Form.Item
                label={<span className="text-sm font-medium">Bid Deposit (%) <Tooltip title="Percent of bid held as deposit to ensure seriousness of bidder"><InfoCircleOutlined style={{ marginLeft: 6, color: 'rgba(255,255,255,0.6)' }} /></Tooltip></span>}
                name="bidDepositPercent"
                rules={[{ required: true, message: "Please enter deposit percent" }]}
                tooltip="Percentage of the bid that must be available as deposit to join the auction"
                initialValue={10}
              >
                <InputNumber min={0} max={100} placeholder="10" className="w-full" />
              </Form.Item>
            </div>
          </div>

          {/* Action Buttons */}
          <Form.Item className="mb-0 mt-8">
            <div className="flex gap-3 justify-end border-t pt-4">
              <Button size="large" onClick={onClose} className="min-w-[120px]">
                Cancel
              </Button>
              <Button
                type="primary"
                size="large"
                htmlType="submit"
                loading={loading}
                className="min-w-[120px] bg-green-600 hover:bg-green-700"
                icon={<CheckCircleOutlined />}
              >
                Approve
              </Button>
            </div>
          </Form.Item>
        </Form>
      </div>
    </Modal>
  )
}
