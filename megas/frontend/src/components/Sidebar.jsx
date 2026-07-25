import { NavLink } from 'react-router-dom';

const menuItems = {
  admin: [
    { path: '/dashboard/admin', label: 'Overview' },
    { path: '/dashboard/admin/users', label: 'Manage Users' },
    { path: '/dashboard/admin/orders', label: 'Manage Orders' },
    { path: '/dashboard/admin/jobs', label: 'Manage Jobs' },
    { path: '/dashboard/admin/chef-applications', label: 'Chef Applications' },
    { path: '/dashboard/admin/create-chef-application', label: 'Create Chef Application' },
    { path: '/dashboard/admin/chef-chat', label: 'Chef Chat' },
    { path: '/dashboard/admin/tasks', label: 'Manage Tasks' },
    { path: '/dashboard/admin/chat', label: 'Team Chat' },
  ],
  client: [
    { path: '/dashboard/client', label: 'Overview' },
    { path: '/dashboard/client/orders', label: 'My Orders' },
    { path: '/dashboard/client/new-order', label: 'New Order' },
    { path: '/dashboard/client/applications', label: 'Applied Jobs' },
    { path: '/dashboard/client/new-application', label: 'Apply for Job' },
    { path: '/dashboard/client/chat', label: 'Messages' },
    { path: '/dashboard/client/profile', label: 'Profile' },
  ],
  preadmin: [
    { path: '/dashboard/preadmin', label: 'Overview' },
    { path: '/dashboard/preadmin/tasks', label: 'Assigned Tasks' },
    { path: '/dashboard/preadmin/chat', label: 'Team Chat' },
    { path: '/dashboard/client/profile', label: 'Profile' },
  ],
};

function Sidebar({ user, onLogout }) {
  const links = menuItems[user?.role] || [];

  return (
    <aside className="w-full border-b border-slate-800 bg-slate-900/95 p-5 text-slate-200 lg:w-80 lg:border-r lg:border-b-0">
      <div className="mb-8 flex items-center justify-between rounded-3xl bg-slate-950/80 p-5 shadow-xl shadow-slate-950/20">
        <div>
          <p className="text-sm uppercase tracking-[0.35em] text-slate-500">MEGAS</p>
          <p className="mt-2 text-lg font-semibold">{user?.role === 'preadmin' ? 'CHEFS' : user?.role?.toUpperCase()}</p>
        </div>
      </div>
      <nav className="space-y-2">
        {links.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `block rounded-3xl px-4 py-3 text-sm font-medium transition ${
                isActive ? 'bg-brand-500/15 text-white shadow-sm shadow-brand-500/10' : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`
            }
          >
            {item.label}
          </NavLink>
        ))}
      </nav>
      <div className="mt-8 rounded-3xl bg-slate-950/80 p-5 text-slate-400 shadow-xl shadow-slate-950/20">
        <p className="text-sm uppercase tracking-[0.35em] text-slate-500">Status</p>
        <p className="mt-3 text-sm">Role: <span className="font-medium text-white">{user?.chief_position || user?.role}</span></p>
        <button
          type="button"
          onClick={onLogout}
          className="mt-5 w-full rounded-2xl bg-brand-500 px-4 py-3 text-sm font-semibold text-white transition hover:bg-brand-400"
        >
          Sign Out
        </button>
      </div>
    </aside>
  );
}

export default Sidebar;
