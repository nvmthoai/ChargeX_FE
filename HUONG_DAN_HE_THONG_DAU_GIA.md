# ChargeX - Hướng Dẫn Hệ Thống Đấu Giá

## Tổng Quan

Đây là hướng dẫn chi tiết về các tính năng mới và sửa lỗi của hệ thống đấu giá ChargeX, bao gồm quản lý tiền đặt cọc (escrow), phí platform, và theo dõi trạng thái đơn hàng.

---

## Mục Lục

1. [Các Lỗi Được Sửa](#các-lỗi-được-sửa)
2. [Phí Platform](#phí-platform)
3. [Theo Dõi Trạng Thái Đơn Hàng](#theo-dõi-trạng-thái-đơn-hàng)
4. [Hướng Dẫn Sử Dụng Frontend](#hướng-dẫn-sử-dụng-frontend)
5. [API Endpoints](#api-endpoints)
6. [Ví Dụ Thực Tế](#ví-dụ-thực-tế)

---

## Các Lỗi Được Sửa

### 1. Logic Tiền Đặt Cọc (Commit: 3abf4bd)

**Vấn đề:** Tiền đặt cọc bị trừ từ ví nhưng không có bản ghi EscrowHold, dẫn đến mất tiền vĩnh viễn.

**Giải pháp:**
- Tạo bản ghi `EscrowHold` khi đặt cọc
- Tự động hoàn tiền khi bị vượt giá
- Theo dõi vòng đời của tiền giữ

**Ảnh hưởng:** Tiền đặt cọc giờ được lưu giữ an toàn trong escrow.

---

### 2. Kiểm Tra Giá Dự Trữ (Commit: 3abf4bd)

**Vấn đề:** Đơn hàng được tạo trước khi kiểm tra giá dự trữ, buộc phải bán dưới giá tối thiểu.

**Giải pháp:**
- Chuyển kiểm tra giá dự trữ trước khi tạo đơn hàng
- Chỉ tạo đơn hàng khi `reserveMet === true`
- Đánh dấu sản phẩm là "sold" chỉ khi tạo được đơn hàng

**Ảnh hưởng:** Không còn buộc bán dưới giá tối thiểu; seller có quyền kiểm soát giá.

---

### 3. Ngăn Tái Đấu Giá Sản Phẩm (Commit: 3abf4bd)

**Vấn đề:** Sản phẩm đã bán vẫn có thể được đấu giá lại, tạo ra các cuộc đấu giá trùng lặp.

**Giải pháp:**
- Thêm kiểm tra trạng thái sản phẩm trong `requestAuction()`
- Từ chối yêu cầu đấu giá cho sản phẩm đã bán

**Ảnh hưởng:** Sản phẩm không thể tái đấu giá sau khi đã bán.

---

## Phí Platform

### Tổng Quan

Platform thu phí 10% từ tất cả các đơn hàng hoàn thành. Phí được tính toán, trừ từ tiền payout của seller, và được lưu vào hệ thống.

### Chi Tiết Triển Khai (Commit: 47e1621)

**File:** `wallet.service.ts` - method `releaseOrderToSeller()` (Lines 540-570)

**Cách hoạt động:**
```typescript
// Giá trị đơn hàng: $100
const totalAmount = 100

// Tính phí 10%
const platformFee = 100 * 0.1 = $10

// Seller nhận
const sellerAmount = 100 - 10 = $90
```

### Ví Dụ

Nếu một cuộc đấu giá bán được **$100**:
- **Phí Platform (10%):** $10
- **Seller Nhận:** $90

### Theo Dõi Phí

- Phí được lưu trong bảng `payments` với `type: 'platform_fee'`
- Có thể truy vấn và báo cáo cho dashboard admin
- Có thể xem trong lịch sử thanh toán với chi tiết logging

---

## Theo Dõi Trạng Thái Đơn Hàng

### Tổng Quan

Đơn hàng giờ có theo dõi vòng đời hoàn chỉnh với các bản ghi `OrderEvent` được tạo ở mỗi bước thay đổi trạng thái.

### Quy Trình Trạng Thái

```
PENDING (Đang chờ)
  ↓ (Thanh toán hoàn tất)
PAID (Đã thanh toán)
  ↓ (Seller gửi hàng)
DELIVERED (Đã giao)
  ↓ (Buyer xác nhận nhận)
COMPLETED (Hoàn thành)
```

### Chi Tiết Triển Khai (Commit: 188d16c)

**File:** `order.service.ts`

#### 1. Đánh Dấu Đã Thanh Toán

Khi payment hoàn tất:
```typescript
// Tự động gọi để tạo OrderEvent
markAsPaid(orderId, currentUser)
```

#### 2. Đánh Dấu Đã Giao

Khi seller xác nhận đã giao:
```typescript
// Seller gọi để cập nhật trạng thái
markAsDelivered(orderId, note)
```

#### 3. Đánh Dấu Hoàn Thành

Khi buyer xác nhận nhận được:
```typescript
// Buyer gọi để xác nhận
markAsCompleted(orderId, note)
```

---

## Hướng Dẫn Sử Dụng Frontend

### API Methods

#### Import

```typescript
import {
  getOrderById,
  updateOrder,
  markOrderAsDelivered,
  markOrderAsCompleted,
} from "../../../api/order/api"
```

#### Gọi Delivery API

```typescript
const updatedOrder = await markOrderAsDelivered(
  orderId,
  "Gói hàng được giao thành công"
)
```

#### Gọi Completion API

```typescript
const updatedOrder = await markOrderAsCompleted(
  orderId,
  "Đơn hàng hoàn thành - buyer xác nhận nhận"
)
```

### Components

#### OrderStatusActions Component

**Vị trí:** `src/app/pages/Order/component/OrderStatusActions.tsx`

**Tính năng:**
- Hiển thị các action khả dụng dựa trên trạng thái đơn hàng
- Modal xác nhận action
- Trường ghi chú tùy chọn
- Tự động ẩn các action không khả dụng

**Cách sử dụng:**
```tsx
<OrderStatusActions
  order={order}
  role={role}        // "buyer" | "seller"
  onStatusChange={handleAction}
  loading={loading}
/>
```

**Các Action Khả Dụng:**

- **Seller (Khi đơn hàng là PAID):**
  - "Đánh Dấu Đã Giao" → Gọi `markOrderAsDelivered()`

- **Buyer (Khi đơn hàng là DELIVERED):**
  - "Xác Nhận Nhận" → Gọi `markOrderAsCompleted()`

#### PlatformFeeStats Dashboard

**Vị trí:** `src/app/pages/Admin/components/PlatformFeeStats.tsx`

**Hiển Thị:**
- Tổng số đơn hàng xử lý
- Số đơn hàng đã hoàn thành
- Giá trị đơn hàng gộp
- Phí platform thu được
- Bảng tính chi tiết (chia 90/10)

---

## API Endpoints

### Backend Endpoints (ChargeX_BE)

#### 1. Đánh Dấu Đã Giao

```
PATCH /orders/:orderId/mark-as-delivered
Content-Type: application/json

Request Body:
{
  "note": "Gói hàng được giao thành công"  // optional
}

Response: Order object với status = DELIVERED
```

#### 2. Đánh Dấu Hoàn Thành

```
PATCH /orders/:orderId/mark-as-completed
Content-Type: application/json

Request Body:
{
  "note": "Nhận được, rất hài lòng với sản phẩm"  // optional
}

Response: Order object với status = COMPLETED
```

#### 3. Lấy Lịch Sự Kiện Đơn Hàng

```
GET /order-events?orderId=:orderId

Response: Mảng các bản ghi OrderEvent
```

---

## Ví Dụ Thực Tế

### Ví Dụ 1: Quy Trình Đơn Hàng Hoàn Chỉnh

```typescript
// Bước 1: Thanh toán hoàn tất - Đơn hàng trở thành PAID
await markAsPaid(orderId, user)

// Bước 2: Seller gửi hàng - Đơn hàng trở thành DELIVERED
await markOrderAsDelivered(orderId, "Gói hàng gửi đi qua carrier")

// Bước 3: Buyer nhận và xác nhận - Đơn hàng trở thành COMPLETED
await markOrderAsCompleted(orderId, "Nhận được, tất cả ổn")

// Xem lịch sử
const events = await getOrderEventsByOrderId(orderId)
// Hiển thị timeline tất cả các thay đổi trạng thái
```

### Ví Dụ 2: Kiểm Tra Phí Platform

```typescript
// Lấy chi tiết đơn hàng
const order = await getOrderById(orderId)

// Nếu đơn hàng = $100
// Phí platform = $10 (10%)
// Seller nhận = $90

// Xem bản ghi payment chứa phí
const payments = await fetch(`/payments?relatedOrderId=${orderId}`)

// Kết quả bao gồm:
// {
//   walletId: "seller-wallet-id",
//   type: "platform_fee",
//   amount: "10.00",
//   relatedOrderId: orderId
// }
```

### Ví Dụ 3: Bảng Điều Khiển Admin

```typescript
// Hiển thị thống kê doanh thu platform
const stats = {
  totalOrders: 150,
  completedOrders: 145,
  totalGrossValue: 5000.00,
  platformFeeCollected: 500.00,
  platformFeePercent: 10
}

<PlatformFeeStats stats={stats} loading={false} />
```

---

## Tính Năng Chính

| Tính Năng | Trạng Thái | Vị Trí |
|-----------|-----------|--------|
| Tạo Escrow Hold | ✅ Hoàn Thành | auction.service.ts:600-607 |
| Kiểm Tra Giá Dự Trữ | ✅ Hoàn Thành | auction.service.ts:772 |
| Ngăn Tái Đấu Giá | ✅ Hoàn Thành | auction.service.ts:38-41 |
| Trừ Phí Platform | ✅ Hoàn Thành | wallet.service.ts:540-570 |
| Theo Dõi Vòng Đời Đơn Hàng | ✅ Hoàn Thành | order.service.ts:217-284 |
| API Endpoint Giao Hàng | ✅ Hoàn Thành | order.controller.ts:189-227 |
| API Endpoint Hoàn Thành | ✅ Hoàn Thành | order.controller.ts:232-274 |
| Component Status Actions | ✅ Hoàn Thành | OrderStatusActions.tsx |
| Dashboard Phí | ✅ Hoàn Thành | PlatformFeeStats.tsx |

---

## Danh Sách Kiểm Tra Triển Khai

- [x] Backend build thành công
- [x] Frontend build thành công
- [x] Tất cả API endpoints được test
- [x] Database migrations áp dụng
- [x] Frontend components tích hợp
- [x] Git commits push lên GitHub

---

## Các Bước Tiếp Theo (Tùy Chọn)

1. **Hệ Thống Thông Báo:** Gửi thông báo khi đơn hàng thay đổi trạng thái
2. **Dashboard Seller:** Hiển thị số tiền giữ và phí trừ trong bảng điều khiển seller
3. **Lịch Sử Đơn Hàng:** Hiển thị bản ghi OrderEvent trong chi tiết đơn hàng
4. **Phân Tích:** Tạo báo cáo admin cho theo dõi doanh thu
5. **Webhooks:** Tích hợp với các nhà cung cấp vận chuyển để tự động cập nhật trạng thái giao hàng

---

## Hỗ Trợ

Để biết thêm chi tiết, hãy xem:
- **Hướng Dẫn Backend:** `ChargeX_BE/AUCTION_SYSTEM_IMPLEMENTATION.md`
- **Commit Messages:** Xem lịch sử git để có giải thích chi tiết
- **Swagger API:** Truy cập `/api/docs` (nếu Swagger được bật)

---

**Ngày Cập Nhật:** 15 tháng 11 năm 2025
**Trạng Thái:** ✅ Hoàn Thành và Sẵn Sàng Sản Xuất
**Tất Cả Commits:** Đã Push lên GitHub
