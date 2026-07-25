import { useEffect, useState } from 'react';
import api from '../services/api';

function NotificationsPanel() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadNotifications = async () => {
    try {
      const response = await api.get('/notifications');
      setNotifications(response.data.notifications || []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (notificationId) => {
    try {
      await api.patch(`/notifications/${notificationId}/read`);
      setNotifications(prev => 
        prev.map(notif => 
          notif.id === notificationId ? { ...notif, isRead: 1 } : notif
        )
      );
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    loadNotifications();
  }, []);

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-slate-800 bg-slate-900/95 p-8 shadow-2xl shadow-slate-950/20">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-white">Notifications</h2>
            <p className="mt-2 text-slate-400">
              {unreadCount > 0 ? `${unreadCount} unread notification${unreadCount > 1 ? 's' : ''}` : 'All notifications read'}
            </p>
          </div>
          <button
            onClick={loadNotifications}
            className="rounded-2xl bg-slate-800 px-4 py-2 text-sm text-slate-300 hover:bg-slate-700 transition"
          >
            Refresh
          </button>
        </div>
      </div>

      <div className="rounded-3xl border border-slate-800 bg-slate-900/95 p-6 shadow-2xl shadow-slate-950/20">
        {loading ? (
          <p className="text-slate-400">Loading notifications...</p>
        ) : notifications.length === 0 ? (
          <p className="text-slate-400">No notifications yet.</p>
        ) : (
          <div className="space-y-3">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                className={`rounded-2xl border p-4 transition ${
                  !notification.isRead 
                    ? 'border-brand-500/30 bg-brand-500/5' 
                    : 'border-slate-700 bg-slate-800/50'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <p className={`text-sm ${!notification.isRead ? 'text-white font-medium' : 'text-slate-300'}`}>
                      {notification.text}
                    </p>
                    <p className="mt-2 text-xs text-slate-500">
                      {new Date(notification.created_at).toLocaleString()}
                    </p>
                  </div>
                  {!notification.isRead && (
                    <button
                      onClick={() => markAsRead(notification.id)}
                      className="rounded-xl bg-brand-500/20 px-3 py-1 text-xs text-brand-300 hover:bg-brand-500/30 transition"
                    >
                      Mark as read
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default NotificationsPanel;
