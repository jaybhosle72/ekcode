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
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 flex items-center gap-2">
            <FiLayers className="text-[#3b82f6]" /> CPSE Code Harmonization & Migration Hub
          </h1>
          <p className="text-slate-500 text-xs sm:text-sm mt-1">
            Standardized mapping showing how legacy material codes across ONGC, BPCL, and IOC merge into One Central National Code.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            to="/matches"
            className="px-3.5 py-2 bg-[#3b82f6] hover:bg-blue-700 text-white rounded-lg text-xs sm:text-sm font-semibold shadow-sm transition-colors flex items-center gap-1.5"
          >
            <span>Review Unapproved Items</span>
            <FiExternalLink />
          </Link>
          <button 
            onClick={loadHarmonizationData}
            className="px-3.5 py-2 bg-white border border-slate-300 rounded-lg text-xs sm:text-sm text-slate-700 hover:bg-slate-50 font-semibold shadow-xs transition-colors cursor-pointer"
          >
            Refresh
          </button>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white border border-slate-200 shadow-sm rounded-xl p-4 flex flex-wrap justify-between items-center gap-4">
        <div className="flex flex-wrap gap-1.5">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`text-xs px-3 py-1.5 rounded-lg transition-colors cursor-pointer font-semibold ${
                selectedCategory === cat
                  ? 'bg-[#3b82f6] text-white'
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
            className="w-full bg-slate-50 border border-slate-300 rounded-lg py-1.5 pl-9 pr-3 text-xs text-slate-900 focus:outline-none focus:border-[#3b82f6]"
          />
        </div>
      </div>

      {loading ? (
        <div className="text-center py-24 text-slate-400">
          <div className="w-8 h-8 border-4 border-[#3b82f6] border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
          Loading harmonization mappings...
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-2">
              <FiCheckCircle className="text-emerald-600 text-sm" /> Standardized National Code Clusters ({filteredUnified.length})
            </h2>
            <span className="text-xs text-slate-400">Harmonized across ONGC, BPCL & IOC</span>
          </div>

          {filteredUnified.length === 0 ? (
            <div className="p-8 text-center bg-white border border-slate-200 rounded-xl text-slate-500 text-xs sm:text-sm shadow-sm">
              No unified codes found. Go to the <Link to="/matches" className="text-[#3b82f6] font-semibold hover:underline">Matches</Link> tab to approve duplicate items and generate new National Codes.
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {filteredUnified.map(u => (
                <div key={u._id} className="bg-white border border-slate-200 shadow-sm rounded-xl p-5 hover:border-blue-300 transition-all">
                  {/* Header: National Code Hub */}
                  <div className="flex justify-between items-start flex-wrap gap-2 pb-3 border-b border-slate-100">
                    <div>
                      <div className="flex items-center gap-2.5">
                        <span className="px-3 py-1 bg-blue-50 border border-blue-200 text-blue-700 font-mono font-bold text-xs sm:text-sm rounded-lg">
                          🏷️ {u.national_code}
                        </span>
                        <span className="text-[11px] px-2 py-0.5 rounded bg-slate-100 text-slate-600 font-semibold border border-slate-200">
                          {u.category}
                        </span>
                      </div>
                      <p className="text-slate-900 font-semibold text-xs sm:text-sm mt-2">
                        {u.standard_description}
                      </p>
                    </div>

                    <div className="text-right">
                      <span className="text-xs text-slate-400 font-medium">Projected Demand Savings:</span>
                      <div className="text-emerald-700 font-bold text-sm flex items-center justify-end gap-1">
                        <FiTrendingUp className="text-emerald-600" /> ₹{(u.estimated_savings || 0).toLocaleString()}
                      </div>
                    </div>
                  </div>

                  {/* Body: Connected CPSE Legacy Codes */}
                  <div className="mt-3">
                    <div className="text-[11px] text-slate-500 uppercase font-semibold tracking-wider mb-2">Harmonized CPSE Legacy Equivalents:</div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                      {(u.mapped_codes || []).map((mc, idx) => (
                        <div 
                          key={idx} 
                          className={`p-2.5 rounded-lg border flex flex-col justify-between ${
                            mc.cpse === 'ONGC' ? 'bg-rose-50 border-rose-200' :
                            mc.cpse === 'BPCL' ? 'bg-blue-50 border-blue-200' :
                            'bg-amber-50 border-amber-200'
                          }`}
                        >
                          <div className="flex justify-between items-center mb-1">
                            <span className={`text-[10px] font-bold ${
                              mc.cpse === 'ONGC' ? 'text-rose-700' :
                              mc.cpse === 'BPCL' ? 'text-blue-700' :
                              'text-amber-700'
                            }`}>
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
