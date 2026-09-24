function StatsCard({ icon, title, value, subtitle, color = 'slate' }) {
  const colorMap = {
    slate: {
      bg: 'bg-slate-100 text-slate-700 border-slate-200',
      borderHover: 'hover:border-slate-300'
    },
    blue: {
      bg: 'bg-[#4b80d6]/10 text-[#4b80d6] border-[#4b80d6]/25',
      borderHover: 'hover:border-[#4b80d6]/40'
    },
    amber: {
      bg: 'bg-amber-50 text-amber-700 border-amber-200',
      borderHover: 'hover:border-amber-300'
    },
    emerald: {
      bg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      borderHover: 'hover:border-emerald-300'
    }
  };

  const scheme = colorMap[color] || colorMap.slate;

  return (
    <div className={`bg-white p-4 sm:p-5 rounded-xl border border-slate-200/90 shadow-2xs ${scheme.borderHover} hover:shadow-sm transition-all duration-200 flex flex-col justify-between h-full group`}>
      <div className="flex items-center justify-between">
        <span className="text-slate-500 text-[11px] font-semibold uppercase tracking-wider">{title}</span>
        <span className={`w-8 h-8 rounded-lg flex items-center justify-center text-base border ${scheme.bg} transition-transform group-hover:scale-105`}>
          {icon}
        </span>
      </div>
      <div className="mt-3">
        <div className={`text-2xl font-bold tracking-tight ${color === 'emerald' && title.includes('Savings') ? 'text-emerald-700' : 'text-slate-900'}`}>
          {value}
        </div>
        {subtitle && <div className="text-[11px] text-slate-500 mt-0.5 font-medium">{subtitle}</div>}
      </div>
    </div>
  );
}

export default StatsCard;
