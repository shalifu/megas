import { useEffect, useState } from 'react';
import api from '../../services/api';

function ManageJobs() {
  const [applications, setApplications] = useState([]);

  const loadApplications = async () => {
    try {
      const response = await api.get('/admin/jobs');
      setApplications(response.data.applications);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    loadApplications();
  }, []);

  const updateStatus = async (id, status) => {
    await api.patch(`/admin/jobs/${id}/status`, { status });
    loadApplications();
  };

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-slate-800 bg-slate-900/95 p-8 shadow-2xl shadow-slate-950/20">
        <h2 className="text-xl font-semibold text-white">Job applications</h2>
        <p className="mt-2 text-slate-400">Approve or reject talent requests and follow applicant progress.</p>
      </div>
      <div className="grid gap-6">
        {applications.map((application) => (
          <div key={application.id} className="rounded-3xl border border-slate-800 bg-slate-950/90 p-6 shadow-2xl shadow-slate-950/20">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-lg font-semibold text-white">{application.job_title}</p>
                <p className="text-sm text-slate-400">{application.applicant_name}</p>
              </div>
              <span className="rounded-full bg-slate-800 px-3 py-1 text-xs uppercase tracking-[0.25em] text-slate-400">{application.status}</span>
            </div>
            <div className="mt-4 flex flex-wrap items-center gap-2 text-sm text-slate-400">
              <span>Email: {application.applicant_email}</span>
              <span>CV: {application.cv_file || 'Not provided'}</span>
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              {['approved', 'rejected', 'pending'].map((status) => (
                <button
                  key={status}
                  type="button"
                  onClick={() => updateStatus(application.id, status)}
                  className="rounded-full bg-slate-800 px-3 py-2 text-xs text-slate-300 hover:bg-slate-700"
                >
                  {status}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default ManageJobs;
