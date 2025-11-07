"use client";

import { useState, useMemo } from "react";
import { Table, Input, Select, Tag, Button, Image, Badge } from "antd";
import { StarOutlined } from "@ant-design/icons";
import ReviewModal from "./ReviewModal";
import type { Order, OrderShop } from "../../../models/order.model";
import useOrder from "../../../hooks/useOrder";
import useReview from "../../../hooks/useReview";

const ORDER_STATUSES = [
  "pending",
  "paid",
  "handed_to_carrier",
  "in_transit",
  "delivered_pending_confirm",
  "delivered",
  "refunded",
  "completed",
  "disputed",
  "cancelled",
];

const STATUS_COLORS: Record<string, string> = {
  pending: "default",
  paid: "blue",
  handed_to_carrier: "cyan",
  in_transit: "processing",
  delivered_pending_confirm: "warning",
  delivered: "orange",
  refunded: "red",
  completed: "green",
  disputed: "red",
  cancelled: "volcano",
};

export default function OrderManagement() {
  const { orders } = useOrder();
  const { handleCreateReview } = useReview();
  const [searchText, setSearchText] = useState("");
  const [statusFilter, setStatusFilter] = useState<string | undefined>();
  const [reviewModal, setReviewModal] = useState<{
    visible: boolean;
    orderId: string;
    sellerId: string;
    sellerName: string;
  }>({
    visible: false,
    orderId: "",
    sellerId: "",
    sellerName: "",
  });

  const filteredOrders = useMemo(() => {
    return orders.filter((order: any) => {
      const matchesSearch = order.orderId
        .toLowerCase()
        .includes(searchText.toLowerCase());
      const matchesStatus = !statusFilter || order.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [orders, searchText, statusFilter]);

  const handleReviewClick = (orderId: string, shopItem: OrderShop) => {
    setReviewModal({
      visible: true,
      orderId,
      sellerId: shopItem.seller.userId,
      sellerName: shopItem.seller.fullName,
    });
  };

  const handleCloseReview = () => {
    setReviewModal({ ...reviewModal, visible: false });
  };

  const expandedRowRender = (record: Order) => {
    return (
      <div className="space-y-4">
        {record.orderShops.map((shop) => (
          <div
            key={shop.orderShopId}
            className="bg-slate-50 p-4 rounded-lg border border-slate-200"
          >
            <div className="mb-3">
              <h4 className="font-semibold text-slate-900">
                Shop: {shop.seller.fullName}
              </h4>
              <p className="text-sm text-slate-600">{shop.seller.email}</p>
            </div>

            {/* Order Items */}
            <div className="mb-3 space-y-2">
              {shop.orderDetails.map((detail) => (
                <div
                  key={detail.orderDetailId}
                  className="flex gap-3 bg-white p-2 rounded border border-slate-200"
                >
                  {detail.product.imageUrls?.[0] && (
                    <Image
                      src={detail.product.imageUrls[0] || "/placeholder.svg"}
                      width={60}
                      height={60}
                      alt={detail.product.title}
                      className="object-cover rounded"
                    />
                  )}
                  <div className="flex-1">
                    <p className="font-medium text-sm">
                      {detail.product.title}
                    </p>
                    <p className="text-xs text-slate-600">
                      Qty: {detail.quantity} × ₫
                      {Number.parseFloat(detail.price).toLocaleString()}
                    </p>
                    {detail.product.condition_grade && (
                      <p className="text-xs text-slate-600">
                        Condition: {detail.product.condition_grade}
                      </p>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">
                      ₫{Number.parseFloat(detail.subtotal).toLocaleString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Shop Order Status and Actions */}
            <div className="flex justify-between items-center pt-2 border-t border-slate-200">
              <div className="flex gap-2">
                <span className="text-sm text-slate-600">Status:</span>
                <Tag color={STATUS_COLORS[shop.status] || "default"}>
                  {shop.status}
                </Tag>
              </div>
              {record.status === "completed" && (
                <Button
                  type="primary"
                  size="small"
                  icon={<StarOutlined />}
                  onClick={() => handleReviewClick(record.orderId, shop)}
                >
                  Review Seller
                </Button>
              )}
            </div>
          </div>
        ))}
      </div>
    );
  };

  const columns = [
    {
      title: "Order ID",
      dataIndex: "orderId",
      key: "orderId",
      width: 150,
      render: (text: string) => (
        <span className="text-sm font-mono text-slate-700">
          {text.slice(0, 12)}...
        </span>
      ),
    },
    {
      title: "Buyer",
      dataIndex: ["buyer", "fullName"],
      key: "buyer",
      width: 150,
    },
    {
      title: "Shops",
      key: "shops",
      width: 100,
      render: (record: Order) => (
        <Badge
          count={record.orderShops.length}
          style={{ backgroundColor: "#fb8b24" }}
        />
      ),
    },
    {
      title: "Total Amount",
      key: "grandTotal",
      width: 120,
      render: (record: Order) => (
        <span className="font-semibold">
          ₫{Number.parseFloat(record.grandTotal).toLocaleString()}
        </span>
      ),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      width: 140,
      render: (status: string) => (
        <Tag color={STATUS_COLORS[status] || "default"}>{status}</Tag>
      ),
    },
    {
      title: "Created",
      dataIndex: "createdAt",
      key: "createdAt",
      width: 140,
      render: (date: string) => (
        <span className="text-sm">
          {new Date(date).toLocaleDateString("vi-VN")}
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-4 p-4">
      {/* Filters */}
      <div className="flex gap-3 bg-white p-4 rounded-lg shadow-sm border border-slate-200">
        <Input.Search
          placeholder="Search Order ID..."
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          style={{ width: 250 }}
        />
        <Select
          placeholder="Filter by Status"
          value={statusFilter}
          onChange={setStatusFilter}
          style={{ width: 200 }}
          allowClear
          options={ORDER_STATUSES.map((status) => ({
            label: status.replace(/_/g, " "),
            value: status,
          }))}
        />
      </div>

      {/* Table */}
      <Table
        dataSource={filteredOrders}
        columns={columns}
        rowKey="orderId"
        expandable={{
          expandedRowRender,
        }}
        pagination={{
          pageSize: 10,
          showSizeChanger: true,
          pageSizeOptions: ["10", "20", "50"],
        }}
        className="bg-white rounded-lg shadow-sm"
      />

      {/* Review Modal */}
      <ReviewModal
        visible={reviewModal.visible}
        orderId={reviewModal.orderId}
        sellerId={reviewModal.sellerId}
        sellerName={reviewModal.sellerName}
        onClose={handleCloseReview}
        onSubmit={handleCreateReview || (async () => {})}
      />
    </div>
  );
}
