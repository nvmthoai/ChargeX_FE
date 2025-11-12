"use client"

import { Form, InputNumber, DatePicker } from "antd"
import { useState } from "react"
import { Radio, Clock, DollarSign, Settings } from "lucide-react"
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

interface GoLiveModalProps {
  visible: boolean
  onCancel: () => void
  onSubmit: (data: any) => Promise<void>
  auctionId: string
  loading: boolean
}

export const GoLiveModal = ({ visible, onCancel, onSubmit, auctionId, loading }: GoLiveModalProps) => {
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
    <Dialog open={visible} onOpenChange={(open) => !open && !submitting && onCancel()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-ocean-400 to-energy-400 bg-clip-text text-transparent flex items-center gap-2">
            <Radio className="w-6 h-6 text-ocean-400" />
            Go Live
          </DialogTitle>
          <DialogDescription>
            Configure settings to make this auction live
          </DialogDescription>
        </DialogHeader>

        <Form form={form} layout="vertical" onFinish={handleSubmit} className="space-y-6">
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
                  rules={[{ required: true, message: "Please select start time" }]}
                >
                  <DatePicker
                    showTime
                    className="w-full bg-dark-700 text-dark-100 border-ocean-800 [&_input]:text-dark-100"
                    placeholder="Select start time"
                  />
                </Form.Item>

                <Form.Item
                  label={<span className="font-medium text-dark-200">End Time</span>}
                  name="endTime"
                  rules={[{ required: true, message: "Please select end time" }]}
                >
                  <DatePicker
                    showTime
                    className="w-full bg-dark-700 text-dark-100 border-ocean-800 [&_input]:text-dark-100"
                    placeholder="Select end time"
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
                  label={<span className="font-medium text-dark-200">Reserve Price</span>}
                  name="reservePrice"
                  rules={[{ required: true, message: "Please enter reserve price" }]}
                >
                  <InputNumber
                    className="w-full bg-dark-700 text-dark-100 border-ocean-800 [&_input]:text-dark-100"
                    placeholder="0"
                  />
                </Form.Item>

                <Form.Item
                  label={<span className="font-medium text-dark-200">Min Bid Increment</span>}
                  name="minBidIncrement"
                  rules={[{ required: true, message: "Please enter min bid increment" }]}
                >
                  <InputNumber
                    className="w-full bg-dark-700 text-dark-100 border-ocean-800 [&_input]:text-dark-100"
                    placeholder="0"
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
                  label={<span className="font-medium text-dark-200">Anti Sniping Seconds</span>}
                  name="antiSnipingSeconds"
                  rules={[{ required: true, message: "Please enter anti sniping seconds" }]}
                >
                  <InputNumber
                    className="w-full bg-dark-700 text-dark-100 border-ocean-800 [&_input]:text-dark-100"
                    placeholder="30"
                  />
                </Form.Item>

                <Form.Item
                  label={<span className="font-medium text-dark-200">Bid Deposit Percent</span>}
                  name="bidDepositPercent"
                  rules={[{ required: true, message: "Please enter bid deposit percent" }]}
                >
                  <InputNumber
                    className="w-full bg-dark-700 text-dark-100 border-ocean-800 [&_input]:text-dark-100"
                    placeholder="10"
                  />
                </Form.Item>
              </div>
            </CardContent>
          </Card>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={onCancel}
              disabled={submitting || loading}
              className="w-full sm:w-auto"
            >
              Cancel
            </Button>
            <Button
              onClick={() => form.submit()}
              disabled={submitting || loading}
              className="w-full sm:w-auto gap-2"
            >
              {submitting || loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Radio className="w-4 h-4" />
                  Go Live
                </>
              )}
            </Button>
          </DialogFooter>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
