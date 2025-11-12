"use client"

import type React from "react"
import { useState } from "react"
import { Form, Input, InputNumber, DatePicker, Tooltip } from "antd"
import dayjs from 'dayjs'
import { CheckCircle, Info, Clock, DollarSign, Settings } from "lucide-react"
import type { ApproveAuctionPayload } from "../../../models/auction.model"
import useAuction from "../../../hooks/useAuction"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

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
  
  const disabledDate = (current: any) => {
    return current && current.isBefore(dayjs(), 'day')
  }

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
        startingPrice: values.startingPrice,
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
    <Dialog open={visible} onOpenChange={(open) => !open && !loading && onClose()}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-ocean-400 to-energy-400 bg-clip-text text-transparent flex items-center gap-2">
            <CheckCircle className="w-6 h-6 text-ocean-400" />
            Approve Auction Request
          </DialogTitle>
          <DialogDescription>
            Configure auction settings and approve this request
          </DialogDescription>
        </DialogHeader>

        <Form form={form} layout="vertical" onFinish={handleSubmit} className="space-y-6">
          {/* Request ID */}
          <Card className="border-ocean-800/30 bg-dark-800">
            <CardContent className="pt-6">
              <Form.Item
                label={<span className="font-medium text-dark-200">Auction Request ID</span>}
                className="mb-0"
              >
                <Input disabled value={auctionRequestId} className="font-mono text-sm bg-dark-700 text-dark-200 border-ocean-800" />
              </Form.Item>
            </CardContent>
          </Card>

          {/* Time Settings */}
          <Card className="border-ocean-800/30 bg-dark-800">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Clock className="w-5 h-5 text-ocean-400" />
                Auction Time
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <Form.Item
                  label={<span className="font-medium text-dark-200">Start Time</span>}
                  name="startTime"
                  rules={[{ required: true, message: "Please select a start time" }]}
                >
                  <DatePicker
                    showTime
                    format="DD/MM/YYYY HH:mm:ss"
                    className="w-full bg-dark-700 text-dark-100 border-ocean-800 [&_input]:text-dark-100"
                    placeholder="Select start time"
                    disabledDate={disabledDate}
                    disabledTime={disabledTime}
                  />
                </Form.Item>

                <Form.Item
                  label={<span className="font-medium text-dark-200">End Time</span>}
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
                    className="w-full bg-dark-700 text-dark-100 border-ocean-800 [&_input]:text-dark-100"
                    placeholder="Select end time"
                    disabledDate={disabledDate}
                    disabledTime={disabledTime}
                  />
                </Form.Item>
              </div>
            </CardContent>
          </Card>

          {/* Price Settings */}
          <Card className="border-ocean-800/30 bg-dark-800">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <DollarSign className="w-5 h-5 text-ocean-400" />
                Price Settings
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <Form.Item
                  label={
                    <span className="font-medium text-dark-200 flex items-center gap-1">
                      Starting Price (₫)
                      <Tooltip title="Initial bid amount - customers can't bid lower than this">
                        <Info className="w-4 h-4 text-dark-400" />
                      </Tooltip>
                    </span>
                  }
                  name="startingPrice"
                  rules={[{ required: true, message: "Please enter starting price" }]}
                >
                  <InputNumber
                    min={0}
                    placeholder="0"
                    className="w-full bg-dark-700 text-dark-100 border-ocean-800 [&_input]:text-dark-100"
                    formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                  />
                </Form.Item>

                <Form.Item
                  label={
                    <span className="font-medium text-dark-200 flex items-center gap-1">
                      Reserve Price (₫)
                      <Tooltip title="Minimum price required to sell the item if reserve not met auction won't conclude">
                        <Info className="w-4 h-4 text-dark-400" />
                      </Tooltip>
                    </span>
                  }
                  name="reservePrice"
                  rules={[{ required: true, message: "Please enter a reserve price" }]}
                >
                  <InputNumber
                    min={0}
                    placeholder="0"
                    className="w-full bg-dark-700 text-dark-100 border-ocean-800 [&_input]:text-dark-100"
                    formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                  />
                </Form.Item>

                <Form.Item
                  label={
                    <span className="font-medium text-dark-200 flex items-center gap-1">
                      Minimum Bid Increment (₫)
                      <Tooltip title="Smallest allowed increase for each new bid">
                        <Info className="w-4 h-4 text-dark-400" />
                      </Tooltip>
                    </span>
                  }
                  name="minBidIncrement"
                  rules={[{ required: true, message: "Please enter minimum bid increment" }]}
                >
                  <InputNumber
                    min={0}
                    placeholder="0"
                    className="w-full bg-dark-700 text-dark-100 border-ocean-800 [&_input]:text-dark-100"
                    formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                  />
                </Form.Item>
              </div>
            </CardContent>
          </Card>

          {/* Advanced Settings */}
          <Card className="border-ocean-800/30 bg-dark-800">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Settings className="w-5 h-5 text-ocean-400" />
                Advanced Settings
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <Form.Item
                  label={
                    <span className="font-medium text-dark-200 flex items-center gap-1">
                      Anti-sniping (seconds)
                      <Tooltip title="If a bid arrives within this many seconds before end, the auction end time will extend">
                        <Info className="w-4 h-4 text-dark-400" />
                      </Tooltip>
                    </span>
                  }
                  name="antiSnipingSeconds"
                  rules={[{ required: true, message: "Please enter anti-sniping time" }]}
                  initialValue={30}
                >
                  <InputNumber min={0} max={300} placeholder="30" className="w-full bg-dark-700 text-dark-100 border-ocean-800 [&_input]:text-dark-100" />
                </Form.Item>

                <Form.Item
                  label={
                    <span className="font-medium text-dark-200 flex items-center gap-1">
                      Bid Deposit (%)
                      <Tooltip title="Percent of bid held as deposit to ensure seriousness of bidder">
                        <Info className="w-4 h-4 text-dark-400" />
                      </Tooltip>
                    </span>
                  }
                  name="bidDepositPercent"
                  rules={[{ required: true, message: "Please enter deposit percent" }]}
                  initialValue={10}
                >
                  <InputNumber min={0} max={100} placeholder="10" className="w-full bg-dark-700 text-dark-100 border-ocean-800 [&_input]:text-dark-100" />
                </Form.Item>
              </div>
            </CardContent>
          </Card>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={onClose}
              disabled={loading}
              className="w-full sm:w-auto"
            >
              Cancel
            </Button>
            <Button
              onClick={() => form.submit()}
              disabled={loading}
              className="w-full sm:w-auto gap-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Approving...
                </>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4" />
                  Approve
                </>
              )}
            </Button>
          </DialogFooter>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
