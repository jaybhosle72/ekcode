function StatsCard({ icon, title, value, subtitle }) {
  return (
    <div className="bg-white/95 backdrop-blur-xs p-5 rounded-2xl border border-slate-200/80 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between h-full">
      <div className="flex items-center justify-between">
        <div className="text-slate-500 text-[11px] font-bold uppercase tracking-wider">{title}</div>
        <div className="w-9 h-9 rounded-xl bg-blue-50 border border-blue-200/60 flex items-center justify-center text-blue-600 text-lg shadow-2xs">{icon}</div>
      </div>
      <div className="mt-3">
        <div className="text-2xl font-black text-slate-900 tracking-tight">{value}</div>
        {subtitle && <div className="text-xs text-slate-400 mt-0.5 font-medium">{subtitle}</div>}
      </div>
    </div>
  );
}

export default StatsCard;
