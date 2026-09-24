import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getUnifiedMaterials } from '../services/api';
import { FiLayers, FiSearch, FiArrowRight, FiCheckCircle, FiTrendingUp, FiExternalLink } from 'react-icons/fi';
import toast from 'react-hot-toast';

function KnowledgeGraph() {
  const [unifiedList, setUnifiedList] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadHarmonizationData();
  }, []);

  const loadHarmonizationData = async () => {
    try {
      setLoading(true);
      const uRes = await getUnifiedMaterials();
      setUnifiedList(uRes.data || []);
    } catch (err) {
      console.error('Harmonization load error:', err);
      toast.error('Failed to load harmonization data');
    } finally {
      setLoading(false);
    }
  };

  const categories = ['ALL', 'Pipes', 'Valves', 'Fasteners', 'Fittings', 'Electrical', 'Instruments', 'Safety', 'Chemicals'];

  const getCpseBadge = (cpse) => {
    switch (cpse?.toUpperCase()) {
      case 'ONGC': return 'bg-rose-50 text-rose-700 border-rose-200';
      case 'BPCL': return 'bg-slate-100 text-slate-700 border-slate-200';
      case 'IOC': return 'bg-amber-50 text-amber-700 border-amber-200';
      default: return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  const filteredUnified = unifiedList.filter(u => {
    const catMatch = selectedCategory === 'ALL' || (u.category || '').toLowerCase() === selectedCategory.toLowerCase();
    const q = search.toLowerCase();
    const textMatch = !q || 
      (u.national_code || '').toLowerCase().includes(q) ||
      (u.standard_description || '').toLowerCase().includes(q) ||
      (u.mapped_codes || []).some(c => (c.code || '').toLowerCase().includes(q) || (c.cpse || '').toLowerCase().includes(q));
    return catMatch && textMatch;
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end flex-wrap gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <FiLayers className="text-slate-700" /> CPSE Code Harmonization & Migration Hub
          </h1>
          <p className="text-slate-500 text-xs sm:text-sm mt-0.5">
            Standardized mapping showing how legacy material codes across ONGC, BPCL, and IOC merge into One Central National Code.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            to="/matches"
            className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-medium shadow-xs transition-colors flex items-center gap-1.5"
          >
            <span>Review Unapproved Items</span>
            <FiExternalLink />
          </Link>
          <button 
            onClick={loadHarmonizationData}
            className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs text-slate-700 hover:text-slate-900 hover:bg-slate-50 font-medium shadow-2xs transition-colors cursor-pointer"
          >
            Refresh
          </button>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white border border-slate-200 shadow-2xs rounded-xl p-3 sm:p-4 flex flex-wrap justify-between items-center gap-3">
        <div className="flex flex-wrap gap-1.5">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`text-xs px-2.5 py-1 rounded-md transition-colors cursor-pointer font-medium ${
                selectedCategory === cat
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:text-slate-900'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="relative w-full md:w-80">
          <FiSearch className="absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search national code, legacy code, or specs..."
            className="w-full bg-white border border-slate-200 rounded-lg py-1.5 pl-9 pr-3 text-xs text-slate-900 focus:outline-none focus:border-slate-900"
          />
        </div>
      </div>

      {loading ? (
        <div className="text-center py-24 text-slate-400">
          <div className="w-8 h-8 border-2 border-slate-800 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-xs font-medium uppercase tracking-wider text-slate-500">Loading harmonization mappings...</p>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-500 flex items-center gap-2">
              <FiCheckCircle className="text-slate-700 text-sm" /> Standardized National Code Clusters ({filteredUnified.length})
            </h2>
            <span className="text-xs text-slate-400">Harmonized across ONGC, BPCL & IOC</span>
          </div>

          {filteredUnified.length === 0 ? (
            <div className="p-8 text-center bg-white border border-slate-200 rounded-xl text-slate-500 text-xs shadow-2xs">
              No unified codes found. Go to the <Link to="/matches" className="text-slate-900 font-semibold hover:underline">Matches</Link> tab to approve duplicate items and generate new National Codes.
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-3.5">
              {filteredUnified.map(u => (
                <div key={u._id} className="bg-white border border-slate-200 shadow-2xs rounded-xl p-4 sm:p-5 hover:border-slate-300 transition-all">
                  {/* Header: National Code Hub */}
                  <div className="flex justify-between items-start flex-wrap gap-2 pb-3 border-b border-slate-100">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-0.5 bg-slate-100 border border-slate-200 text-slate-900 font-mono font-semibold text-xs rounded-md">
                          {u.national_code}
                        </span>
                        <span className="text-[10px] px-2 py-0.5 rounded bg-slate-100 text-slate-600 font-medium border border-slate-200">
                          {u.category}
                        </span>
                      </div>
                      <p className="text-slate-900 font-medium text-xs sm:text-sm mt-1.5">
                        {u.standard_description}
                      </p>
                    </div>

                    <div className="text-right">
                      <span className="text-[11px] text-slate-400 font-medium">Projected Savings:</span>
                      <div className="text-emerald-600 font-bold text-xs sm:text-sm flex items-center justify-end gap-1">
                        <FiTrendingUp className="text-emerald-600" /> ₹{(u.estimated_savings || 0).toLocaleString()}
                      </div>
                    </div>
                  </div>

                  {/* Body: Connected CPSE Legacy Codes */}
                  <div className="mt-3">
                    <div className="text-[10px] text-slate-400 uppercase font-semibold tracking-wider mb-2">Harmonized CPSE Legacy Equivalents:</div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
                      {(u.mapped_codes || []).map((mc, idx) => (
                        <div 
                          key={idx} 
                          className="p-2.5 rounded-lg border border-slate-200 bg-slate-50/60 flex flex-col justify-between"
                        >
                          <div className="flex justify-between items-center mb-1">
                            <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded border ${getCpseBadge(mc.cpse)}`}>
                              {mc.cpse} Legacy Code
                            </span>
                            <FiArrowRight className="text-slate-400 text-xs" />
                          </div>
                          <div className="font-mono text-xs font-semibold text-slate-800">
                            {mc.code}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default KnowledgeGraph;
