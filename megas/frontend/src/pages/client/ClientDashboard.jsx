import { useEffect, useState } from 'react';
import api from '../../services/api';
import StatCard from '../../components/StatCard';

function ClientDashboard() {
  const [summary, setSummary] = useState(null);

  useEffect(() => {
    api.get('/client/summary').then((response) => setSummary(response.data)).catch(console.error);
  }, []);

  return (
    <div className="space-y-8">
      <div className="grid gap-6 xl:grid-cols-3">
        <StatCard title="My Orders" value={summary?.orders ?? '--'} />
        <StatCard title="Applied Jobs" value={summary?.appliedJobs ?? '--'} />
        <StatCard title="Alerts" value={summary?.unreadNotifications ?? '--'} subtitle="Unread notifications" />
      </div>
      <div className="rounded-3xl border border-slate-800 bg-slate-900/95 p-8 shadow-2xl shadow-slate-950/20">
        <h2 className="text-xl font-semibold text-white">Client workspace</h2>
        <p className="mt-2 text-slate-400">Track your orders, applications, and support conversations with one interface.</p>
      </div>
    </div>
  );
}

export default ClientDashboard;
