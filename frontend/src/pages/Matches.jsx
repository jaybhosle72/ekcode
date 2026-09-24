import { useState, useEffect } from 'react';
import MatchCard from '../components/MatchCard';
import { getMatches, approveMatch, rejectMatch, endorseMatch, runMatching } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { FiCheckCircle, FiShield, FiAward, FiLayers, FiRefreshCw } from 'react-icons/fi';
import toast from 'react-hot-toast';

function Matches() {
  const { currentUser, currentRole } = useAuth();
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isScanning, setIsScanning] = useState(false);
  const [statusFilter, setStatusFilter] = useState('all');
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
        const fc = m.field_comparison || {};

        const compareField = (label, a, b, explicitMatch) => {
          let valA = a;
          let valB = b;

          // For Pressure Class: if item is non-pressurized/ambient
          if (label.includes('Pressure')) {
            if (!valA || valA === '-' || valA.toLowerCase() === 'standard') valA = 'Ambient / Non-pressurized';
            if (!valB || valB === '-' || valB.toLowerCase() === 'standard') valB = 'Ambient / Non-pressurized';
          } else if (label.includes('Size') || label.includes('Dimensions')) {
            if (!valA || valA === '-' || valA.toLowerCase() === 'standard') valA = 'Universal / Standard';
            if (!valB || valB === '-' || valB.toLowerCase() === 'standard') valB = 'Universal / Standard';
          } else {
            if (!valA) valA = '-';
            if (!valB) valB = '-';
          }

          const exact = (explicitMatch !== undefined)
            ? explicitMatch
            : String(valA).toLowerCase().trim() === String(valB).toLowerCase().trim();

          return {
            field: label,
            valueA: valA,
            valueB: valB,
            matchStatus: exact ? 'exact' : (valA !== '-' && valB !== '-' ? 'partial' : 'mismatch')
          };
        };

        const comparison = [
          compareField(
            'Material',
            fc.material?.a || specsA.material,
            fc.material?.b || specsB.material,
            fc.material?.match
          ),
          compareField(
            'Size / Dimensions',
            fc.size?.a || specsA.dimensions || specsA.size,
            fc.size?.b || specsB.dimensions || specsB.size,
            fc.size?.match
          ),
          compareField(
            'Pressure Class',
            fc.pressure_class?.a || specsA.pressure_rating || specsA.pressure_class,
            fc.pressure_class?.b || specsB.pressure_rating || specsB.pressure_class,
            fc.pressure_class?.match
          ),
          compareField(
            'Standard (ASTM/IS/API)',
            fc.standard?.a || specsA.standard || specsA.grade,
            fc.standard?.b || specsB.standard || specsB.grade,
            fc.standard?.match
          ),
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

  // On-demand full AI cross-match re-scan
  const handleTriggerScan = async () => {
    try {
      setIsScanning(true);
      const res = await runMatching();
      toast.success(res.data?.message || 'AI cross-matching completed across all CPSEs!');
      await fetchMatches();
    } catch (err) {
      console.error(err);
      toast.error('Failed to trigger AI matching engine.');
    } finally {
      setIsScanning(false);
    }
  };

  const identicalCount = matches.filter(m => m.type === 'identical').length;
  const nearDupCount = matches.filter(m => m.type === 'near-duplicate').length;
  const equivCount = matches.filter(m => m.type === 'equivalent').length;

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Page Title & Filter Header */}
      <div className="flex justify-between items-end flex-wrap gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">AI Duplicate & Equivalence Matcher</h1>
          <p className="text-slate-500 text-xs sm:text-sm mt-0.5">
            Two-Tier Harmonization: CPSE technical parity endorsement + MoPNG sovereign national code ratification.
          </p>
        </div>
        
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleTriggerScan}
            disabled={isScanning}
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold shadow-xs transition-all disabled:opacity-50 cursor-pointer"
          >
            <FiRefreshCw className={isScanning ? 'animate-spin' : ''} />
            <span>{isScanning ? 'Analyzing All Catalogs...' : 'Re-scan All Catalogs'}</span>
          </button>

          <select 
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="bg-white border border-slate-200 rounded-lg py-1.5 px-3 text-xs text-slate-800 font-semibold focus:outline-none focus:border-slate-900 shadow-2xs cursor-pointer"
          >
            <option value="all">Status: All States</option>
            <option value="pending">Status: Pending Review</option>
            <option value="endorsed">Status: Endorsed</option>
            <option value="approved">Status: Ratified</option>
            <option value="rejected">Status: Rejected</option>
          </select>
          <select 
            value={typeFilter}
            onChange={e => setTypeFilter(e.target.value)}
            className="bg-white border border-slate-200 rounded-lg py-1.5 px-3 text-xs text-slate-800 font-semibold focus:outline-none focus:border-slate-900 shadow-2xs cursor-pointer"
          >
            <option value="all">Match Type: All</option>
            <option value="identical">Identical (90%-98%)</option>
            <option value="near-duplicate">Near-Duplicate (70%-89%)</option>
            <option value="equivalent">Equivalent (50%-69%)</option>
          </select>
        </div>
      </div>

      {/* Real-time Cross-CPSE Parity Stats Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-2xs">
          <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Total Match Pairs</div>
          <div className="text-xl font-bold text-slate-900 mt-0.5">{matches.length}</div>
        </div>
        <div className="bg-white border border-emerald-200/90 rounded-xl p-3.5 shadow-2xs bg-emerald-50/20">
          <div className="text-[11px] font-semibold text-emerald-700 uppercase tracking-wider">Identical (98%)</div>
          <div className="text-xl font-bold text-emerald-700 mt-0.5">{identicalCount}</div>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-2xs">
          <div className="text-[11px] font-semibold text-slate-600 uppercase tracking-wider">Near-Duplicate</div>
          <div className="text-xl font-bold text-slate-800 mt-0.5">{nearDupCount}</div>
        </div>
        <div className="bg-white border border-amber-200/90 rounded-xl p-3.5 shadow-2xs bg-amber-50/20">
          <div className="text-[11px] font-semibold text-amber-700 uppercase tracking-wider">Equivalent</div>
          <div className="text-xl font-bold text-amber-700 mt-0.5">{equivCount}</div>
        </div>
      </div>

      {/* Role-Specific Two-Tier Framework Session Banner */}
      {currentUser && (
        <div className={`border rounded-xl p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs ${
          currentRole === 'admin'
            ? 'bg-amber-50/30 border-amber-200/80'
            : 'bg-slate-50 border-slate-200'
        }`}>
          <div className="flex items-center space-x-3 text-xs">
            <div className={`p-2 rounded-lg text-base border ${
              currentRole === 'admin'
                ? 'bg-amber-100 text-amber-800 border-amber-200'
                : 'bg-slate-200 text-slate-800 border-slate-300'
            }`}>
              {currentRole === 'admin' ? <FiAward /> : <FiShield />}
            </div>
            <div>
              <div className="font-bold text-slate-900 text-xs sm:text-sm">
                {currentRole === 'admin' 
                  ? 'MoPNG Central Standardization Committee Session' 
                  : `${currentUser.cpse_organization || 'CPSE'} Domain Technical Session`}
              </div>
              <div className="text-slate-600 text-[11px] mt-0.5">
                Active User: <strong className="text-slate-900">{currentUser.name}</strong> · Designation: <strong className="text-slate-700">{currentUser.designation || 'Specialist'}</strong>
              </div>
            </div>
          </div>

          <div className="text-[11px] font-medium bg-white border border-slate-200 px-3 py-1.5 rounded-lg text-slate-700 shadow-2xs self-start sm:self-auto">
            {currentRole === 'admin' ? (
              <span className="flex items-center gap-1.5 text-amber-900 font-semibold">
                <FiAward className="text-amber-600 text-sm" />
                <span>Tier 2 Authority: Sovereign Ratification & Minting</span>
              </span>
            ) : (
              <span className="flex items-center gap-1.5 text-blue-900 font-semibold">
                <FiCheckCircle className="text-emerald-600 text-sm" />
                <span>Tier 1 Authority: Specification Equivalence Endorsement</span>
              </span>
            )}
          </div>
        </div>
      )}

      {/* Matches List */}
      {loading ? (
        <div className="text-center py-24 text-slate-400">
          <div className="w-8 h-8 border-2 border-slate-800 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-xs font-medium uppercase tracking-wider text-slate-500">Loading cross-CPSE matches...</p>
        </div>
      ) : matches.length === 0 ? (
        <div className="text-center py-16 bg-white border border-slate-200 rounded-xl text-slate-500 shadow-2xs p-6 text-xs">
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
