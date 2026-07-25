import { useEffect, useState } from 'react';
import api from '../../services/api';

function ChefApplication() {
  const [roles, setRoles] = useState([]);
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState('');
  const [roleId, setRoleId] = useState('');
  const [experience, setExperience] = useState('');
  const [qualifications, setQualifications] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [existingApplication, setExistingApplication] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);

  const loadRoles = async () => {
    try {
      const response = await api.get('/roles');
      setRoles(response.data.roles || []);
    } catch (error) {
      console.error('Error loading roles:', error);
    }
  };

  const loadUsers = async () => {
    try {
      const response = await api.get('/users/search?q=');
      setUsers(response.data.users?.filter(u => u.role === 'preadmin') || []);
    } catch (error) {
      console.error('Error loading users:', error);
    }
  };

  const loadCurrentUser = async () => {
    try {
      const response = await api.get('/users/me');
      setCurrentUser(response.data.user);
    } catch (error) {
      console.error('Error loading current user:', error);
    }
  };

  const loadMyApplication = async () => {
    if (currentUser?.role !== 'preadmin') return;
    try {
      const response = await api.get('/chef-applications/my');
      if (response.data.applications && response.data.applications.length > 0) {
        setExistingApplication(response.data.applications[0]);
      }
    } catch (error) {
      console.error('Error loading application:', error);
    }
  };

  useEffect(() => {
    loadRoles();
    loadUsers();
    loadCurrentUser();
  }, []);

  useEffect(() => {
    if (currentUser) {
      loadMyApplication();
    }
  }, [currentUser]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setMessage('');
    setLoading(true);

    if (!roleId || !experience || !qualifications) {
      setMessage('All fields are required.');
      setLoading(false);
      return;
    }

    const isAdmin = currentUser?.role === 'admin';
    const payload = { roleId, experience, qualifications };
    
    if (isAdmin && selectedUser) {
      payload.userId = selectedUser;
    }

    try {
      await api.post('/chef-applications', payload);
      setMessage(isAdmin ? 'Chef application created successfully!' : 'Chef application submitted successfully!');
      setRoleId('');
      setExperience('');
      setQualifications('');
      setSelectedUser('');
      if (!isAdmin) {
        loadMyApplication(); // Reload to show existing application
      }
    } catch (error) {
      console.error('Application error:', error.response?.data || error);
      setMessage(error.response?.data?.message || 'Failed to submit application.');
    } finally {
      setLoading(false);
    }
  };

  if (existingApplication) {
    return (
      <div className="space-y-6">
        <div className="rounded-3xl border border-slate-800 bg-slate-900/95 p-8 shadow-2xl shadow-slate-950/20">
          <h2 className="text-xl font-semibold text-white">Your Chef Application</h2>
          <p className="mt-2 text-slate-400">You have already submitted a chef application.</p>
        </div>
        
        <div className="rounded-3xl border border-slate-800 bg-slate-950/90 p-8 shadow-2xl shadow-slate-950/20">
          <div className="space-y-4">
            <div>
              <p className="text-sm text-slate-500">Applied Position</p>
              <p className="text-lg font-semibold text-white">{existingApplication.role_name}</p>
            </div>
            <div>
              <p className="text-sm text-slate-500">Experience</p>
              <p className="text-slate-300">{existingApplication.experience}</p>
            </div>
            <div>
              <p className="text-sm text-slate-500">Qualifications</p>
              <p className="text-slate-300">{existingApplication.qualifications}</p>
            </div>
            <div>
              <p className="text-sm text-slate-500">Status</p>
              <span className={`inline-block rounded-xl px-3 py-1 text-sm font-medium ${
                existingApplication.status === 'approved' ? 'bg-emerald-500/20 text-emerald-300' :
                existingApplication.status === 'rejected' ? 'bg-rose-500/20 text-rose-300' :
                'bg-brand-500/20 text-brand-300'
              }`}>
                {existingApplication.status.charAt(0).toUpperCase() + existingApplication.status.slice(1)}
              </span>
            </div>
            <div>
              <p className="text-sm text-slate-500">Applied On</p>
              <p className="text-slate-300">{new Date(existingApplication.created_at).toLocaleDateString()}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-slate-800 bg-slate-900/95 p-8 shadow-2xl shadow-slate-950/20">
        <h2 className="text-xl font-semibold text-white">
          {currentUser?.role === 'admin' ? 'Create Chef Application' : 'Apply for Chef Position'}
        </h2>
        <p className="mt-2 text-slate-400">
          {currentUser?.role === 'admin' 
            ? 'Create a chef application for a pre-admin user.' 
            : 'Apply for a leadership position in the organization.'}
        </p>
      </div>

      <div className="rounded-3xl border border-slate-800 bg-slate-950/90 p-8 shadow-2xl shadow-slate-950/20">
        <form onSubmit={handleSubmit} className="space-y-5">
          {message && (
            <div className={`rounded-2xl p-4 text-sm ${
              message.includes('successfully') ? 'bg-emerald-500/10 text-emerald-200' : 'bg-rose-500/10 text-rose-200'
            }`}>
              {message}
            </div>
          )}
          
          {currentUser?.role === 'admin' && (
            <label className="block text-sm text-slate-300">
              Select User
              <select 
                value={selectedUser} 
                onChange={(e) => setSelectedUser(e.target.value)} 
                className="mt-3 w-full rounded-3xl border border-slate-800 bg-slate-900 px-4 py-3 text-white outline-none focus:border-brand-500"
                required
              >
                <option value="">Select a pre-admin user</option>
                {users.map((user) => (
                  <option key={user.id} value={user.id}>{user.username} ({user.email})</option>
                ))}
              </select>
            </label>
          )}
          
          <label className="block text-sm text-slate-300">
            Chef Position
            <select 
              value={roleId} 
              onChange={(e) => setRoleId(e.target.value)} 
              className="mt-3 w-full rounded-3xl border border-slate-800 bg-slate-900 px-4 py-3 text-white outline-none focus:border-brand-500"
              required
            >
              <option value="">Select a chef position</option>
              {roles.map((role) => (
                <option key={role.id} value={role.id}>{role.name}</option>
              ))}
            </select>
          </label>

          <label className="block text-sm text-slate-300">
            Experience
            <textarea 
              value={experience} 
              onChange={(e) => setExperience(e.target.value)} 
              rows="4" 
              className="mt-3 w-full rounded-3xl border border-slate-800 bg-slate-900 px-4 py-3 text-white outline-none focus:border-brand-500"
              placeholder="Describe your relevant experience..."
              required
            />
          </label>

          <label className="block text-sm text-slate-300">
            Qualifications
            <textarea 
              value={qualifications} 
              onChange={(e) => setQualifications(e.target.value)} 
              rows="4" 
              className="mt-3 w-full rounded-3xl border border-slate-800 bg-slate-900 px-4 py-3 text-white outline-none focus:border-brand-500"
              placeholder="List your qualifications and skills..."
              required
            />
          </label>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full rounded-3xl bg-brand-500 px-5 py-4 text-sm font-semibold text-white transition hover:bg-brand-400 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? 'Submitting...' : 'Submit Application'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default ChefApplication;
