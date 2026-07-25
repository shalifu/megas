function Portfolio() {
  return (
    <div className="space-y-10">
      <section className="rounded-3xl border border-slate-800 bg-slate-900/95 p-10 shadow-2xl shadow-slate-950/20">
        <p className="text-sm uppercase tracking-[0.35em] text-brand-400">Portfolio</p>
        <h1 className="mt-5 text-4xl font-semibold text-white">Showcasing modern dashboards, landing pages, and workflows.</h1>
      </section>

      <div className="grid gap-6 lg:grid-cols-3">
        {[
          { title: 'Business Portal', label: 'Admin overview, order tracking, and analytics.' },
          { title: 'Candidate Hub', label: 'Job applications, CV tracking, and client communication.' },
          { title: 'Service Board', label: 'Order management, task assignment, and support chat.' },
        ].map((item) => (
          <div key={item.title} className="rounded-3xl border border-slate-800 bg-slate-900/95 p-8 shadow-2xl shadow-slate-950/20">
            <p className="text-lg font-semibold text-white">{item.title}</p>
            <p className="mt-3 text-slate-400">{item.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Portfolio;
