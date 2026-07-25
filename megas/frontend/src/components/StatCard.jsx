function StatCard({ title, value, subtitle }) {
  return (
    <div className="rounded-3xl border border-slate-800 bg-slate-900/90 p-6 shadow-2xl shadow-slate-950/30">
      <p className="text-sm uppercase tracking-[0.3em] text-slate-500">{title}</p>
      <p className="mt-4 text-4xl font-semibold text-white">{value}</p>
      {subtitle && <p className="mt-2 text-sm text-slate-400">{subtitle}</p>}
    </div>
  );
}

export default StatCard;
