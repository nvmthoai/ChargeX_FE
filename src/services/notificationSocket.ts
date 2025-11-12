import { io, Socket } from 'socket.io-client';
import ENV from '../app/config/env';

class NotificationSocket {
  private socket: Socket | null = null;
  private userId: string | null = null;

  connect(userId: string) {
    // backward compatible: read token and call connectWithToken
    const token = localStorage.getItem('token');
    return this.connectWithToken(userId, token || null);
  }

  connectWithToken(userId: string, token: string | null) {
    if (this.socket?.connected && this.userId === userId) {
      console.log('✅ Already connected to notification socket');
      return this.socket;
    }

    // Disconnect existing connection if user changed
    if (this.socket) {
      this.socket.disconnect();
    }

    this.userId = userId;
    // Connect to notifications namespace at SOCKET_URL (origin) to avoid mixing API path
    this.socket = io(`${ENV.SOCKET_URL}/notifications`, {
      path: '/socket.io',
      transports: ['websocket', 'polling'],
      query: { userId },
      auth: token ? { token } : undefined,
      autoConnect: true,
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5,
    });

    this.socket.on('connect', () => {
      console.log('🔔 Connected to notification server');
      this.socket?.emit('subscribe', userId);
    });

    this.socket.on('disconnect', () => {
      console.log('🔴 Disconnected from notification server');
    });

    this.socket.on('error', (error) => {
      console.error('❌ Notification socket error:', error);
    });

    return this.socket;
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.userId = null;
      console.log('🔌 Notification socket disconnected');
    }
  }

  onNotification(callback: (notification: Record<string, unknown>) => void) {
    if (!this.socket) {
      console.warn('⚠️ Socket not connected');
      return;
    }
    this.socket.on('notification', callback);
  }

  offNotification(callback: (notification: Record<string, unknown>) => void) {
    if (!this.socket) return;
    this.socket.off('notification', callback);
  }

  getSocket() {
    return this.socket;
  }
}

export const notificationSocket = new NotificationSocket();
