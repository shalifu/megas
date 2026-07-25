import { useEffect, useState } from 'react';
import api from '../../services/api';

function ManageChefApplications() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadApplications = async () => {
    try {
      const response = await api.get('/chef-applications');
      setApplications(response.data.applications || []);
    } catch (error) {
      console.error('Error loading applications:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadApplications();
  }, []);

  const updateApplicationStatus = async (applicationId, newStatus, assignPosition = false) => {
    try {
      await api.patch(`/chef-applications/${applicationId}/status`, { status: newStatus, assignPosition });
      loadApplications(); // Reload to show updated status
    } catch (error) {
      console.error('Error updating application:', error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-slate-800 bg-slate-900/95 p-8 shadow-2xl shadow-slate-950/20">
        <h2 className="text-xl font-semibold text-white">Chef Applications</h2>
        <p className="mt-2 text-slate-400">Review and approve chef position applications from pre-admin users.</p>
      </div>
      
      {loading ? (
        <div className="rounded-3xl border border-slate-800 bg-slate-900/95 p-8 shadow-2xl shadow-slate-950/20">
          <p className="text-slate-400">Loading applications...</p>
        </div>
      ) : applications.length === 0 ? (
        <div className="rounded-3xl border border-slate-800 bg-slate-900/95 p-8 shadow-2xl shadow-slate-950/20">
          <p className="text-slate-400">No chef applications yet.</p>
        </div>
      ) : (
        <div className="rounded-3xl border border-slate-800 bg-slate-950/90 p-8 shadow-2xl shadow-slate-950/20">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-700">
                  <th className="px-4 py-3 text-left text-sm font-semibold text-white">Applicant</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-white">Position</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-white">Experience</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-white">Qualifications</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-white">Applied</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-white">Status</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-white">Actions</th>
                </tr>
              </thead>
              <tbody>
                {applications.map((application) => (
                  <tr key={application.id} className="border-b border-slate-700">
                    <td className="px-4 py-4">
                      <div>
                        <p className="font-medium text-white">{application.applicant_name}</p>
                        <p className="text-sm text-slate-400">{application.applicant_email}</p>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <span className="rounded-xl bg-brand-500/20 px-3 py-1 text-sm text-brand-300">
                        {application.role_name}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-sm text-slate-300 max-w-xs">
                      <div className="line-clamp-3">{application.experience}</div>
                    </td>
                    <td className="px-4 py-4 text-sm text-slate-300 max-w-xs">
                      <div className="line-clamp-3">{application.qualifications}</div>
                    </td>
                    <td className="px-4 py-4 text-sm text-slate-400">
                      {new Date(application.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-4">
                      <span className={`rounded-xl px-3 py-1 text-sm font-medium ${
                        application.status === 'approved' ? 'bg-emerald-500/20 text-emerald-300' :
                        application.status === 'rejected' ? 'bg-rose-500/20 text-rose-300' :
                        'bg-brand-500/20 text-brand-300'
                      }`}>
                        {application.status.charAt(0).toUpperCase() + application.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <div className="space-y-2">
                        {application.status === 'pending' && (
                          <>
                            <div className="flex items-center gap-2">
                              <input
                                type="checkbox"
                                id={`assign-${application.id}`}
                                className="rounded border-slate-600 bg-slate-800 text-brand-500 focus:ring-brand-500 focus:ring-offset-slate-900"
                              />
                              <label htmlFor={`assign-${application.id}`} className="text-xs text-slate-300">
                                Assign as {application.role_name}
                              </label>
                            </div>
                            <div className="flex gap-2">
                              <button
                                onClick={() => {
                                  const checkbox = document.getElementById(`assign-${application.id}`);
                                  updateApplicationStatus(application.id, 'approved', checkbox.checked);
                                }}
                                className="rounded-xl bg-emerald-500/20 px-3 py-1 text-xs text-emerald-300 hover:bg-emerald-500/30 transition"
                              >
                                Approve
                              </button>
                              <button
                                onClick={() => updateApplicationStatus(application.id, 'rejected')}
                                className="rounded-xl bg-rose-500/20 px-3 py-1 text-xs text-rose-300 hover:bg-rose-500/30 transition"
                              >
                                Reject
                              </button>
                            </div>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

export default ManageChefApplications;
