import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../../hooks/AuthContext';
import { notificationSocket } from '../../../services/notificationSocket';
import axiosInstance from '../../config/axios';
import type { Notification } from '../../../types/notification';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

export default function NotificationBell() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showDropdown, setShowDropdown] = useState(false);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Fetch notifications from API
  const fetchNotifications = async () => {
    if (!user?.sub) return;
    
    try {
      setLoading(true);
      const response = await axiosInstance.get('/notifications');
      setNotifications(response.data || []);
      
      // Fetch unread count
      const countResponse = await axiosInstance.get('/notifications/unread-count');
      setUnreadCount(countResponse.data?.count || 0);
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  // Connect to WebSocket and listen for notifications
  useEffect(() => {
    if (!user?.sub) return;

    // Connect to notification socket
    notificationSocket.connect(user.sub);

    // Listen for new notifications
    const handleNotification = (notification: Record<string, unknown>) => {
      console.log('🔔 New notification:', notification);
      
      // Add to list
      setNotifications((prev) => [notification as unknown as Notification, ...prev]);
      setUnreadCount((prev) => prev + 1);
      
      // Show toast; for auction_won make the toast content clickable to navigate to payment
      const nType = notification.type as string;
      const orderId = (notification as unknown as any)?.data?.orderId;
      if (nType === 'auction_won' && orderId) {
        toast((t) => (
          <div
            onClick={() => {
              try {
                navigate(`/payment?orderId=${orderId}`);
              } catch (e) {
                console.warn('Navigation failed for notification click', e);
              }
              toast.dismiss(t.id);
            }}
            style={{ cursor: 'pointer' }}
          >
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <span>{getNotificationIcon(nType)}</span>
              <div>
                <div style={{ fontWeight: 600 }}>{String(notification.title)}</div>
                <div style={{ fontSize: 12, color: '#666' }}>{String((notification as any).message || '')}</div>
              </div>
            </div>
          </div>
        ), { duration: 7000, icon: getNotificationIcon(nType) });
      } else {
        toast.success(notification.title as string, {
          duration: 5000,
          icon: getNotificationIcon(nType),
        });
      }
       
      // Play sound (optional)
      playNotificationSound();
    };

    notificationSocket.onNotification(handleNotification);

    // Fetch initial notifications
    fetchNotifications();

    return () => {
      notificationSocket.offNotification(handleNotification);
    };
  }, [user?.sub]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'auction_won':
        return '🎉';
      case 'auction_lost':
        return '😔';
      case 'auction_success':
        return '✅';
      case 'auction_failed':
        return '❌';
      case 'bid_outbid':
        return '⚠️';
      default:
        return '🔔';
    }
  };

  const playNotificationSound = () => {
    try {
      const audio = new Audio('/notification-sound.mp3');
      audio.volume = 0.5;
      audio.play().catch(() => {
        // Ignore autoplay errors
      });
    } catch (error) {
      console.error('Failed to play notification sound:', error);
    }
  };

  const markAsRead = async (notificationId: string) => {
    try {
      await axiosInstance.patch(`/notifications/${notificationId}/read`);
      setNotifications((prev) =>
        prev.map((n) => (n.id === notificationId ? { ...n, isRead: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Failed to mark as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await axiosInstance.patch('/notifications/read-all');
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
      toast.success('Đã đánh dấu tất cả là đã đọc');
    } catch (error) {
      console.error('Failed to mark all as read:', error);
    }
  };

  const deleteNotification = async (notificationId: string) => {
    try {
      await axiosInstance.delete(`/notifications/${notificationId}`);
      setNotifications((prev) => prev.filter((n) => n.id !== notificationId));
      toast.success('Đã xóa thông báo');
    } catch (error) {
      console.error('Failed to delete notification:', error);
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Vừa xong';
    if (diffMins < 60) return `${diffMins} phút trước`;
    if (diffHours < 24) return `${diffHours} giờ trước`;
    if (diffDays < 7) return `${diffDays} ngày trước`;
    return date.toLocaleDateString('vi-VN');
  };

  if (!user) return null;

  return (
    <div className="notification-bell-container" ref={dropdownRef}>
      <button
        className="notification-bell-button"
        onClick={() => setShowDropdown(!showDropdown)}
        aria-label="Notifications"
      >
        <span className="bell-icon">🔔</span>
        {unreadCount > 0 && (
          <span className="unread-badge">{unreadCount > 99 ? '99+' : unreadCount}</span>
        )}
      </button>

      {showDropdown && (
        <div className="notification-dropdown">
          <div className="notification-header">
            <h3>Thông báo</h3>
            {unreadCount > 0 && (
              <button className="mark-all-read-btn" onClick={markAllAsRead}>
                Đánh dấu tất cả đã đọc
              </button>
            )}
          </div>

          <div className="notification-list">
            {loading ? (
              <div className="notification-loading">Đang tải...</div>
            ) : notifications.length === 0 ? (
              <div className="notification-empty">
                <span className="empty-icon">📭</span>
                <p>Không có thông báo nào</p>
              </div>
            ) : (
              notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`notification-item ${!notification.isRead ? 'unread' : ''}`}
                  onClick={() => !notification.isRead && markAsRead(notification.id)}
                >
                  <div className="notification-icon">
                    {getNotificationIcon(notification.type)}
                  </div>
                  <div className="notification-content">
                    <h4 className="notification-title">{notification.title}</h4>
                    <p className="notification-message">{notification.message}</p>
                    <span className="notification-time">
                      {formatTimeAgo(notification.createdAt)}
                    </span>
                  </div>
                  <button
                    className="notification-delete-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteNotification(notification.id);
                    }}
                    aria-label="Delete"
                  >
                    ✕
                  </button>
                </div>
              ))
            )}
          </div>

          {notifications.length > 0 && (
            <div className="notification-footer">
              <button className="view-all-btn" onClick={() => setShowDropdown(false)}>
                Xem tất cả thông báo
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
