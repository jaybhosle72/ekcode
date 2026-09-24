function StatsCard({ icon, title, value, subtitle }) {
  return (
    <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between h-full">
      <div className="flex items-center justify-between">
        <div className="text-slate-500 text-xs font-semibold uppercase tracking-wider">{title}</div>
        <div className="text-[#3b82f6] text-xl bg-blue-50 border border-blue-100 p-2 rounded-lg">{icon}</div>
      </div>
      <div className="mt-3">
        <div className="text-2xl font-bold text-slate-800">{value}</div>
        {subtitle && <div className="text-xs text-slate-400 mt-1">{subtitle}</div>}
      </div>
    </div>
  );
}

export default StatsCard;
