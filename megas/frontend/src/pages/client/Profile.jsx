import { useEffect, useState } from 'react';
import api from '../../services/api';

function Profile() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    api.get('/users/me').then((response) => setUser(response.data.user)).catch(console.error);
  }, []);

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-slate-800 bg-slate-900/95 p-8 shadow-2xl shadow-slate-950/20">
        <h2 className="text-xl font-semibold text-white">Profile</h2>
        <p className="mt-2 text-slate-400">Your account details and role information.</p>
      </div>
      {user ? (
        <div className="grid gap-6 lg:grid-cols-2">
          {[
            { label: 'Username', value: user.username },
            { label: 'Email', value: user.email },
            { label: 'Role', value: user.role },
            { label: 'Status', value: user.approved ? 'Approved' : 'Pending approval' },
            { label: 'Position', value: user.chief_position || 'N/A' },
          ].map((item) => (
            <div key={item.label} className="rounded-3xl border border-slate-800 bg-slate-950/90 p-6 shadow-2xl shadow-slate-950/20">
              <p className="text-sm uppercase tracking-[0.3em] text-slate-500">{item.label}</p>
              <p className="mt-3 text-xl font-semibold text-white">{item.value}</p>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-slate-400">Loading profile…</p>
      )}
    </div>
  );
}

export default Profile;
