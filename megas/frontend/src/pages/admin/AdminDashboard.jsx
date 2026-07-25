import { useEffect, useState } from 'react';
import api from '../../services/api';
import StatCard from '../../components/StatCard';
import NotificationsPanel from '../../components/NotificationsPanel';

function AdminDashboard() {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    api.get('/admin/summary').then((response) => setStats(response.data)).catch(console.error);
  }, []);

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_400px]">
      <div className="space-y-8">
        <div className="grid gap-6 xl:grid-cols-4">
          <StatCard title="Total Users" value={stats?.totalUsers ?? '--'} />
          <StatCard title="Total Orders" value={stats?.totalOrders ?? '--'} />
          <StatCard title="Total Jobs" value={stats?.totalJobs ?? '--'} />
          <StatCard title="Revenue" value={`$${stats?.revenue ?? '0.00'}`} subtitle="Estimated total" />
        </div>
        <div className="rounded-3xl border border-slate-800 bg-slate-900/95 p-8 shadow-2xl shadow-slate-950/20">
          <h2 className="text-xl font-semibold text-white">Recent activity</h2>
          <p className="mt-3 text-slate-400">Monitor approvals, orders, and message activity in the admin portal.</p>
        </div>
      </div>
      <div>
        <NotificationsPanel />
      </div>
    </div>
  );
}

export default AdminDashboard;
