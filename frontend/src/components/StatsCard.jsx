function StatsCard({ icon, title, value, subtitle }) {
  return (
    <div className="bg-white p-4 sm:p-5 rounded-xl border border-slate-200 shadow-2xs hover:border-slate-300 transition-colors flex flex-col justify-between h-full">
      <div className="flex items-center justify-between">
        <span className="text-slate-500 text-[11px] font-semibold uppercase tracking-wider">{title}</span>
        <span className="text-slate-400 text-lg">{icon}</span>
      </div>
      <div className="mt-3">
        <div className="text-2xl font-bold text-slate-900 tracking-tight">{value}</div>
        {subtitle && <div className="text-[11px] text-slate-500 mt-0.5 font-normal">{subtitle}</div>}
      </div>
    </div>
  );
}

export default StatsCard;
