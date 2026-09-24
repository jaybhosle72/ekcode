import { useState, useEffect } from 'react';
import MatchCard from '../components/MatchCard';
import { getMatches, approveMatch, rejectMatch } from '../services/api';
import toast from 'react-hot-toast';

function Matches() {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('pending');
  const [typeFilter, setTypeFilter] = useState('all');

  useEffect(() => {
    fetchMatches();
  }, [statusFilter, typeFilter]);

  const fetchMatches = async () => {
    try {
      setLoading(true);
      const params = {};
      if (statusFilter !== 'all') params.status = statusFilter;
      if (typeFilter !== 'all') params.match_type = typeFilter;

      const res = await getMatches(params);
      
      const formatted = res.data.map(m => {
        const matA = m.material_a || {};
        const matB = m.material_b || {};
        const specsA = matA.specifications || {};
        const specsB = matB.specifications || {};

        const compareField = (label, a, b) => {
          if (!a && !b) return { field: label, valueA: '-', valueB: '-', matchStatus: 'exact' };
          const exact = String(a).toLowerCase().trim() === String(b).toLowerCase().trim();
          return {
            field: label,
            valueA: a || '-',
            valueB: b || '-',
            matchStatus: exact ? 'exact' : (a && b ? 'partial' : 'mismatch')
          };
        };

        const comparison = [
          compareField('Material', specsA.material, specsB.material),
          compareField('Size / Dimensions', specsA.dimensions, specsB.dimensions),
          compareField('Pressure Class', specsA.pressure_rating, specsB.pressure_rating),
          compareField('Standard (ASTM/IS)', specsA.standard, specsB.standard),
          compareField('UOM', matA.unit_of_measure, matB.unit_of_measure)
        ];

        return {
          id: m._id,
          score: m.match_score,
          type: m.match_type,
          status: m.status,
          nationalCode: m.suggested_national_code,
          materialA: {
            cpse: matA.cpse_name || 'CPSE-1',
            code: matA.original_code || 'N/A',
            description: matA.description || 'No description available'
          },
          materialB: {
            cpse: matB.cpse_name || 'CPSE-2',
            code: matB.original_code || 'N/A',
            description: matB.description || 'No description available'
          },
          comparison,
          reasoning: m.ai_reasoning || 'Attributes match based on NLP similarity.'
        };
      });

      setMatches(formatted);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load matches');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id) => {
    try {
      await approveMatch(id);
      toast.success('Match approved! National Code registered.');
    } catch (err) {
      console.error(err);
      toast.error('Failed to approve match');
    }
  };

  const handleReject = async (id) => {
    try {
      await rejectMatch(id);
      toast.error('Match rejected.');
    } catch (err) {
      console.error(err);
      toast.error('Failed to reject match');
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex justify-between items-end flex-wrap gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">AI Duplicate & Equivalence Matcher</h1>
          <p className="text-slate-500 text-xs sm:text-sm mt-1">
            Explainable AI comparison of items across CPSEs with human-in-the-loop validation workflow.
          </p>
        </div>
        
        <div className="flex flex-wrap gap-2">
          <select 
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="bg-white border border-slate-300 rounded-lg py-2 px-3 text-xs sm:text-sm text-slate-700 font-semibold focus:outline-none focus:border-[#3b82f6] shadow-xs cursor-pointer"
          >
            <option value="pending">Status: Pending Review</option>
            <option value="approved">Status: Approved</option>
            <option value="rejected">Status: Rejected</option>
            <option value="all">Status: All</option>
          </select>
          <select 
            value={typeFilter}
            onChange={e => setTypeFilter(e.target.value)}
            className="bg-white border border-slate-300 rounded-lg py-2 px-3 text-xs sm:text-sm text-slate-700 font-semibold focus:outline-none focus:border-[#3b82f6] shadow-xs cursor-pointer"
          >
            <option value="all">Match Type: All</option>
            <option value="identical">Identical</option>
            <option value="near-duplicate">Near-Duplicate</option>
            <option value="equivalent">Equivalent</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-24 text-slate-400">
          <div className="w-10 h-10 border-4 border-[#3b82f6] border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Loading cross-CPSE matches...</p>
        </div>
      ) : matches.length === 0 ? (
        <div className="text-center py-16 bg-white border border-slate-200 rounded-xl text-slate-500 shadow-sm p-6">
          No matches found for the selected filter.
        </div>
      ) : (
        <div className="space-y-4">
          {matches.map(match => (
            <MatchCard 
              key={match.id} 
              matchData={match} 
              onApprove={handleApprove} 
              onReject={handleReject} 
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default Matches;
