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

  const COLORS = ['#3b82f6', '#22c55e', '#eab308', '#ef4444', '#8b5cf6', '#06b6d4'];

  if (loading || !stats) {
    return (
      <div className="flex items-center justify-center py-28 text-slate-400">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-4 border-[#3b82f6] border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-xs font-semibold uppercase tracking-wider">Loading real-time material master analytics...</p>
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
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">EkCode Dashboard</h1>
          <p className="text-slate-500 text-xs sm:text-sm mt-1">
            Overview of material standardization across CPSEs (ONGC, BPCL, IOC)
          </p>
        </div>
        <button 
          onClick={fetchStats}
          className="text-xs bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 px-4 py-2 rounded-lg transition-colors font-semibold shadow-xs cursor-pointer"
        >
          Refresh Live Data
        </button>
      </div>

      {/* Metrics Row: Responsive 1 col -> 2 col -> 3 col -> 6 col */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
        <StatsCard icon={<MdStorage />} title="Total Materials" value={stats.totalMaterials || 0} subtitle="Across CPSEs" />
        <StatsCard icon={<MdLink />} title="Duplicates Found" value={stats.totalMatches || 0} subtitle={`${stats.duplicatesFound || 0} High Confidence`} />
        <StatsCard icon={<MdPending />} title="Pending Review" value={stats.pendingMatches || 0} subtitle="Awaiting Action" />
        <StatsCard icon={<MdCheckCircle />} title="Approved Pairs" value={stats.approvedMatches || 0} subtitle="Unified Nationally" />
        <StatsCard icon={<MdCode />} title="National Codes" value={stats.totalUnified || 0} subtitle="Central Catalog" />
        <StatsCard icon={<MdTrendingUp />} title="Est. Savings" value={formatCurrency(stats.savingsEstimate)} subtitle="Bulk Demand Pooling" />
      </div>

      {/* Clean Slate Onboarding Prompt */}
      {(!stats.totalMaterials || stats.totalMaterials === 0) && (
        <div className="bg-white border border-blue-200 rounded-xl p-6 text-center space-y-2 shadow-xs">
          <h3 className="text-sm sm:text-base font-bold text-slate-800">
            🚀 Ready for External CPSE Catalog Ingestion
          </h3>
          <p className="text-xs sm:text-sm text-slate-500 max-w-xl mx-auto">
            The database is currently clean. Sign in as an authorized CPSE Procurement Officer to upload catalog spreadsheets (.xlsx / .csv). The EkCode AI engine will automatically extract technical specifications and detect cross-enterprise duplicates.
          </p>
        </div>
      )}

      {/* Analytics Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* CPSE Distribution */}
        <div className="bg-white border border-slate-200 shadow-sm rounded-xl p-5">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-4">Materials Ingested per CPSE</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={cpseChartData}>
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} />
                <YAxis stroke="#94a3b8" fontSize={11} />
                <Tooltip contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', borderRadius: '8px', color: '#0f172a', fontSize: '12px' }} />
                <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Match Classification */}
        <div className="bg-white border border-slate-200 shadow-sm rounded-xl p-5">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-4">Duplicate Match Types</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={matchTypeData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={4}
                  dataKey="value"
                  label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                >
                  {matchTypeData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', borderRadius: '8px', color: '#0f172a', fontSize: '12px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category Breakdown */}
        <div className="bg-white border border-slate-200 shadow-sm rounded-xl p-5">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-4">Category Breakdown</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={categoryChartData} layout="vertical">
                <XAxis type="number" stroke="#94a3b8" fontSize={11} />
                <YAxis dataKey="name" type="category" stroke="#94a3b8" fontSize={10} width={85} />
                <Tooltip contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', borderRadius: '8px', color: '#0f172a', fontSize: '12px' }} />
                <Bar dataKey="count" fill="#6366f1" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
