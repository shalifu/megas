import { useState } from 'react';
import api from '../../services/api';

function NewApplication() {
  const [jobTitle, setJobTitle] = useState('');
  const [cv, setCv] = useState(null);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setMessage('');

    if (!jobTitle) {
      setError('Please enter a job title.');
      return;
    }

    try {
      const formData = new FormData();
      formData.append('jobTitle', jobTitle);
      if (cv) {
        formData.append('cv', cv);
      }

      await api.post('/jobs/apply-with-cv', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setMessage('Application submitted successfully.');
      setJobTitle('');
      setCv(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to submit application.');
    }
  };

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-slate-800 bg-slate-900/95 p-8 shadow-2xl shadow-slate-950/20">
        <h2 className="text-xl font-semibold text-white">Apply for a job</h2>
        <p className="mt-2 text-slate-400">Upload your CV and submit your application directly.</p>
      </div>
      <form onSubmit={handleSubmit} className="grid gap-6 rounded-3xl border border-slate-800 bg-slate-950/90 p-8 shadow-2xl shadow-slate-950/20">
        {error && <div className="rounded-2xl bg-rose-500/10 p-4 text-sm text-rose-200">{error}</div>}
        {message && <div className="rounded-2xl bg-emerald-500/10 p-4 text-sm text-emerald-200">{message}</div>}
        <label className="block text-sm text-slate-300">
          Job title
          <input value={jobTitle} onChange={(e) => setJobTitle(e.target.value)} className="mt-3 w-full rounded-3xl border border-slate-800 bg-slate-950/90 px-4 py-3 text-white outline-none focus:border-brand-500" placeholder="Senior developer, designer, manager..." />
        </label>
        <label className="block text-sm text-slate-300">
          CV upload
          <input onChange={(e) => setCv(e.target.files?.[0] || null)} type="file" accept=".pdf,.doc,.docx" className="mt-3 w-full text-sm text-slate-200" />
        </label>
        <button type="submit" className="rounded-3xl bg-brand-500 px-5 py-4 text-sm font-semibold text-white transition hover:bg-brand-400">Submit application</button>
      </form>
    </div>
  );
}

export default NewApplication;
