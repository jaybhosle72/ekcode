import { useState, useEffect } from 'react';
import MatchCard from '../components/MatchCard';
import { getMatches, approveMatch, rejectMatch, endorseMatch } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { FiCheckCircle, FiShield, FiAward, FiLayers } from 'react-icons/fi';
import toast from 'react-hot-toast';

function Matches() {
  const { currentUser, currentRole } = useAuth();
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
          technical_endorsement: m.technical_endorsement,
          reviewed_by: m.reviewed_by,
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

  // TIER 1: Technical Parity Endorsement (by CPSE Officer)
  const handleEndorse = async (id) => {
    try {
      const payload = {
        officer_name: currentUser?.name || 'CPSE Procurement Officer',
        cpse: currentUser?.cpse_organization || 'CPSE',
        designation: currentUser?.designation || 'Materials & Procurement Specialist',
        notes: 'Verified metallurgical, dimension, and pressure class equivalence.'
      };
      await endorseMatch(id, payload);
      toast.success(`Technical parity endorsed by ${payload.cpse}! Forwarded to MoPNG for Sovereign Ratification.`);
      setMatches(prev => prev.map(m => m.id === id ? {
        ...m,
        status: 'endorsed',
        technical_endorsement: {
          endorsed_by: payload.officer_name,
          cpse: payload.cpse,
          designation: payload.designation,
          endorsed_at: new Date()
        }
      } : m));
    } catch (err) {
      console.error(err);
      toast.error('Failed to endorse match');
    }
  };

  // TIER 2: Sovereign Ratification & National Code Issuance (by MoPNG Central Authority)
  const handleApprove = async (id) => {
    try {
      const reviewerTag = currentRole === 'admin'
        ? `${currentUser?.name || 'Dr. Rajesh Verma'} (MoPNG Central Standardization Committee)`
        : `${currentUser?.name || 'Authorized Official'} (${currentUser?.cpse_organization || 'MoPNG'})`;
      
      const res = await approveMatch(id, reviewerTag);
      const mintedCode = res.data?.unifiedMaterial?.national_code || res.data?.match?.suggested_national_code || 'IND-UNIFIED-CODE';
      
      toast.success(`Sovereign Ratification issued! Minted National Code: ${mintedCode}`);
      setMatches(prev => prev.map(m => m.id === id ? {
        ...m,
        status: 'approved',
        nationalCode: mintedCode,
        reviewed_by: reviewerTag
      } : m));
      return { nationalCode: mintedCode };
    } catch (err) {
      console.error(err);
      toast.error('Failed to grant sovereign ratification');
      throw err;
    }
  };

  // Flag Mismatch / Rejection
  const handleReject = async (id) => {
    try {
      const reviewerTag = currentUser 
        ? `${currentUser.name} (${currentUser.cpse_organization || 'CPSE'})` 
        : 'Authorized Reviewer';
      await rejectMatch(id, reviewerTag);
      toast.error('Match rejected as non-equivalent.');
      setMatches(prev => prev.map(m => m.id === id ? { ...m, status: 'rejected' } : m));
    } catch (err) {
      console.error(err);
      toast.error('Failed to reject match');
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Page Title & Filter Header */}
      <div className="flex justify-between items-end flex-wrap gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">AI Duplicate & Equivalence Matcher</h1>
          <p className="text-slate-500 text-xs sm:text-sm mt-1">
            Two-Tier Harmonization: CPSE technical parity endorsement + MoPNG sovereign national code ratification.
          </p>
        </div>
        
        <div className="flex flex-wrap gap-2">
          <select 
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="bg-white border border-slate-300 rounded-lg py-2 px-3 text-xs sm:text-sm text-slate-700 font-semibold focus:outline-none focus:border-[#3b82f6] shadow-xs cursor-pointer"
          >
            <option value="pending">Status: Pending Technical Review</option>
            <option value="endorsed">Status: Endorsed (Ready for MoPNG)</option>
            <option value="approved">Status: Ratified by MoPNG</option>
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

      {/* Role-Specific Two-Tier Framework Session Banner */}
      {currentUser && (
        <div className={`border rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs ${
          currentRole === 'admin'
            ? 'bg-amber-50/70 border-amber-200 text-amber-900'
            : 'bg-blue-50/70 border-blue-200 text-blue-900'
        }`}>
          <div className="flex items-center space-x-3 text-xs">
            <div className={`p-2 rounded-lg text-white text-base ${
              currentRole === 'admin' ? 'bg-amber-600' : 'bg-blue-600'
            }`}>
              {currentRole === 'admin' ? <FiAward /> : <FiShield />}
            </div>
            <div>
              <div className="font-bold text-slate-900 text-xs sm:text-sm">
                {currentRole === 'admin' 
                  ? '👑 MoPNG Central Standardization Committee Session' 
                  : `🏢 ${currentUser.cpse_organization || 'CPSE'} Domain Technical Session`}
              </div>
              <div className="text-slate-600 text-[11px] mt-0.5">
                Active User: <strong>{currentUser.name}</strong> · Designation: <strong>{currentUser.designation || 'Specialist'}</strong>
              </div>
            </div>
          </div>

          <div className="text-[11px] font-medium bg-white/80 border border-slate-200/80 px-3 py-1.5 rounded-lg text-slate-600 self-start sm:self-auto">
            {currentRole === 'admin' ? (
              <span className="flex items-center gap-1.5 text-amber-800">
                <FiAward className="text-amber-600" />
                <span>Tier 2 Authority: Sovereign Ratification & National Code Minting</span>
              </span>
            ) : (
              <span className="flex items-center gap-1.5 text-blue-800">
                <FiCheckCircle className="text-emerald-600" />
                <span>Tier 1 Authority: Specification Equivalence Endorsement</span>
              </span>
            )}
          </div>
        </div>
      )}

      {/* Matches List */}
      {loading ? (
        <div className="text-center py-24 text-slate-400">
          <div className="w-10 h-10 border-4 border-[#3b82f6] border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Loading cross-CPSE matches...</p>
        </div>
      ) : matches.length === 0 ? (
        <div className="text-center py-16 bg-white border border-slate-200 rounded-xl text-slate-500 shadow-sm p-6">
          No matches found for the selected status. Try switching the filter above to <strong>All</strong> or <strong>Pending</strong>.
        </div>
      ) : (
        <div className="space-y-4">
          {matches.map(match => (
            <MatchCard 
              key={match.id} 
              matchData={match} 
              onEndorse={handleEndorse}
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
