"use client";

import { useState, useMemo } from "react";
import { Search, Eye, Star, AlertCircle, Package } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import ReviewModal from "./ReviewModal";
import type { Order, OrderShop } from "../../../models/order.model";
import useOrder from "../../../hooks/useOrder";
import useReview from "../../../hooks/useReview";
import ReviewListModal from "./ReviewListModal";
import { getUserInfo } from "../../../hooks/useAddress";
import { Link, useNavigate } from "react-router-dom";
import ReportModal from "./ReportModal";
import useDisputes from "../../../hooks/useDisputes";
import { Badge } from "@/components/ui/badge";

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
  pending: "bg-yellow-100 text-yellow-800 border-yellow-300",
  paid: "bg-blue-100 text-blue-800 border-blue-300",
  handed_to_carrier: "bg-cyan-100 text-cyan-800 border-cyan-300",
  in_transit: "bg-purple-100 text-purple-800 border-purple-300",
  delivered_pending_confirm: "bg-orange-100 text-orange-800 border-orange-300",
  delivered: "bg-indigo-100 text-indigo-800 border-indigo-300",
  refunded: "bg-red-100 text-red-800 border-red-300",
  completed: "bg-green-100 text-green-800 border-green-300",
  disputed: "bg-pink-100 text-pink-800 border-pink-300",
  cancelled: "bg-gray-100 text-gray-800 border-gray-300",
};

export default function OrderManagement() {
  const { orders } = useOrder();
  console.log("orders", orders);
  const { handleCreateDisputes } = useDisputes();
  const {
    handleCreateReview,
    fetchMyReviewInEachShop,
    handleDeleteReview,
    handleUpdateReview,
    reviews,
  } = useReview();

  const [searchText, setSearchText] = useState("");
  const [statusFilter, setStatusFilter] = useState<string | undefined>();
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
  const user = getUserInfo();
  const [shopSelected, setShopSelected] = useState<OrderShop | null>(null);
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

  const [reviewListModal, setReviewListModal] = useState<{
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

  const [reportModal, setReportModal] = useState<{
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
  // router navigate for Pay button
  const navigate = useNavigate();

  const filteredOrders = useMemo(() => {
    return orders.filter((order: any) => {
      const matchesSearch = order.orderId
        .toLowerCase()
        .includes(searchText.toLowerCase());
      const matchesStatus = !statusFilter || order.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [orders, searchText, statusFilter]);

  const handleViewReviewsClick = (orderId: string, shopItem: OrderShop) => {
    setShopSelected(shopItem);
    fetchMyReviewInEachShop(user.sub, shopItem.seller.userId);
    setReviewListModal({
      visible: true,
      orderId,
      sellerId: shopItem.seller.userId,
      sellerName: shopItem.seller.fullName,
    });
  };

  const handleCloseReviewList = () => {
    setReviewListModal({ ...reviewListModal, visible: false });
  };

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

  const handleUpdateReviewSuccess = async (id: string, values: any) => {
    const response = await handleUpdateReview(id, values);
    if (response && shopSelected) {
      fetchMyReviewInEachShop(user.sub, shopSelected.seller.userId);
    }
  };

  const handleDeleteReviewSuccess = async (id: string) => {
    const response = await handleDeleteReview(id);
    if (response && shopSelected) {
      fetchMyReviewInEachShop(user.sub, shopSelected.seller.userId);
    }
  };

   const handleReportClick = (orderId: string, shopItem: OrderShop) => {
    setReportModal({
      visible: true,
      orderId,
      sellerId: shopItem.seller.userId,
      sellerName: shopItem.seller.fullName,
    });
  };

  const toggleRow = (orderId: string) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(orderId)) {
      newExpanded.delete(orderId);
    } else {
      newExpanded.add(orderId);
    }
    setExpandedRows(newExpanded);
  };

  const renderExpandedContent = (record: Order) => {
    return (
      <div className="space-y-4 p-4 bg-ocean-50/40 rounded-lg">
        {record.orderShops.map((shop) => (
          <Card
            key={shop.orderShopId}
            className="border-ocean-200/30 shadow-sm bg-white"
          >
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center justify-between text-ocean-700">
                <Link
                  to={`/shop-detail/${shop.seller.userId}`}
                  className="hover:text-ocean-600 transition-colors text-ocean-700"
                >
                  Shop: {shop.seller.fullName}
                </Link>
                {/* <span
                  className={cn(
                    "px-2 py-1 rounded-md text-xs font-semibold border",
                    STATUS_COLORS[shop.status] || STATUS_COLORS.pending
                  )}
                >
                  {shop.status.replace(/_/g, " ")}
                </span> */}
              </CardTitle>
              <p className="text-sm text-muted-foreground">{shop.seller.email}</p>
            </CardHeader>
            <CardContent className="space-y-3">
            {/* Order Items */}
              <div className="space-y-2">
              {shop.orderDetails.map((detail) => (
                <div
                  key={detail.orderDetailId}
                    className="flex gap-3 p-3 bg-gradient-to-br from-white via-ocean-50/30 to-energy-50/20 rounded-lg border border-ocean-200/30"
                >
                  {detail.product.imageUrls?.[0] && (
                      <img
                        src={detail.product.imageUrls[0]}
                      alt={detail.product.title}
                        className="w-16 h-16 object-cover rounded-lg"
                    />
                  )}
                  <div className="flex-1">
                      <p className="font-medium text-sm text-ocean-700">
                        {detail.product.title}
                      </p>
                      <p className="text-xs text-muted-foreground">
                      Qty: {detail.quantity} × ₫
                      {Number.parseFloat(detail.price).toLocaleString()}
                    </p>
                    {detail.product.condition_grade && (
                        <p className="text-xs text-muted-foreground">
                        Condition: {detail.product.condition_grade}
                      </p>
                    )}
                  </div>
                  <div className="text-right align-middle flex flex-col justify-center items-end gap-1">
                      <p className="font-semibold text-energy-600 dark:text-energy-400">
                      ₫{Number.parseFloat(detail.subtotal).toLocaleString()}
                    </p>
                    <Link to={`/orders/${record.orderId}`} className="text-xs text-ocean-600 hover:underline cursor-pointer">
                      View details
                    </Link>
                  </div>
                </div>
              ))}
            </div>

              {/* Actions */}
              <div className="flex flex-wrap items-center gap-2 pt-3 border-t border-ocean-200/30">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleViewReviewsClick(record.orderId, shop)}
                  className="gap-1"
                >
                  <Eye className="w-4 h-4" />
                  View Reviews
                </Button>
                {/* New: View Order Details button */}
                <Button
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(`/orders/${record.orderId}`);
                  }}
                  className="gap-1"
                >
                  <Eye className="w-4 h-4" />
                  View Details
                </Button>
                {record.status === "pending" && (
                  <Button
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/payment?orderId=${record.orderId}`);
                    }}
                    className="gap-1 bg-[#0F74C7] text-white"
                  >
                    Pay
                  </Button>
                )}
                {(record.status === "completed" || record.status === "delivered") && (
                  <>
                    <Button
                      size="sm"
                      onClick={() => handleReviewClick(record.orderId, shop)}
                      className="gap-1"
                    >
                      <Star className="w-4 h-4" />
                      Review Seller
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleReportClick(record.orderId, shop)}
                      className="gap-1"
                    >
                      <AlertCircle className="w-4 h-4" />
                      Create Report
                    </Button>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-ocean-500 to-energy-500 bg-clip-text text-transparent">
          Order History
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          View and manage your order history
        </p>
      </div>

      {/* Filters */}
      <Card className="border-ocean-200/30 shadow-sm bg-white">
        <CardContent className="p-4">
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                type="text"
          placeholder="Search Order ID..."
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
                className="pl-10"
        />
      </div>
            <Select
              value={statusFilter || ""}
              onChange={(e) => setStatusFilter(e.target.value || undefined)}
              className="min-w-[200px]"
            >
              <option value="">All Status</option>
              {ORDER_STATUSES.map((status) => (
                <option key={status} value={status}>
                  {status.replace(/_/g, " ")}
                </option>
              ))}
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Orders Table */}
      <Card className="border-ocean-200/30 shadow-sm bg-white">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-ocean-700">
            <Package className="w-5 h-5 text-ocean-600" />
            Orders ({filteredOrders.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {filteredOrders.length === 0 ? (
            <div className="p-12 text-center">
              <div className="inline-flex flex-col items-center gap-3 text-muted-foreground">
                <div className="w-16 h-16 rounded-full bg-ocean-100 flex items-center justify-center">
                  <Package className="w-8 h-8 text-ocean-500" />
                </div>
                <p className="text-base font-medium">No orders found</p>
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gradient-to-r from-ocean-100/60 to-energy-100/40">
                    <TableHead className="font-semibold text-ocean-800">Order ID</TableHead>
                    <TableHead className="font-semibold text-ocean-800">Buyer</TableHead>
                    <TableHead className="font-semibold text-ocean-800">Shops</TableHead>
                    <TableHead className="font-semibold text-ocean-800">Total Amount</TableHead>
                    <TableHead className="font-semibold text-ocean-800">Status</TableHead>
                    <TableHead className="font-semibold text-ocean-800">Created</TableHead>
                    <TableHead className="font-semibold text-ocean-800">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredOrders.map((order: Order) => (
                    <>
                      <TableRow
                        key={order.orderId}
                        className="hover:bg-ocean-50/50 transition-colors cursor-pointer"
                        onClick={() => toggleRow(order.orderId)}
                      >
                        <TableCell>
                          <span className="text-sm font-mono text-muted-foreground">
                            {order.orderId.slice(0, 12)}...
                          </span>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm font-medium text-ocean-700">
                            {order.buyer.fullName}
                          </span>
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary" className="bg-energy-500 text-white border-0">
                            {order.orderShops.length} {order.orderShops.length === 1 ? 'shop' : 'shops'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <span className="font-semibold text-energy-600">
                            ₫{Number.parseFloat(order.grandTotal).toLocaleString()}
                          </span>
                        </TableCell>
                        <TableCell>
                          <span
                            className={cn(
                              "px-2 py-1 rounded-md text-xs font-semibold border",
                              STATUS_COLORS[order.status] || STATUS_COLORS.pending
                            )}
                          >
                            {order.status.replace(/_/g, " ")}
                          </span>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm text-muted-foreground">
                            {new Date(order.createdAt).toLocaleDateString("vi-VN")}
                          </span>
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleRow(order.orderId);
                            }}
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                      {expandedRows.has(order.orderId) && (
                        <TableRow>
                          <TableCell colSpan={7} className="p-0">
                            {renderExpandedContent(order)}
                          </TableCell>
                        </TableRow>
                      )}
                    </>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modals */}
      <ReviewModal
        visible={reviewModal.visible}
        orderId={reviewModal.orderId}
        sellerId={reviewModal.sellerId}
        sellerName={reviewModal.sellerName}
        onClose={handleCloseReview}
        onSubmit={handleCreateReview || (async () => {})}
      />

      <ReviewListModal
        visible={reviewListModal.visible}
        orderId={reviewListModal.orderId}
        sellerId={reviewListModal.sellerId}
        sellerName={reviewListModal.sellerName}
        onClose={handleCloseReviewList}
        reviews={reviews.filter(
          (r) =>
            r.order.orderId === reviewListModal.orderId &&
            r.reviewee.userId === reviewListModal.sellerId
        )}
        onUpdateReview={handleUpdateReviewSuccess}
        onDeleteReview={handleDeleteReviewSuccess}
      />

      <ReportModal
        visible={reportModal.visible}
        orderId={reportModal.orderId}
        sellerId={reportModal.sellerId}
        sellerName={reportModal.sellerName}
        onClose={() => setReportModal({ ...reportModal, visible: false })}
        onSubmit={handleCreateDisputes || (async () => {})}
      />
    </div>
  );
}
