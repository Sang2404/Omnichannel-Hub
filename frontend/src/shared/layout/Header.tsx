import React, { useState, useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import type { RootState } from '../../app/store';
import { logout } from '../../features/auth/authSlice';
import {
  notificationApi,
  type NotificationItem,
} from '../../features/notification/services/notificationApi';
import {
  Search,
  Bell,
  LogOut,
  Command,
  CheckCircle2,
  AlertTriangle,
  ShieldCheck,
  MessageSquare,
  Package,
  RefreshCw,
  Truck,
  Check,
} from 'lucide-react';

function formatRelativeTime(dateString: string): string {
  try {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHour = Math.floor(diffMin / 60);
    const diffDay = Math.floor(diffHour / 24);

    if (diffSec < 60) return 'Vừa xong';
    if (diffMin < 60) return `${diffMin} phút trước`;
    if (diffHour < 24) return `${diffHour} giờ trước`;
    if (diffDay < 7) return `${diffDay} ngày trước`;
    return date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' });
  } catch {
    return 'Gần đây';
  }
}

export const Header: React.FC<{ onOpenCommandPalette: () => void }> = ({ onOpenCommandPalette }) => {
  const { user } = useSelector((state: RootState) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [showNotifications, setShowNotifications] = useState(false);
  const [activeTab, setActiveTab] = useState<'all' | 'unread'>('all');
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const fetchNotifications = useCallback(async () => {
    try {
      const data = await notificationApi.getNotifications(20);
      setNotifications(data.notifications || []);
      setUnreadCount(data.unreadCount || 0);
    } catch {
      // Non-blocking fallback
    }
  }, []);

  // Initial load and periodic polling every 15 seconds
  useEffect(() => {
    fetchNotifications();
    const timer = setInterval(fetchNotifications, 15000);
    return () => clearInterval(timer);
  }, [fetchNotifications]);

  // Refetch whenever popover opens
  useEffect(() => {
    if (showNotifications) {
      fetchNotifications();
    }
  }, [showNotifications, fetchNotifications]);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  const handleMarkAllAsRead = async () => {
    try {
      await notificationApi.markAllAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch {
      // Failed to mark all
    }
  };

  const handleNotificationClick = async (item: NotificationItem) => {
    if (!item.isRead) {
      try {
        await notificationApi.markAsRead(item.id);
        setNotifications((prev) =>
          prev.map((n) => (n.id === item.id ? { ...n, isRead: true } : n))
        );
        setUnreadCount((prev) => Math.max(0, prev - 1));
      } catch {
        // Fallback
      }
    }

    if (item.link) {
      navigate(item.link);
      setShowNotifications(false);
    }
  };

  const filteredNotifications = notifications.filter((n) =>
    activeTab === 'unread' ? !n.isRead : true
  );

  return (
    <header className="h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between sticky top-0 z-30 shadow-xs">
      {/* Search / Command Palette Trigger */}
      <button
        onClick={onOpenCommandPalette}
        className="flex items-center gap-3 px-3.5 py-2 bg-slate-50 hover:bg-slate-100 border border-slate-300 rounded-lg text-slate-500 text-sm transition-colors w-80"
      >
        <Search className="h-4 w-4 text-slate-400 shrink-0" />
        <span className="flex-1 text-left truncate">Tìm đơn hàng, khách hàng, SKU...</span>
        <kbd className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 bg-white border border-slate-300 rounded text-xs text-slate-500 font-mono shadow-xs">
          <Command className="h-3 w-3" /> K
        </kbd>
      </button>

      {/* Header Right Actions */}
      <div className="flex items-center gap-3.5">
        {/* Dedicated Notification Center */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-2.5 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-300 text-slate-600 transition-colors relative"
            title="Thông báo"
          >
            <Bell className="h-4.5 w-4.5 text-slate-600" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-red-600 text-white text-xs font-bold flex items-center justify-center animate-pulse">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          {/* Notifications Dropdown Panel */}
          {showNotifications && (
            <div className="absolute right-0 mt-2 w-[420px] bg-white border border-slate-200 rounded-xl shadow-2xl p-4 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-2.5">
                <div className="flex items-center gap-2">
                  <Bell className="h-4.5 w-4.5 text-blue-600" />
                  <h4 className="text-base font-bold text-slate-900">Thông báo</h4>
                  {unreadCount > 0 && (
                    <span className="text-xs px-2 py-0.5 bg-blue-50 text-blue-700 border border-blue-200 rounded-full font-bold">
                      {unreadCount} mới
                    </span>
                  )}
                </div>
                {unreadCount > 0 && (
                  <button
                    onClick={handleMarkAllAsRead}
                    className="text-xs text-blue-600 hover:text-blue-800 font-semibold inline-flex items-center gap-1"
                  >
                    <Check className="h-3.5 w-3.5" />
                    Đánh dấu đã đọc
                  </button>
                )}
              </div>

              {/* Notification Category Tabs */}
              <div className="flex items-center gap-2 mb-3">
                <button
                  onClick={() => setActiveTab('all')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                    activeTab === 'all'
                      ? 'bg-blue-50 text-blue-700 border border-blue-200'
                      : 'text-slate-500 hover:bg-slate-100'
                  }`}
                >
                  Tất cả ({notifications.length})
                </button>
                <button
                  onClick={() => setActiveTab('unread')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                    activeTab === 'unread'
                      ? 'bg-blue-50 text-blue-700 border border-blue-200'
                      : 'text-slate-500 hover:bg-slate-100'
                  }`}
                >
                  Chưa đọc ({unreadCount})
                </button>
              </div>

              {/* Notification List */}
              <div className="space-y-2 max-h-88 overflow-y-auto pr-0.5">
                {filteredNotifications.length > 0 ? (
                  filteredNotifications.map((n) => (
                    <div
                      key={n.id}
                      onClick={() => handleNotificationClick(n)}
                      className={`p-3 rounded-lg border flex gap-3 transition-colors cursor-pointer text-left ${
                        !n.isRead
                          ? 'bg-blue-50/50 border-blue-200 hover:bg-blue-50/80'
                          : 'bg-slate-50/80 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {n.category === 'order' && <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />}
                      {n.category === 'chat' && <MessageSquare className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />}
                      {n.category === 'shipping' && <Truck className="h-5 w-5 text-sky-600 shrink-0 mt-0.5" />}
                      {n.category === 'stock' && <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />}
                      {(n.category === 'system' || (n.category as any) === 'shopee') && (
                        <RefreshCw className="h-5 w-5 text-orange-600 shrink-0 mt-0.5" />
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1">
                          <p className="text-sm font-bold text-slate-800 truncate">{n.title}</p>
                          <span className="text-xs text-slate-500 font-medium whitespace-nowrap">
                            {formatRelativeTime(n.createdAt)}
                          </span>
                        </div>
                        <p className="text-xs text-slate-600 mt-1 line-clamp-2 leading-relaxed">{n.message}</p>
                      </div>
                      {!n.isRead && (
                        <span className="h-2.5 w-2.5 rounded-full bg-blue-600 shrink-0 self-center" />
                      )}
                    </div>
                  ))
                ) : (
                  <div className="p-8 text-center text-sm text-slate-500 font-medium">
                    Không có thông báo nào trong danh mục này.
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* User Info & Logout */}
        <div className="flex items-center gap-3.5 pl-3 border-l border-slate-200">
          <div className="hidden md:block text-right">
            <p className="text-sm font-bold text-slate-800">{user?.name}</p>
            <div className="flex items-center justify-end gap-1.5 text-xs text-slate-500 font-medium">
              <ShieldCheck className="h-3.5 w-3.5 text-blue-600" />
              <span>
                {user?.role === 'SUPER_ADMIN'
                  ? 'Quản trị viên'
                  : user?.role === 'ADMIN'
                  ? 'Chủ shop'
                  : 'Nhân viên'}
              </span>
            </div>
          </div>

          <button
            onClick={handleLogout}
            title="Đăng xuất"
            className="p-2 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 transition-colors"
          >
            <LogOut className="h-4.5 w-4.5" />
          </button>
        </div>
      </div>
    </header>
  );
};
