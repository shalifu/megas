import { useState } from 'react';
import api from '../../services/api';

function NewOrder() {
  const [projectType, setProjectType] = useState('Website Development');
  const [budget, setBudget] = useState('');
  const [deadline, setDeadline] = useState('');
  const [description, setDescription] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setMessage('');

    try {
      await api.post('/orders', { projectType, budget, description, deadline });
      setMessage('Order request submitted successfully.');
      setBudget('');
      setDescription('');
      setDeadline('');
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to send order request.');
    }
  };

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-slate-800 bg-slate-900/95 p-8 shadow-2xl shadow-slate-950/20">
        <h2 className="text-xl font-semibold text-white">Place a new project order</h2>
        <p className="mt-2 text-slate-400">Submit your website, software, or mobile app requirements directly to the team.</p>
      </div>
      <form onSubmit={handleSubmit} className="grid gap-6 rounded-3xl border border-slate-800 bg-slate-950/90 p-8 shadow-2xl shadow-slate-950/20">
        {error && <div className="rounded-2xl bg-rose-500/10 p-4 text-sm text-rose-200">{error}</div>}
        {message && <div className="rounded-2xl bg-emerald-500/10 p-4 text-sm text-emerald-200">{message}</div>}
        <label className="block text-sm text-slate-300">
          Project type
          <select value={projectType} onChange={(e) => setProjectType(e.target.value)} className="mt-3 w-full rounded-3xl border border-slate-800 bg-slate-950/90 px-4 py-3 text-white outline-none focus:border-brand-500">
            <option>Website Development</option>
            <option>Software System</option>
            <option>Mobile App</option>
            <option>Design and Branding</option>
          </select>
        </label>
        <label className="block text-sm text-slate-300">
          Budget
          <input value={budget} onChange={(e) => setBudget(e.target.value)} type="number" min="0" className="mt-3 w-full rounded-3xl border border-slate-800 bg-slate-950/90 px-4 py-3 text-white outline-none focus:border-brand-500" placeholder="e.g. 4500" />
        </label>
        <label className="block text-sm text-slate-300">
          Deadline
          <input value={deadline} onChange={(e) => setDeadline(e.target.value)} type="date" className="mt-3 w-full rounded-3xl border border-slate-800 bg-slate-950/90 px-4 py-3 text-white outline-none focus:border-brand-500" />
        </label>
        <label className="block text-sm text-slate-300">
          Project description
          <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows="6" className="mt-3 w-full rounded-3xl border border-slate-800 bg-slate-950/90 px-4 py-3 text-white outline-none focus:border-brand-500" placeholder="Describe the project requirements and goals." />
        </label>
        <button type="submit" className="rounded-3xl bg-brand-500 px-5 py-4 text-sm font-semibold text-white transition hover:bg-brand-400">Submit order</button>
      </form>
    </div>
  );
}

export default NewOrder;
