function About() {
  return (
    <div className="space-y-10">
      <section className="rounded-3xl border border-slate-800 bg-slate-900/95 p-10 shadow-2xl shadow-slate-950/20">
        <p className="text-sm uppercase tracking-[0.35em] text-brand-400">About us</p>
        <h1 className="mt-5 text-4xl font-semibold text-white">We build powerful admin systems for modern service brands.</h1>
        <p className="mt-6 text-lg leading-8 text-slate-400">
          MEGAS combines frontend polish with backend security so teams can onboard clients, manage orders, approve applicants, and collaborate using a beautiful dashboard.
        </p>
      </section>

      <section className="grid gap-6 lg:grid-cols-3">
        {[
          { title: 'Mission', description: 'Deliver responsive, role-based admin experiences with flexible workflows.' },
          { title: 'Vision', description: 'Bridge client-facing pages and internal operations with realtime collaboration.' },
          { title: 'Security', description: 'JWT auth, bcrypt hashing, role permissions, and protected REST APIs.' },
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

export default About;
