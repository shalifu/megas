import { Link } from 'react-router-dom';

function Careers() {
  return (
    <div className="space-y-10">
      <section className="rounded-3xl border border-slate-800 bg-slate-900/95 p-10 shadow-2xl shadow-slate-950/20">
        <p className="text-sm uppercase tracking-[0.35em] text-brand-400">Careers</p>
        <h1 className="mt-5 text-4xl font-semibold text-white">Join our team as we scale client success and internal operations.</h1>
        <p className="mt-6 text-lg leading-8 text-slate-400">
          Apply to take part in admin systems, security operations, development leadership, and marketing roles for a growing digital business.
        </p>
      </section>

      <div className="grid gap-6 lg:grid-cols-3">
        {[
          { role: 'Chief of Security', description: 'Protect admin systems, define access rules, and maintain security workflows.' },
          { role: 'Chief Developer', description: 'Lead development teams, approve orders, and manage project delivery.' },
          { role: 'HR Manager', description: 'Review applications, approve profiles, and support team onboarding.' },
        ].map((job) => (
          <div key={job.role} className="rounded-3xl border border-slate-800 bg-slate-900/95 p-8 shadow-2xl shadow-slate-950/20">
            <p className="text-lg font-semibold text-white">{job.role}</p>
            <p className="mt-3 text-slate-400">{job.description}</p>
            <Link to="/signup" className="mt-6 inline-flex rounded-full bg-brand-500 px-5 py-3 text-sm font-semibold text-white hover:bg-brand-400">
              Apply now
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Careers;
