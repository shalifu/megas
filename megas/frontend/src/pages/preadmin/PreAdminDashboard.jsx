import { useEffect, useState } from 'react';
import api from '../../services/api';
import StatCard from '../../components/StatCard';

function PreAdminDashboard() {
  const [summary, setSummary] = useState(null);

  useEffect(() => {
    api.get('/preadmin/summary').then((response) => setSummary(response.data)).catch(console.error);
  }, []);

  return (
    <div className="space-y-8">
      <div className="grid gap-6 xl:grid-cols-3">
        <StatCard title="Team messages" value={summary?.messages ?? '--'} />
        <StatCard title="Notifications" value={summary?.unreadNotifications ?? '--'} />
        <StatCard title="Team members" value={summary?.teamMembers ?? '--'} subtitle={summary?.role} />
      </div>
      <div className="rounded-3xl border border-slate-800 bg-slate-900/95 p-8 shadow-2xl shadow-slate-950/20">
        <h2 className="text-xl font-semibold text-white">Pre-admin workspace</h2>
        <p className="mt-2 text-slate-400">View your assigned role, team expectations, and internal communication tools.</p>
      </div>
    </div>
  );
}

export default PreAdminDashboard;
