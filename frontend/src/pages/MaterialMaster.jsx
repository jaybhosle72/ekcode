import { useState, useEffect } from 'react';
import { getUnifiedMaterials } from '../services/api';
import { FiDownload, FiSearch, FiCheckCircle } from 'react-icons/fi';
import toast from 'react-hot-toast';

function MaterialMaster() {
  const [unifiedList, setUnifiedList] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUnified();
  }, []);

  const fetchUnified = async () => {
    try {
      setLoading(true);
      const res = await getUnifiedMaterials();
      setUnifiedList(res.data);
      setFiltered(res.data);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load unified materials');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!search.trim()) {
      setFiltered(unifiedList);
      return;
    }
    const q = search.toLowerCase();
    const result = unifiedList.filter(item => {
      const matchCode = (item.national_code || '').toLowerCase().includes(q);
      const matchDesc = (item.standard_description || '').toLowerCase().includes(q);
      const matchCat = (item.category || '').toLowerCase().includes(q);
      const matchLegacy = (item.mapped_codes || []).some(c => 
        (c.code || '').toLowerCase().includes(q) || (c.cpse || '').toLowerCase().includes(q)
      );
      return matchCode || matchDesc || matchCat || matchLegacy;
    });
    setFiltered(result);
  }, [search, unifiedList]);

  const exportCSV = () => {
    if (unifiedList.length === 0) {
      toast.error('No materials available to export');
      return;
    }
    const headers = ['National Code,Standard Description,Category,Mapped CPSE Codes,Aggregated Annual Qty,Estimated Savings (INR)'];
    const rows = unifiedList.map(item => {
      const mapped = (item.mapped_codes || []).map(c => `${c.cpse}:${c.code}`).join('; ');
      return `"${item.national_code}","${item.standard_description}","${item.category}","${mapped}",${item.total_annual_quantity || 0},${item.estimated_savings || 0}`;
    });
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers, ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `National_Material_Master_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Downloaded National Material Master CSV');
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end flex-wrap gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <FiCheckCircle className="text-slate-700" /> One Nation, One Material Code Master
          </h1>
          <p className="text-slate-500 text-xs sm:text-sm mt-0.5">
            Centralized National Catalog of standardized, deduplicated materials with cross-CPSE backward traceability.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button 
            onClick={fetchUnified}
            className="px-3.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs text-slate-700 hover:text-slate-900 hover:bg-slate-50 font-semibold shadow-2xs transition-colors cursor-pointer"
          >
            Refresh
          </button>
          <button 
            onClick={exportCSV}
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold shadow-xs transition-all cursor-pointer"
          >
            <FiDownload /> Export Master CSV
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="p-3.5 border-b border-slate-100 flex justify-between items-center bg-slate-50/60 flex-wrap gap-3">
          <div className="relative w-full md:w-80">
            <FiSearch className="absolute left-3 top-2.5 text-slate-400" />
            <input 
              type="text" 
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search code, description, or CPSE..." 
              className="w-full bg-white border border-slate-200 rounded-lg py-1.5 pl-9 pr-3 text-xs text-slate-900 focus:outline-none focus:border-slate-900"
            />
          </div>
          <span className="text-xs text-slate-500 font-medium">
            Showing <strong className="text-slate-900">{filtered.length}</strong> standardized materials
          </span>
        </div>

        {loading ? (
          <div className="text-center py-24 text-slate-400">
            <div className="w-8 h-8 border-2 border-slate-800 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Loading National Material Master...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 text-slate-500 text-xs">
            No standardized materials found. Approve duplicate matches in the <strong className="text-slate-800">Matches</strong> tab to generate National Codes.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left min-w-[700px]">
              <thead className="text-[11px] text-slate-600 uppercase bg-slate-50/80 border-b border-slate-200 font-semibold">
                <tr>
                  <th className="px-4 py-2.5">National Code</th>
                  <th className="px-4 py-2.5">Standardized Description</th>
                  <th className="px-4 py-2.5">Category</th>
                  <th className="px-4 py-2.5">Mapped CPSE Legacy Codes</th>
                  <th className="px-4 py-2.5 text-right">Aggregated Qty</th>
                  <th className="px-4 py-2.5 text-right">Est. Savings (₹)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map(m => (
                  <tr key={m._id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="px-4 py-3 font-mono font-bold text-slate-900 whitespace-nowrap">
                      {m.national_code}
                    </td>
                    <td className="px-4 py-3 text-slate-800 font-medium max-w-md">
                      {m.standard_description}
                    </td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-0.5 rounded bg-slate-100 text-[10px] font-semibold text-slate-600 border border-slate-200">
                        {m.category || 'General'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1 max-w-xs">
                        {(m.mapped_codes || []).map((c, idx) => (
                          <span 
                            key={idx} 
                            className={`px-2 py-0.5 text-[10px] font-mono rounded border font-semibold ${
                              c.cpse === 'ONGC' ? 'bg-rose-50 text-rose-700 border-rose-200' :
                              c.cpse === 'BPCL' ? 'bg-slate-100 text-slate-700 border-slate-200' :
                              'bg-amber-50 text-amber-700 border-amber-200'
                            }`}
                          >
                            <strong>{c.cpse}:</strong> {c.code}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right text-slate-700 font-semibold">
                      {(m.total_annual_quantity || 0).toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-right text-emerald-700 font-bold whitespace-nowrap bg-emerald-50/40">
                      ₹{((m.estimated_savings || 0)).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default MaterialMaster;
