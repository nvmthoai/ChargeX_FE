import { useState } from "react";
import { Form, Input, InputNumber, message } from "antd";
import { Gavel, FileText, DollarSign, Clock, Percent } from "lucide-react";
import { getUserInfo } from "../../../hooks/useAddress";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

interface AuctionRequestModalProps {
  open: boolean;
  productId: string;
  productTitle: string;
  onClose: () => void;
  onSubmit: any;
}

export default function AuctionRequestModal({
  open,
  productId,
  productTitle,
  onClose,
  onSubmit,
}: AuctionRequestModalProps) {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  const userData = getUserInfo();

  const handleSubmit = async (values: any) => {
    try {
      setLoading(true);

      // Validate user data
      if (!userData?.sub) {
        message.error("Không tìm thấy thông tin người dùng. Vui lòng đăng nhập lại.");
        setLoading(false);
        return;
      }

      // Validate prices
      if (values.reservePrice < values.startingPrice) {
        message.error("Giá dự trữ phải >= giá khởi điểm");
        setLoading(false);
        return;
      }

      // Note: buyNowPrice is optional, but if provided, it should be > reservePrice
      if (values.buyNowPrice !== undefined && values.buyNowPrice !== null && values.buyNowPrice > 0) {
        if (values.buyNowPrice <= values.reservePrice) {
          message.error(`Giá mua ngay (${values.buyNowPrice.toLocaleString()}) phải lớn hơn giá dự trữ (${values.reservePrice.toLocaleString()})`);
          setLoading(false);
          return;
        }
      }

      // Validate deposit: deposit = startingPrice * (bidDepositPercent / 100) must not exceed 5,000,000 VND
      const depositAmount = values.startingPrice * ((values.bidDepositPercent || 0) / 100);
      const MAX_DEPOSIT = 5000000; // 5 triệu VND
      if (depositAmount > MAX_DEPOSIT) {
        message.error(`Số tiền đặt cọc (${depositAmount.toLocaleString()} VND) không được vượt quá 5,000,000 VND. Vui lòng giảm phần trăm đặt cọc hoặc giá khởi điểm.`);
        setLoading(false);
        return;
      }

      const submitData = {
        sellerId: userData.sub,
        productId,
        startingPrice: values.startingPrice,
        reservePrice: values.reservePrice,
        minBidIncrement: values.minBidIncrement,
        antiSnipingSeconds: values.antiSnipingSeconds,
        buyNowPrice: values.buyNowPrice || null,
        bidDepositPercent: values.bidDepositPercent || 0,
        note: values.note,
      };

      const response = await onSubmit(submitData);
      
      if (response) {
        message.success("Yêu cầu đấu giá đã được gửi thành công");
        form.resetFields();
        onClose();
      } else {
        message.warning("Yêu cầu đã được gửi nhưng không nhận được phản hồi");
      }
    } catch (error: any) {
      console.error('Error in handleSubmit:', error);
      const errorMessage = error?.response?.data?.message || error?.message || "Không thể gửi yêu cầu đấu giá";
      message.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(open) => !open && !loading && onClose()}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-ocean-600 to-energy-600 bg-clip-text text-transparent flex items-center gap-2">
            <Gavel className="w-6 h-6 text-ocean-600" />
            Yêu cầu quyền đấu giá
          </DialogTitle>
          <DialogDescription>
            Yêu cầu quyền tạo đấu giá cho sản phẩm của bạn
          </DialogDescription>
        </DialogHeader>

        <div className="p-4 bg-ocean-50 dark:bg-ocean-900/20 rounded-lg mb-4">
          <p className="text-sm text-muted-foreground">
            <span className="font-semibold text-dark-800 dark:text-dark-200">Sản phẩm:</span>{" "}
            <span className="text-dark-700 dark:text-dark-300">{productTitle}</span>
          </p>
        </div>

        <Form form={form} layout="vertical" onFinish={handleSubmit} className="space-y-4">
          {/* Starting Price */}
          <Form.Item
            label={<span className="font-medium text-dark-800 dark:text-dark-200 flex items-center gap-2">
              <DollarSign className="w-4 h-4" />
              Giá khởi điểm
            </span>}
            name="startingPrice"
            rules={[
              { required: true, message: "Giá khởi điểm là bắt buộc" },
              { type: "number", min: 0, message: "Phải >= 0" },
            ]}
          >
            <InputNumber
              placeholder="0"
              className="w-full"
              formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
              parser={(value) => parseFloat(value?.replace(/,/g, '') || '0')}
            />
          </Form.Item>

          {/* Reserve Price */}
          <Form.Item
            label={<span className="font-medium text-dark-800 dark:text-dark-200 flex items-center gap-2">
              <DollarSign className="w-4 h-4" />
              Giá dự trữ (Tối thiểu để bán)
            </span>}
            name="reservePrice"
            rules={[
              { required: true, message: "Giá dự trữ là bắt buộc" },
              { type: "number", min: 0, message: "Phải >= 0" },
            ]}
          >
            <InputNumber
              placeholder="0"
              className="w-full"
              formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
              parser={(value) => parseFloat(value?.replace(/,/g, '') || '0')}
            />
          </Form.Item>

          {/* Min Bid Increment */}
          <Form.Item
            label={<span className="font-medium text-dark-800 dark:text-dark-200 flex items-center gap-2">
              <DollarSign className="w-4 h-4" />
              Bước giá tối thiểu
            </span>}
            name="minBidIncrement"
            initialValue={0}
            rules={[
              { type: "number", min: 0, message: "Phải >= 0" },
            ]}
          >
            <InputNumber
              placeholder="0"
              className="w-full"
              formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
              parser={(value) => parseFloat(value?.replace(/,/g, '') || '0')}
            />
          </Form.Item>

          {/* Anti-Sniping Seconds */}
          <Form.Item
            label={<span className="font-medium text-dark-800 dark:text-dark-200 flex items-center gap-2">
              <Clock className="w-4 h-4" />
              Thời gian chống snipe (Giây)
            </span>}
            name="antiSnipingSeconds"
            initialValue={30}
            rules={[
              { type: "number", min: 0, message: "Phải >= 0" },
            ]}
            tooltip="Gia hạn thời gian đấu giá nếu có đặt giá trong N giây cuối"
          >
            <InputNumber
              placeholder="30"
              className="w-full"
            />
          </Form.Item>

          {/* Buy Now Price */}
          <Form.Item
            label={<span className="font-medium text-dark-800 dark:text-dark-200 flex items-center gap-2">
              <DollarSign className="w-4 h-4" />
              Giá mua ngay (Tùy chọn)
            </span>}
            name="buyNowPrice"
            rules={[
              { type: "number", min: 0, message: "Phải >= 0" },
            ]}
            tooltip="Để trống để tắt tính năng mua ngay"
          >
            <InputNumber
              placeholder="Để trống để tắt"
              className="w-full"
              formatter={(value) => value ? `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',') : ''}
              parser={(value) => parseFloat(value?.replace(/,/g, '') || '0')}
            />
          </Form.Item>

          {/* Bid Deposit Percent */}
          <Form.Item
            label={<span className="font-medium text-dark-800 dark:text-dark-200 flex items-center gap-2">
              <Percent className="w-4 h-4" />
              Phần trăm đặt cọc (0-100)
            </span>}
            name="bidDepositPercent"
            initialValue={10}
            rules={[
              { type: "number", min: 0, max: 100, message: "Phải từ 0 đến 100" },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  const startingPrice = getFieldValue('startingPrice') || 0;
                  const depositAmount = startingPrice * ((value || 0) / 100);
                  const MAX_DEPOSIT = 5000000; // 5 triệu VND
                  if (depositAmount > MAX_DEPOSIT) {
                    return Promise.reject(
                      new Error(`Số tiền đặt cọc (${depositAmount.toLocaleString()} VND) không được vượt quá 5,000,000 VND`)
                    );
                  }
                  return Promise.resolve();
                },
              }),
            ]}
            tooltip="Phần trăm số tiền đặt giá để giữ làm tiền cọc (tối đa 5 triệu VND)"
          >
            <InputNumber
              placeholder="10"
              min={0}
              max={100}
              className="w-full"
            />
          </Form.Item>

          {/* Note */}
          <Form.Item
            label={<span className="font-medium text-dark-800 dark:text-dark-200 flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Ghi chú (Tùy chọn)
            </span>}
            name="note"
            rules={[
              {
                min: 0,
                message: "Note is optional",
              },
            ]}
          >
            <Input.TextArea
              rows={3}
              placeholder="Thêm ghi chú bổ sung cho admin xem xét..."
              className="rounded-lg"
            />
          </Form.Item>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={loading}
              className="w-full sm:w-auto"
            >
              Hủy
            </Button>
            <Form.Item className="mb-0">
              <Button
                type="button"
                disabled={loading}
                className="w-full sm:w-auto gap-2"
                onClick={(e) => { 
                  e.preventDefault();
                  form.validateFields()
                    .then((values) => {
                      handleSubmit(values);
                    })
                    .catch(() => {
                      // Ant Design sẽ tự động hiển thị lỗi validation
                    });
                }}
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Đang gửi...
                  </>
                ) : (
                  <>
                    <Gavel className="w-4 h-4" />
                    Gửi yêu cầu
                  </>
                )}
              </Button>
            </Form.Item>
          </DialogFooter>
        </Form>
      </DialogContent>
    </Dialog>
  );
}