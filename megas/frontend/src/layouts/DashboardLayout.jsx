import { Outlet } from 'react-router-dom';
import { useEffect } from 'react';
import { connectSocket } from '../socket/socketClient';
import Sidebar from '../components/Sidebar';
import { useAuth } from '../context/AuthContext';

function DashboardLayout() {
  const { user, logout } = useAuth();

  useEffect(() => {
    if (user) {
      const socket = connectSocket();
      socket.on('connect_error', (error) => {
        console.warn('Socket failed to connect:', error.message);
      });

      return () => {
        socket.off('connect_error');
        socket.disconnect();
      };
    }
  }, [user]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <div className="flex min-h-screen flex-col lg:flex-row">
        <Sidebar user={user} onLogout={logout} />
        <div className="flex-1 p-4 sm:p-6 lg:p-8">
          <div className="mb-6 rounded-3xl border border-slate-800 bg-slate-900/90 p-6 shadow-2xl shadow-slate-950/30 backdrop-blur-lg">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm uppercase tracking-[0.3em] text-slate-400">Welcome back</p>
                <h1 className="mt-2 text-3xl font-semibold text-white">Hello, {user?.username}</h1>
                <p className="text-slate-400">Your dashboard is ready with live collaboration and admin insights.</p>
              </div>
            </div>
          </div>
          <Outlet />
        </div>
      </div>
    </div>
  );
}

export default DashboardLayout;
