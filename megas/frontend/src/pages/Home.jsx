import { Link } from 'react-router-dom';

function Home() {
  return (
    <div className="space-y-16">
      <section className="rounded-3xl border border-slate-800 bg-slate-900/95 p-10 shadow-2xl shadow-slate-950/20">
        <div className="grid gap-10 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
          <div>
            <p className="text-sm uppercase tracking-[0.35em] text-brand-400">MEGAS Agency</p>
            <h1 className="mt-6 text-5xl font-semibold tracking-tight text-white">Modern admin dashboards, agency services, and client workflows — built for growth.</h1>
            <p className="mt-6 max-w-2xl text-lg text-slate-400">
              Launch a business presence, manage orders, review applications, and collaborate through realtime chat with a unified enterprise control panel.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link to="/signup" className="rounded-full bg-brand-500 px-6 py-3 text-sm font-semibold text-white transition hover:bg-brand-400">
                Get started
              </Link>
              <Link to="/dashboard" className="rounded-full border border-slate-700 px-6 py-3 text-sm font-semibold text-slate-200 transition hover:border-brand-500 hover:text-white">
                Explore dashboard
              </Link>
            </div>
          </div>
          <div className="grid gap-4">
            <div className="rounded-3xl border border-slate-800 bg-slate-950/90 p-6 text-slate-200">
              <p className="text-sm uppercase tracking-[0.35em] text-slate-500">Trusted by teams</p>
              <p className="mt-4 text-3xl font-semibold text-white">120+</p>
              <p className="mt-3 text-slate-400">Projects handled across clients, pre-admin teams, and executive operations.</p>
            </div>
            <div className="rounded-3xl border border-slate-800 bg-slate-950/90 p-6 text-slate-200">
              <p className="text-sm uppercase tracking-[0.35em] text-slate-500">Realtime</p>
              <p className="mt-4 text-3xl font-semibold text-white">Chat & notifications</p>
              <p className="mt-3 text-slate-400">Track live conversations, support messages, and team alerts in a single platform.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-3">
        {[
          { title: 'Agency website', description: 'Showcase your services with modern landing pages and lead forms.' },
          { title: 'Job applications', description: 'Accept CV uploads, manage approvals, and communicate with candidates.' },
          { title: 'Client orders', description: 'Collect project briefs, budgets, and delivery deadlines in one place.' },
        ].map((item) => (
          <div key={item.title} className="rounded-3xl border border-slate-800 bg-slate-900/95 p-8 shadow-2xl shadow-slate-950/20">
            <p className="text-lg font-semibold text-white">{item.title}</p>
            <p className="mt-3 text-slate-400">{item.description}</p>
          </div>
        ))}
      </section>
    </div>
  );
}

export default Home;
