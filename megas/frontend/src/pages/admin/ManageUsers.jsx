import { useEffect, useState } from 'react';
import api from '../../services/api';

function ManageUsers() {
  const [users, setUsers] = useState([]);

  const loadUsers = async () => {
    try {
      const response = await api.get('/admin/users');
      setUsers(response.data.users);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleApprove = async (id) => {
    await api.patch(`/admin/users/${id}/approve`);
    loadUsers();
  };

  const handlePromote = async (id) => {
    const role = window.prompt('Enter role for user (preadmin/admin):', 'preadmin');
    if (!role) return;
    await api.patch(`/admin/users/${id}/promote`, { role, chief_position: 'Chief Developer' });
    loadUsers();
  };

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-slate-800 bg-slate-900/95 p-8 shadow-2xl shadow-slate-950/20">
        <h2 className="text-xl font-semibold text-white">Manage users</h2>
        <p className="mt-2 text-slate-400">Approve clients, promote team members, and review account records.</p>
      </div>
      <div className="overflow-hidden rounded-3xl border border-slate-800 bg-slate-900/95 shadow-2xl shadow-slate-950/20">
        <table className="min-w-full divide-y divide-slate-800 text-sm text-slate-200">
          <thead className="bg-slate-950/90 text-left text-slate-400">
            <tr>
              <th className="px-6 py-4">Name</th>
              <th className="px-6 py-4">Email</th>
              <th className="px-6 py-4">Role</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800 bg-slate-950/80">
            {users.map((user) => (
              <tr key={user.id}>
                <td className="px-6 py-4">{user.username}</td>
                <td className="px-6 py-4">{user.email}</td>
                <td className="px-6 py-4">{user.role}</td>
                <td className="px-6 py-4">{user.approved ? 'Approved' : 'Pending'}</td>
                <td className="px-6 py-4 space-x-2">
                  {!user.approved && (
                    <button onClick={() => handleApprove(user.id)} className="rounded-full bg-emerald-500 px-3 py-2 text-xs font-semibold text-slate-900 hover:bg-emerald-400">
                      Approve
                    </button>
                  )}
                  <button onClick={() => handlePromote(user.id)} className="rounded-full bg-brand-500 px-3 py-2 text-xs font-semibold text-white hover:bg-brand-400">
                    Promote
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default ManageUsers;
