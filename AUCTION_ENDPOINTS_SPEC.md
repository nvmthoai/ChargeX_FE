# Auction Endpoints Specification - Option 3: Separate Endpoints

## Overview
This document outlines the backend endpoints required to make the MyAuctions page work efficiently with proper filtering and payment flow integration.

## Current State
The MyAuctions component currently:
- Fetches all joinable auctions using pagination
- Makes N+1 API calls (1 for list + 1 per auction for winner info)
- Filters auctions client-side
- Tries to determine user participation client-side (inefficient)

## Proposed Backend Endpoints (Option 3)

### 1. Get User's Won Auctions
**Endpoint:** `GET /api/auction/user/:userId/won-auctions`

**Description:** Returns auctions that the user has won, with payment information

**Query Parameters:**
- `page` (optional, default: 1) - Page number for pagination
- `pageSize` (optional, default: 20) - Number of items per page

**Request Example:**
```
GET /api/auction/user/user-123/won-auctions?page=1&pageSize=20
```

**Response:**
```json
{
  "items": [
    {
      "auctionId": "auction-1",
      "productId": "product-1",
      "title": "Tesla Battery 100kWh",
      "status": "ended",
      "startTime": "2024-11-10T10:00:00Z",
      "endTime": "2024-11-11T14:30:00Z",
      "currentPrice": 50000000,
      "minBidIncrement": 1000000,
      "imageUrls": ["https://example.com/image1.jpg"],
      "winnerId": "user-123",
      "orderId": "order-123",
      "userBidCount": 5
    }
  ],
  "meta": {
    "total": 15,
    "page": 1,
    "pageSize": 20
  }
}
```

**HTTP Status:**
- 200 OK: Success
- 401 Unauthorized: User not authenticated
- 500 Internal Server Error: Server error

---

### 2. Get User's Participating Auctions
**Endpoint:** `GET /api/auction/user/:userId/participating-auctions`

**Description:** Returns auctions that the user is currently participating in (live or scheduled)

**Query Parameters:**
- `page` (optional, default: 1) - Page number for pagination
- `pageSize` (optional, default: 20) - Number of items per page

**Request Example:**
```
GET /api/auction/user/user-123/participating-auctions?page=1&pageSize=20
```

**Response:**
```json
{
  "items": [
    {
      "auctionId": "auction-2",
      "productId": "product-2",
      "title": "BMW Battery 80kWh",
      "status": "live",
      "startTime": "2024-11-11T09:00:00Z",
      "endTime": "2024-11-11T18:00:00Z",
      "currentPrice": 45000000,
      "minBidIncrement": 500000,
      "imageUrls": ["https://example.com/image2.jpg"],
      "winnerId": null,
      "userBidCount": 3,
      "userHighestBid": 46000000
    }
  ],
  "meta": {
    "total": 8,
    "page": 1,
    "pageSize": 20
  }
}
```

**HTTP Status:**
- 200 OK: Success
- 401 Unauthorized: User not authenticated
- 500 Internal Server Error: Server error

---

### 3. Get User's Auction History
**Endpoint:** `GET /api/auction/user/:userId/auction-history`

**Description:** Returns all auctions the user participated in (won or lost), including ended auctions

**Query Parameters:**
- `page` (optional, default: 1) - Page number for pagination
- `pageSize` (optional, default: 20) - Number of items per page
- `status` (optional) - Filter by status: 'won', 'lost', 'all'

**Request Example:**
```
GET /api/auction/user/user-123/auction-history?page=1&pageSize=20&status=all
```

**Response:**
```json
{
  "items": [
    {
      "auctionId": "auction-1",
      "productId": "product-1",
      "title": "Tesla Battery 100kWh",
      "status": "ended",
      "startTime": "2024-11-10T10:00:00Z",
      "endTime": "2024-11-11T14:30:00Z",
      "currentPrice": 50000000,
      "minBidIncrement": 1000000,
      "imageUrls": ["https://example.com/image1.jpg"],
      "winnerId": "user-123",
      "userResult": "won",
      "userHighestBid": 50000000,
      "orderId": "order-123"
    },
    {
      "auctionId": "auction-3",
      "productId": "product-3",
      "title": "Audi e-tron Battery 95kWh",
      "status": "ended",
      "startTime": "2024-11-09T10:00:00Z",
      "endTime": "2024-11-10T14:30:00Z",
      "currentPrice": 65000000,
      "minBidIncrement": 2000000,
      "imageUrls": ["https://example.com/image3.jpg"],
      "winnerId": "user-456",
      "userResult": "lost",
      "userHighestBid": 63000000
    }
  ],
  "meta": {
    "total": 23,
    "page": 1,
    "pageSize": 20
  }
}
```

**HTTP Status:**
- 200 OK: Success
- 401 Unauthorized: User not authenticated
- 500 Internal Server Error: Server error

---

## Implementation Notes

### Key Fields Required in Response
- `auctionId`: Unique auction identifier
- `status`: Current status of auction ('live', 'scheduled', 'ended', 'cancelled')
- `currentPrice`: Current highest bid amount
- `minBidIncrement`: Minimum amount for next bid
- `winnerId`: User ID of the winner (null if auction not ended)
- `orderId`: Order ID for payment (only for won auctions, provided by order service)
- `userBidCount`: Number of bids placed by the user
- `userHighestBid`: Highest bid amount placed by the user
- `userResult`: User's result ('won', 'lost', 'participating')

### Performance Considerations
1. **Database Queries**: Use efficient queries to fetch only relevant auctions for the user
2. **Caching**: Consider caching won auctions since they don't change
3. **Eager Loading**: Load orderId data eagerly to avoid N+1 queries
4. **Pagination**: Always paginate to avoid loading too much data

### Error Handling
- Return 401 Unauthorized if user is not authenticated
- Return 404 if user doesn't exist (optional)
- Return 500 with error message if database query fails
- Don't expose internal error details to client

### Integration with Frontend
The MyAuctions component will be updated to:
1. Call the appropriate endpoint based on selected filter
2. Refresh data when filter changes
3. Use orderId directly for payment flow without additional API calls
4. Display proper loading and error states

---

## NestJS Implementation Example

```typescript
// auction.controller.ts

@Controller('auction')
export class AuctionController {
  @Get('user/:userId/won-auctions')
  @UseGuards(AuthGuard())
  async getUserWonAuctions(
    @Param('userId') userId: string,
    @Query('page') page: number = 1,
    @Query('pageSize') pageSize: number = 20,
  ) {
    return this.auctionService.getUserWonAuctions(userId, page, pageSize);
  }

  @Get('user/:userId/participating-auctions')
  @UseGuards(AuthGuard())
  async getUserParticipatingAuctions(
    @Param('userId') userId: string,
    @Query('page') page: number = 1,
    @Query('pageSize') pageSize: number = 20,
  ) {
    return this.auctionService.getUserParticipatingAuctions(userId, page, pageSize);
  }

  @Get('user/:userId/auction-history')
  @UseGuards(AuthGuard())
  async getUserAuctionHistory(
    @Param('userId') userId: string,
    @Query('page') page: number = 1,
    @Query('pageSize') pageSize: number = 20,
    @Query('status') status?: string,
  ) {
    return this.auctionService.getUserAuctionHistory(userId, page, pageSize, status);
  }
}
```

---

## Current API Used (Fallback)
Until these endpoints are implemented, the frontend uses:
- `GET /auction/joinable?page=1&pageSize=50` - Gets all joinable auctions
- `GET /auction/:auctionId` - Gets auction detail (to check winnerId)

This approach is less efficient but functional as a temporary solution.

---

## Timeline
1. **Phase 1 (Current)**: MyAuctions page works with existing API (less efficient)
2. **Phase 2 (Backend ready)**: Implement Option 3 endpoints in backend
3. **Phase 3 (Frontend update)**: Update MyAuctions component to use new endpoints
4. **Phase 4 (Optimization)**: Remove pagination limit and optimize queries

