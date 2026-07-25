import { useEffect, useState } from 'react';
import api from '../../services/api';

function AppliedJobs() {
  const [applications, setApplications] = useState([]);

  useEffect(() => {
    api.get('/client/jobs').then((response) => setApplications(response.data.applications)).catch(console.error);
  }, []);

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-slate-800 bg-slate-900/95 p-8 shadow-2xl shadow-slate-950/20">
        <h2 className="text-xl font-semibold text-white">Applied jobs</h2>
        <p className="mt-2 text-slate-400">Check the status of your career applications and CV submissions.</p>
      </div>
      <div className="grid gap-6">
        {applications.map((item) => (
          <div key={item.id} className="rounded-3xl border border-slate-800 bg-slate-950/90 p-6 shadow-2xl shadow-slate-950/20">
            <div className="flex items-center justify-between gap-3">
              <p className="text-lg font-semibold text-white">{item.job_title}</p>
              <span className="rounded-full bg-slate-800 px-3 py-1 text-xs uppercase tracking-[0.25em] text-slate-400">{item.status}</span>
            </div>
            <p className="mt-3 text-slate-400">CV file: {item.cv_file || 'Not uploaded'}</p>
            <p className="mt-4 text-sm text-slate-500">Applied on {new Date(item.created_at).toLocaleDateString()}</p>
          </div>
        ))}
        {applications.length === 0 && <p className="text-slate-400">No job applications yet.</p>}
      </div>
    </div>
  );
}

export default AppliedJobs;
