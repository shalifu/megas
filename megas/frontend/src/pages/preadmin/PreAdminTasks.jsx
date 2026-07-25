import { useEffect, useState } from 'react';
import api from '../../services/api';

function PreAdminTasks() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadTasks = async () => {
    try {
      const response = await api.get('/tasks/assigned');
      setTasks(response.data.tasks || []);
    } catch (error) {
      console.error('Error loading tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTasks();
  }, []);

  const updateTaskStatus = async (taskId, newStatus) => {
    try {
      await api.patch(`/tasks/${taskId}/status`, { status: newStatus });
      loadTasks(); // Reload tasks to show updated status
    } catch (error) {
      console.error('Error updating task status:', error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-slate-800 bg-slate-900/95 p-8 shadow-2xl shadow-slate-950/20">
        <h2 className="text-xl font-semibold text-white">Assigned tasks</h2>
        <p className="mt-2 text-slate-400">Stay on top of your team goals and daily responsibilities.</p>
      </div>
      
      {loading ? (
        <div className="rounded-3xl border border-slate-800 bg-slate-900/95 p-8 shadow-2xl shadow-slate-950/20">
          <p className="text-slate-400">Loading tasks...</p>
        </div>
      ) : tasks.length === 0 ? (
        <div className="rounded-3xl border border-slate-800 bg-slate-900/95 p-8 shadow-2xl shadow-slate-950/20">
          <p className="text-slate-400">No tasks assigned to you yet.</p>
        </div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-3">
          {tasks.map((task) => (
            <div key={task.id} className="rounded-3xl border border-slate-800 bg-slate-950/90 p-6 shadow-2xl shadow-slate-950/20">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <p className="text-lg font-semibold text-white">{task.title}</p>
                  <p className="mt-3 text-slate-400">{task.description || 'No description provided'}</p>
                  {task.due_date && (
                    <p className="mt-2 text-xs text-slate-500">Due: {new Date(task.due_date).toLocaleDateString()}</p>
                  )}
                  <p className="mt-2 text-xs text-slate-500">Assigned by: {task.creator_name}</p>
                </div>
                <div className="flex flex-col gap-2">
                  <select 
                    value={task.status} 
                    onChange={(e) => updateTaskStatus(task.id, e.target.value)}
                    className="rounded-xl border border-slate-700 bg-slate-800 px-3 py-1 text-xs text-slate-300 outline-none focus:border-brand-500"
                  >
                    <option value="todo">To Do</option>
                    <option value="in_progress">In Progress</option>
                    <option value="completed">Completed</option>
                  </select>
                  <span className={`rounded-xl px-2 py-1 text-xs font-medium ${
                    task.status === 'completed' ? 'bg-emerald-500/20 text-emerald-300' :
                    task.status === 'in_progress' ? 'bg-brand-500/20 text-brand-300' :
                    'bg-slate-700 text-slate-400'
                  }`}>
                    {task.status.replace('_', ' ')}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default PreAdminTasks;
