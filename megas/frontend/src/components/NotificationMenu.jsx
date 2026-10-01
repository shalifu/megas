import { useEffect, useState } from 'react';
import api from '../services/api';
import socket from '../socket/socketClient';

function NotificationMenu() {
  const [notifications, setNotifications] = useState([]);
  const [isOpen, setIsOpen] = useState(false);

  const loadNotifications = async () => {
    try {
      const response = await api.get('/notifications');
      setNotifications(response.data.notifications || []);
    } catch (error) {
      console.error('Unable to load notifications:', error);
    }
  };

  const markAsRead = async (notificationId) => {
    if (String(notificationId).startsWith('live-')) return;

    try {
      await api.patch(`/notifications/${notificationId}/read`);
      setNotifications((current) => current.map((notification) => (
        notification.id === notificationId
          ? { ...notification, isRead: 1 }
          : notification
      )));
    } catch (error) {
      console.error('Unable to mark notification as read:', error);
    }
  };

  useEffect(() => {
    loadNotifications();
    const interval = window.setInterval(loadNotifications, 10000);
    const handleNotification = (notification) => {
      setNotifications((current) => [
        {
          id: `live-${Date.now()}`,
          text: notification.text,
          isRead: 0,
          created_at: new Date().toISOString(),
        },
        ...current,
      ]);
    };

    socket.on('notification', handleNotification);
    return () => {
      window.clearInterval(interval);
      socket.off('notification', handleNotification);
    };
  }, []);

  const unreadCount = notifications.filter((notification) => !notification.isRead).length;

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setIsOpen((open) => !open)}
        aria-expanded={isOpen}
        aria-haspopup="true"
        className="relative rounded-2xl border border-slate-700 bg-slate-950/70 px-4 py-2 text-sm font-medium text-slate-200 transition hover:border-brand-500 hover:text-white"
      >
        Notifications
        {unreadCount > 0 && (
          <span className="ml-2 inline-flex min-w-5 items-center justify-center rounded-full bg-brand-500 px-1.5 text-xs font-bold text-white">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 z-30 mt-3 w-[min(22rem,calc(100vw-2rem))] rounded-2xl border border-slate-700 bg-slate-900 p-3 shadow-2xl shadow-slate-950/50">
          <div className="flex items-center justify-between px-2 py-1">
            <h2 className="font-semibold text-white">Notifications</h2>
            <button
              type="button"
              onClick={loadNotifications}
              className="text-xs text-slate-400 transition hover:text-white"
            >
              Refresh
            </button>
          </div>

          <div className="mt-2 max-h-80 space-y-2 overflow-y-auto">
            {notifications.length === 0 ? (
              <p className="px-2 py-5 text-sm text-slate-400">No notifications yet.</p>
            ) : notifications.slice(0, 8).map((notification) => (
              <button
                key={notification.id}
                type="button"
                onClick={() => markAsRead(notification.id)}
                className={`w-full rounded-xl border p-3 text-left transition hover:border-brand-500/50 ${
                  notification.isRead
                    ? 'border-slate-800 bg-slate-950/50'
                    : 'border-brand-500/30 bg-brand-500/10'
                }`}
              >
                <p className={`text-sm ${notification.isRead ? 'text-slate-300' : 'font-medium text-white'}`}>
                  {notification.text}
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  {new Date(notification.created_at).toLocaleString()}
                </p>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default NotificationMenu;
