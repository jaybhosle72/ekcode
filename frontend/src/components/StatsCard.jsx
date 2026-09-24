function StatsCard({ icon, title, value, subtitle, color = 'blue' }) {
  const colorMap = {
    blue: {
      bg: 'bg-blue-50 text-blue-600 border-blue-100',
      borderHover: 'hover:border-blue-300'
    },
    amber: {
      bg: 'bg-amber-50 text-amber-600 border-amber-100',
      borderHover: 'hover:border-amber-300'
    },
    purple: {
      bg: 'bg-indigo-50 text-indigo-600 border-indigo-100',
      borderHover: 'hover:border-indigo-300'
    },
    emerald: {
      bg: 'bg-emerald-50 text-emerald-600 border-emerald-100',
      borderHover: 'hover:border-emerald-300'
    },
    cyan: {
      bg: 'bg-sky-50 text-sky-600 border-sky-100',
      borderHover: 'hover:border-sky-300'
    }
  };

  const scheme = colorMap[color] || colorMap.blue;

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
