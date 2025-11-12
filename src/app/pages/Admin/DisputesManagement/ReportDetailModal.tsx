"use client";

import type React from "react";
import { Avatar, Image } from "antd";
import { FileText, User, ShoppingBag, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import dayjs from "dayjs";
import type { Report } from "../../../models/dispute.model";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface ReportDetailModalProps {
  visible: boolean;
  report: Report | null;
  onClose: () => void;
  onResolve: (reportId: string) => void;
}

export const ReportDetailModal: React.FC<ReportDetailModalProps> = ({
  visible,
  report,
  onClose,
  onResolve,
}) => {
  if (!report) return null;

  const getTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      refund: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
      damaged: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
      not_received: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400",
      other: "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400",
    };
    return colors[type] || "bg-gray-100 text-gray-800";
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      pending: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400",
      resolved: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
      rejected: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
      refunded: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
    };
    return colors[status] || "bg-gray-100 text-gray-800";
  };

  return (
    <Dialog open={visible} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-ocean-400 to-energy-400 bg-clip-text text-transparent flex items-center gap-2">
            <FileText className="w-6 h-6 text-ocean-400" />
            Report Details
          </DialogTitle>
          <DialogDescription>
            View detailed information about this report
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Report Info */}
          <Card className="border-ocean-800/30 bg-dark-800">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <FileText className="w-5 h-5 text-ocean-400" />
                Report Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-sm text-dark-400 font-medium">Report ID:</span>
                  <p className="text-sm font-mono text-dark-200">{report.id.slice(0, 8)}...</p>
                </div>
                <div>
                  <span className="text-sm text-dark-400 font-medium">Type:</span>
                  <div className="mt-1">
                    <span className={`px-2 py-1 rounded-md text-xs font-medium ${getTypeColor(report.type)}`}>
                      {report.type.toUpperCase()}
                    </span>
                  </div>
                </div>
                <div>
                  <span className="text-sm text-dark-400 font-medium">Status:</span>
                  <div className="mt-1">
                    <span className={`px-2 py-1 rounded-md text-xs font-medium ${getStatusColor(report.status)}`}>
                      {report.status.toUpperCase()}
                    </span>
                  </div>
                </div>
                <div>
                  <span className="text-sm text-dark-400 font-medium">Created:</span>
                  <p className="text-sm text-dark-200">{dayjs(report.createdAt).format("YYYY-MM-DD HH:mm")}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* User Info */}
          <Card className="border-ocean-800/30 bg-dark-800">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <User className="w-5 h-5 text-ocean-400" />
                User Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-3">
                <Avatar src={report.openedBy.image} size={48} />
                <div>
                  <div className="font-medium text-dark-200">{report.openedBy.fullName}</div>
                  <div className="text-sm text-dark-400">
                    {report.openedBy.email}
                  </div>
                  <div className="text-sm text-dark-400">
                    {report.openedBy.phone}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Order Info */}
          <Card className="border-ocean-800/30 bg-dark-800">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <ShoppingBag className="w-5 h-5 text-ocean-400" />
                Order Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-sm text-dark-400 font-medium">Order Status:</span>
                  <p className="text-sm text-dark-200">{report.order.status.toUpperCase()}</p>
                </div>
                <div>
                  <span className="text-sm text-dark-400 font-medium">Receiver Name:</span>
                  <p className="text-sm text-dark-200">{report.order.receiverName}</p>
                </div>
                <div>
                  <span className="text-sm text-dark-400 font-medium">Receiver Phone:</span>
                  <p className="text-sm text-dark-200">{report.order.receiverPhone}</p>
                </div>
                <div>
                  <span className="text-sm text-dark-400 font-medium">Total Price:</span>
                  <p className="text-sm text-dark-200">₫{Number.parseFloat(report.order.totalPrice).toLocaleString()}</p>
                </div>
                <div>
                  <span className="text-sm text-dark-400 font-medium">Shipping Fee:</span>
                  <p className="text-sm text-dark-200">₫{Number.parseFloat(report.order.totalShippingFee).toLocaleString()}</p>
                </div>
                <div>
                  <span className="text-sm text-dark-400 font-medium">Grand Total:</span>
                  <p className="text-sm font-semibold text-energy-400">₫{Number.parseFloat(report.order.grandTotal).toLocaleString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Messages */}
          <Card className="border-ocean-800/30 bg-dark-800">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <MessageSquare className="w-5 h-5 text-ocean-400" />
                Messages
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {report.messages.map((msg) => (
                  <div key={msg.id} className="border border-ocean-800/30 rounded-lg p-4 bg-dark-700">
                    {msg.sender && (
                      <div className="flex items-center gap-2 mb-2">
                        <Avatar src={msg.sender.image} size={24} />
                        <span className="font-medium text-sm text-dark-200">
                          {msg.sender.fullName}
                        </span>
                        <span className="text-dark-400 text-xs">
                          {dayjs(msg.createdAt).format("HH:mm DD/MM")}
                        </span>
                      </div>
                    )}
                    <p className="text-sm text-dark-200 mb-2">{msg.body}</p>
                    {msg.attachments && (
                      <Image
                        src={msg.attachments || "/placeholder.svg"}
                        alt="Attachment"
                        width={200}
                        className="rounded"
                        preview={{ mask: "View" }}
                      />
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            variant="outline"
            onClick={onClose}
            className="w-full sm:w-auto"
          >
            Close
          </Button>
          {report.status === "pending" && (
            <Button
              onClick={() => onResolve(report.id)}
              className="w-full sm:w-auto"
            >
              Resolve Report
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
