import { io, Socket } from "socket.io-client";

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || "https://chargex.id.vn";

export interface AuctionState {
  auctionId: string;
  status: string;
  currentPrice: number;
  endTime: string;
  winnerId: string | null;
  bidCount: number;
}

export interface PriceUpdate {
  currentPrice: number;
  endTime: string;
  bidId: string;
  winnerId: string;
}

export interface PlaceBidPayload {
  auctionId: string;
  amount: number;
  clientBidId?: string;
}

export interface AuctionError {
  message: string;
}

export class AuctionSocketService {
  private socket: Socket | null = null;
  private userId: string | null = null;

  connect(userId?: string) {
    if (this.socket?.connected) {
      return this.socket;
    }

    this.userId = userId || null;

    this.socket = io(`${SOCKET_URL}/auctions`, {
      path: "/socket.io/",
      transports: ["websocket", "polling"],
      auth: {
        userId: this.userId,
      },
      query: {
        userId: this.userId,
      },
    });

    this.socket.on("connect", () => {
      console.log("[Socket] Connected:", this.socket?.id);
    });

    this.socket.on("disconnect", () => {
      console.log("[Socket] Disconnected");
    });

    this.socket.on("connect_error", (error: Error) => {
      console.error("[Socket] Connection error:", error);
    });

    return this.socket;
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  isConnected(): boolean {
    return this.socket?.connected || false;
  }

  // Join auction room
  joinAuction(auctionId: string) {
    if (!this.socket?.connected) {
      throw new Error("Socket not connected");
    }
    this.socket.emit("auction:join", { auctionId });
  }

  // Leave auction room
  leaveAuction(auctionId: string) {
    if (!this.socket?.connected) {
      throw new Error("Socket not connected");
    }
    this.socket.emit("auction:leave", { auctionId });
  }

  // Place a bid
  placeBid(payload: PlaceBidPayload) {
    if (!this.socket?.connected) {
      throw new Error("Socket not connected");
    }
    this.socket.emit("auction:place_bid", payload);
  }

  // Listen for auction state
  onAuctionState(callback: (state: AuctionState) => void) {
    if (!this.socket) return;
    this.socket.on("auction:state", callback);
  }

  // Listen for price updates
  onPriceUpdate(callback: (update: PriceUpdate) => void) {
    if (!this.socket) return;
    this.socket.on("auction:price_update", callback);
  }

  // Listen for auction extended
  onAuctionExtended(callback: (data: { endTime: string }) => void) {
    if (!this.socket) return;
    this.socket.on("auction:extended", callback);
  }

  // Listen for errors
  onError(callback: (error: AuctionError) => void) {
    if (!this.socket) return;
    this.socket.on("auction:error", callback);
  }

  // Remove listeners
  off(event: string, callback?: (...args: any[]) => void) {
    if (!this.socket) return;
    this.socket.off(event, callback);
  }

  // Remove all listeners
  removeAllListeners() {
    if (!this.socket) return;
    this.socket.removeAllListeners();
  }
}

// Singleton instance
export const auctionSocket = new AuctionSocketService();
