import { useEffect, useState } from 'react';
import api from '../../services/api';

function AdminTasks() {
  const [tasks, setTasks] = useState([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [assignee, setAssignee] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [users, setUsers] = useState([]);
  const [message, setMessage] = useState('');

  const loadTasks = async () => {
    try {
      const response = await api.get('/admin/tasks');
      setTasks(response.data.tasks);
    } catch (error) {
      console.error(error);
    }
  };

  const loadUsers = async () => {
    try {
      const response = await api.get('/admin/users');
      setUsers(response.data.users.filter((user) => user.role === 'preadmin'));
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    loadTasks();
    loadUsers();
  }, []);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setMessage('');

    if (!title || !assignee) {
      setMessage('Task title and assignee are required.');
      return;
    }

    try {
      await api.post('/tasks', { title, description, assigned_to: assignee, due_date: dueDate });
      setMessage('Task assigned successfully.');
      setTitle('');
      setDescription('');
      setDueDate('');
      setAssignee('');
      loadTasks();
    } catch (error) {
      console.error('Task creation error:', error.response?.data || error);
      setMessage(error.response?.data?.message || 'Failed to create task. Make sure you are logged in as an admin.');
    }
  };

  return (
    <div className="space-y-8">
      <div className="rounded-3xl border border-slate-800 bg-slate-900/95 p-8 shadow-2xl shadow-slate-950/20">
        <h2 className="text-xl font-semibold text-white">Task Management</h2>
        <p className="mt-2 text-slate-400">Create tasks and assign them to Pre Admin team members.</p>
      </div>
      <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <form onSubmit={handleSubmit} className="rounded-3xl border border-slate-800 bg-slate-950/90 p-8 shadow-2xl shadow-slate-950/20">
          {message && (
            <div className={`mb-4 rounded-2xl p-4 text-sm ${
              message.includes('successfully') ? 'bg-emerald-500/10 text-emerald-200' : 'bg-rose-500/10 text-rose-200'
            }`}>
              {message}
            </div>
          )}
          <label className="block text-sm text-slate-300">
            Task title
            <input value={title} onChange={(e) => setTitle(e.target.value)} className="mt-3 w-full rounded-3xl border border-slate-800 bg-slate-900 px-4 py-3 text-white outline-none focus:border-brand-500" />
          </label>
          <label className="block text-sm text-slate-300 mt-5">
            Description
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows="5" className="mt-3 w-full rounded-3xl border border-slate-800 bg-slate-900 px-4 py-3 text-white outline-none focus:border-brand-500" />
          </label>
          <label className="block text-sm text-slate-300 mt-5">
            Assign to
            <select value={assignee} onChange={(e) => setAssignee(e.target.value)} className="mt-3 w-full rounded-3xl border border-slate-800 bg-slate-900 px-4 py-3 text-white outline-none focus:border-brand-500">
              <option value="">Select a pre admin</option>
              {users.map((user) => (
                <option key={user.id} value={user.id}>{user.username}</option>
              ))}
            </select>
          </label>
          <label className="block text-sm text-slate-300 mt-5">
            Due date
            <input value={dueDate} onChange={(e) => setDueDate(e.target.value)} type="date" className="mt-3 w-full rounded-3xl border border-slate-800 bg-slate-900 px-4 py-3 text-white outline-none focus:border-brand-500" />
          </label>
          <button type="submit" className="mt-6 rounded-3xl bg-brand-500 px-5 py-4 text-sm font-semibold text-white transition hover:bg-brand-400">Create task</button>
        </form>
        <div className="rounded-3xl border border-slate-800 bg-slate-950/90 p-8 shadow-2xl shadow-slate-950/20">
          <h3 className="text-lg font-semibold text-white">Recent tasks</h3>
          <div className="mt-5 space-y-4">
            {tasks.map((task) => (
              <div key={task.id} className="rounded-3xl border border-slate-800 bg-slate-900 p-5">
                <p className="font-semibold text-white">{task.title}</p>
                <p className="mt-2 text-sm text-slate-400">{task.description}</p>
                <p className="mt-3 text-xs uppercase tracking-[0.2em] text-slate-500">Assigned to: {task.assigned_name}</p>
              </div>
            ))}
            {tasks.length === 0 && <p className="text-slate-400">No tasks assigned yet.</p>}
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminTasks;
