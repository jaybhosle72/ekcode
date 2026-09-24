import { useState, useEffect } from 'react';
import StatsCard from '../components/StatsCard';
import { MdStorage, MdLink, MdPending, MdCheckCircle, MdCode, MdTrendingUp } from 'react-icons/md';
import { getDashboardStats } from '../services/api';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

function Dashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const res = await getDashboardStats();
      setStats(res.data);
    } catch (err) {
      console.error('Error fetching dashboard stats:', err);
    } finally {
      setLoading(false);
    }
  };

  const COLORS = ['#0f172a', '#2563eb', '#059669', '#d97706', '#64748b', '#7c3aed'];

  if (loading || !stats) {
    return (
      <div className="flex items-center justify-center py-28 text-slate-400">
        <div className="text-center space-y-3">
          <div className="w-8 h-8 border-2 border-slate-800 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-xs font-medium uppercase tracking-wider text-slate-500">Loading master analytics...</p>
        </div>
      </div>
    );
  }

  const formatCurrency = (val) => {
    if (!val) return '₹0';
    if (val >= 10000000) return `₹${(val / 10000000).toFixed(2)} Cr`;
    if (val >= 100000) return `₹${(val / 100000).toFixed(1)} Lakh`;
    return `₹${val.toLocaleString()}`;
  };

  const cpseChartData = (stats.materialsByCpse || []).map(item => ({
    name: item._id || 'Unknown',
    count: item.count
  }));

  const matchTypeData = (stats.matchesByType || []).map(item => ({
    name: (item._id || 'Other').replace('-', ' ').toUpperCase(),
    value: item.count
  }));

  const categoryChartData = (stats.materialsByCategory || []).map(item => ({
    name: item._id || 'General',
    count: item.count
  }));

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex justify-between items-end flex-wrap gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">EkCode Dashboard</h1>
          <p className="text-slate-500 text-xs sm:text-sm mt-0.5">
            Material standardization analytics across CPSEs (ONGC, BPCL, IOC)
          </p>
        </div>
        <button 
          onClick={fetchStats}
          className="text-xs bg-white border border-slate-200 text-slate-700 hover:text-slate-900 hover:bg-slate-50 px-3 py-1.5 rounded-lg transition-colors font-medium shadow-2xs cursor-pointer"
        >
          Refresh Live Data
        </button>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3.5">
        <StatsCard icon={<MdStorage />} title="Total Materials" value={stats.totalMaterials || 0} subtitle="Across CPSEs" />
        <StatsCard icon={<MdLink />} title="Duplicates Found" value={stats.totalMatches || 0} subtitle={`${stats.duplicatesFound || 0} High Confidence`} />
        <StatsCard icon={<MdPending />} title="Pending Review" value={stats.pendingMatches || 0} subtitle="Awaiting Action" />
        <StatsCard icon={<MdCheckCircle />} title="Approved Pairs" value={stats.approvedMatches || 0} subtitle="Unified Nationally" />
        <StatsCard icon={<MdCode />} title="National Codes" value={stats.totalUnified || 0} subtitle="Central Catalog" />
        <StatsCard icon={<MdTrendingUp />} title="Est. Savings" value={formatCurrency(stats.savingsEstimate)} subtitle="Bulk Demand Pooling" />
      </div>

      {/* Clean Slate Onboarding Prompt */}
      {(!stats.totalMaterials || stats.totalMaterials === 0) && (
        <div className="bg-white border border-slate-200 rounded-xl p-6 text-center space-y-2 shadow-2xs">
          <h3 className="text-sm font-semibold text-slate-900">
            Ready for External CPSE Catalog Ingestion
          </h3>
          <p className="text-xs text-slate-500 max-w-xl mx-auto leading-relaxed">
            The database is currently clean. Sign in as an authorized CPSE Procurement Officer to upload catalog spreadsheets (.xlsx / .csv). The EkCode AI engine will automatically extract technical specifications and detect cross-enterprise duplicates.
          </p>
        </div>
      )}

      {/* Analytics Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* CPSE Distribution */}
        <div className="bg-white border border-slate-200 shadow-2xs rounded-xl p-4 sm:p-5">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-4">Materials Ingested per CPSE</h2>
          <div className="h-60">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={cpseChartData}>
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} />
                <YAxis stroke="#94a3b8" fontSize={11} />
                <Tooltip contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', borderRadius: '8px', color: '#0f172a', fontSize: '11px', boxShadow: '0 2px 4px 0 rgb(0 0 0 / 0.05)' }} />
                <Bar dataKey="count" fill="#0f172a" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Match Classification */}
        <div className="bg-white border border-slate-200 shadow-2xs rounded-xl p-4 sm:p-5">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-4">Duplicate Match Types</h2>
          <div className="h-60">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={matchTypeData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={75}
                  paddingAngle={3}
                  dataKey="value"
                  label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                >
                  {matchTypeData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', borderRadius: '8px', color: '#0f172a', fontSize: '11px', boxShadow: '0 2px 4px 0 rgb(0 0 0 / 0.05)' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category Breakdown */}
        <div className="bg-white border border-slate-200 shadow-2xs rounded-xl p-4 sm:p-5">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-4">Category Breakdown</h2>
          <div className="h-60">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={categoryChartData} layout="vertical">
                <XAxis type="number" stroke="#94a3b8" fontSize={11} />
                <YAxis dataKey="name" type="category" stroke="#94a3b8" fontSize={10} width={85} />
                <Tooltip contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', borderRadius: '8px', color: '#0f172a', fontSize: '11px', boxShadow: '0 2px 4px 0 rgb(0 0 0 / 0.05)' }} />
                <Bar dataKey="count" fill="#334155" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
