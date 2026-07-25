function Services() {
  return (
    <div className="space-y-10">
      <section className="rounded-3xl border border-slate-800 bg-slate-900/95 p-10 shadow-2xl shadow-slate-950/20">
        <p className="text-sm uppercase tracking-[0.35em] text-brand-400">Services</p>
        <h1 className="mt-5 text-4xl font-semibold text-white">Complete service packages for businesses and agencies.</h1>
      </section>

      <div className="grid gap-6 lg:grid-cols-3">
        {[
          { title: 'Web Development', description: 'Custom business sites, landing pages, e-commerce stores, and admin flows.' },
          { title: 'Software Projects', description: 'Client portals, CRM tools, analytics dashboards, and internal apps.' },
          { title: 'Mobile Apps', description: 'Cross-platform mobile experiences for clients and team communication.' },
        ].map((item) => (
          <div key={item.title} className="rounded-3xl border border-slate-800 bg-slate-900/95 p-8 shadow-2xl shadow-slate-950/20">
            <p className="text-lg font-semibold text-white">{item.title}</p>
            <p className="mt-3 text-slate-400">{item.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Services;
