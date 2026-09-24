import { useState } from 'react';
import { MdCheck, MdClose } from 'react-icons/md';
import { FiCheckCircle, FiShield, FiArrowRight, FiClock, FiAward } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';

function MatchCard({ matchData, onEndorse, onApprove, onReject }) {
  const { currentRole, currentUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState(matchData.status);
  const [endorsement, setEndorsement] = useState(matchData.technical_endorsement);
  const [nationalCode, setNationalCode] = useState(matchData.nationalCode);

  if (!matchData) return null;

  const { score, type, materialA, materialB, comparison, reasoning } = matchData;

  const getScoreColor = (s) => {
    if (s > 85) return 'text-emerald-800 bg-emerald-50 border-emerald-300 font-bold';
    if (s >= 70) return 'text-slate-800 bg-slate-100 border-slate-300 font-bold';
    return 'text-amber-800 bg-amber-50 border-amber-300 font-bold';
  };

  const getCpseBadge = (cpse) => {
    if (cpse === 'ONGC') return 'text-rose-700 bg-rose-50 border-rose-200';
    if (cpse === 'BPCL') return 'text-slate-700 bg-slate-100 border-slate-200';
    return 'text-amber-700 bg-amber-50 border-amber-200';
  };

  const handleEndorseAction = async () => {
    setLoading(true);
    try {
      await onEndorse(matchData.id);
      setStatus('endorsed');
      setEndorsement({
        endorsed_by: currentUser?.name || 'CPSE Domain Officer',
        cpse: currentUser?.cpse_organization || materialA.cpse,
        designation: currentUser?.designation || 'Materials Engineer',
        endorsed_at: new Date()
      });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleApproveAction = async () => {
    setLoading(true);
    try {
      const res = await onApprove(matchData.id);
      setStatus('approved');
      if (res?.nationalCode) setNationalCode(res.nationalCode);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleRejectAction = async () => {
    setLoading(true);
    try {
      await onReject(matchData.id);
      setStatus('rejected');
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col mb-6 transition-all hover:border-slate-300">
      {/* Top Header */}
      <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/70 flex-wrap gap-2">
        <div className="flex items-center space-x-3">
          <span className={`px-3 py-1 rounded-full text-xs font-bold border ${getScoreColor(score)}`}>
            {score}% Match Confidence
          </span>
          <span className="text-slate-500 text-xs uppercase tracking-wider font-semibold">{type}</span>
        </div>
        {status === 'approved' && (nationalCode || matchData.nationalCode) && (
          <div className="text-xs font-bold text-emerald-800 bg-emerald-50 border border-emerald-300 px-3 py-1 rounded-full flex items-center space-x-1.5 shadow-xs">
            <FiAward className="text-emerald-600 text-sm" />
            <span>Official National Code: <strong className="font-mono">{nationalCode || matchData.nationalCode}</strong></span>
          </div>
        )}
      </div>

      {/* Two-Tier Governance Stepper Bar */}
      <div className="bg-slate-50 border-b border-slate-200/80 px-4 py-2.5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1">
            <FiShield className="text-slate-700" />
            Two-Tier Governance Pipeline:
          </span>

          <div className="flex items-center gap-2 flex-wrap">
            {/* Step 1: AI Match */}
            <div className="flex items-center space-x-1 text-[11px] font-semibold text-slate-800 bg-slate-100 border border-slate-300 px-2.5 py-0.5 rounded-md">
              <FiCheckCircle className="text-slate-700" />
              <span>1. AI Cross-Match</span>
            </div>

            <FiArrowRight className="text-slate-300 text-xs hidden sm:inline" />

            {/* Step 2: CPSE Technical Verification */}
            <div className={`flex items-center space-x-1 text-[11px] font-semibold px-2.5 py-0.5 rounded-md border ${
              status === 'endorsed' || status === 'approved'
                ? 'text-emerald-700 bg-emerald-50 border-emerald-200'
                : 'text-slate-500 bg-white border-slate-200'
            }`}>
              {status === 'endorsed' || status === 'approved' ? (
                <>
                  <FiCheckCircle className="text-emerald-600" />
                  <span>2. CPSE Verified ({endorsement?.cpse || 'ONGC'})</span>
                </>
              ) : (
                <>
                  <FiClock className="text-slate-400" />
                  <span>2. CPSE Technical Review</span>
                </>
              )}
            </div>

            <FiArrowRight className="text-slate-300 text-xs hidden sm:inline" />

            {/* Step 3: MoPNG Sovereign Ratification */}
            <div className={`flex items-center space-x-1 text-[11px] font-semibold px-2.5 py-0.5 rounded-md border ${
              status === 'approved'
                ? 'text-amber-800 bg-amber-50 border-amber-300 font-bold'
                : status === 'endorsed'
                ? 'text-blue-700 bg-blue-50/50 border-blue-200'
                : 'text-slate-400 bg-white border-slate-200'
            }`}>
              {status === 'approved' ? (
                <>
                  <FiAward className="text-amber-600" />
                  <span>3. MoPNG Sovereign Ratified</span>
                </>
              ) : status === 'endorsed' ? (
                <>
                  <FiClock className="text-blue-500" />
                  <span>3. Awaiting MoPNG Ratification</span>
                </>
              ) : (
                <span>3. MoPNG Sovereign Ratification</span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Materials Side-by-Side: Responsive 1 col on mobile -> 2 col on tablet/desktop */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 sm:p-5">
        <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
          <div className="flex items-center justify-between mb-1.5">
            <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${getCpseBadge(materialA.cpse)}`}>
              {materialA.cpse}
            </span>
            <span className="font-mono text-xs font-semibold text-slate-700">{materialA.code}</span>
          </div>
          <div className="text-xs sm:text-sm font-semibold text-slate-800 leading-snug">{materialA.description}</div>
        </div>

        <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
          <div className="flex items-center justify-between mb-1.5">
            <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${getCpseBadge(materialB.cpse)}`}>
              {materialB.cpse}
            </span>
            <span className="font-mono text-xs font-semibold text-slate-700">{materialB.code}</span>
          </div>
          <div className="text-xs sm:text-sm font-semibold text-slate-800 leading-snug">{materialB.description}</div>
        </div>
      </div>

      {/* Comparison Table */}
      <div className="px-4 pb-4 overflow-x-auto">
        <table className="w-full text-xs text-left">
          <thead className="text-[11px] text-slate-600 uppercase bg-slate-50 border-b border-slate-200 font-semibold">
            <tr>
              <th className="px-4 py-2">Attribute Field</th>
              <th className="px-4 py-2">{materialA.cpse} Value</th>
              <th className="px-4 py-2">{materialB.cpse} Value</th>
              <th className="px-4 py-2">Equivalence</th>
            </tr>
          </thead>
          <tbody>
            {comparison.map((row, idx) => (
              <tr key={idx} className="border-b border-slate-100 hover:bg-slate-50">
                <td className="px-4 py-2 font-medium text-slate-800">{row.field}</td>
                <td className="px-4 py-2 text-slate-600">{row.valueA}</td>
                <td className="px-4 py-2 text-slate-600">{row.valueB}</td>
                <td className="px-4 py-2">
                  {row.matchStatus === 'exact' ? (
                    <span className="text-xs font-semibold text-emerald-600">✅ Exact</span>
                  ) : row.matchStatus === 'partial' ? (
                    <span className="text-xs font-semibold text-blue-600">⚠️ Compatible</span>
                  ) : (
                    <span className="text-xs font-semibold text-rose-600">❌ Mismatch</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Explainable AI Reasoning */}
      <div className="p-4 bg-slate-50 border-t border-slate-100">
        <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">Explainable AI Reasoning</div>
        <p className="text-xs text-slate-700 italic leading-relaxed">{reasoning}</p>
      </div>

      {/* Endorsement Details Banner (If Endorsed) */}
      {status === 'endorsed' && (
        <div className="p-3 bg-emerald-50/80 border-t border-emerald-200 text-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
          <div className="flex items-center space-x-2 text-emerald-900">
            <FiCheckCircle className="text-emerald-600 text-base flex-shrink-0" />
            <span>
              <strong>Tier 1 Endorsed:</strong> Technical parity verified by{' '}
              <strong>{endorsement?.endorsed_by || 'Vikram Sharma'}</strong> ({endorsement?.cpse || 'ONGC'} - {endorsement?.designation || 'Materials Specialist'})
            </span>
          </div>
          <span className="text-[11px] font-semibold text-blue-700 bg-white border border-blue-200 px-2.5 py-1 rounded-md shadow-2xs">
            ⏳ Awaiting MoPNG Sovereign Ratification
          </span>
        </div>
      )}

      {/* Ratification Details Banner (If Approved) */}
      {status === 'approved' && (
        <div className="p-3.5 bg-slate-50 border-t border-slate-200 text-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
          <div className="flex items-center space-x-2 text-slate-800">
            <FiAward className="text-slate-700 text-base flex-shrink-0" />
            <span>
              <strong>Tier 2 Sovereign Ratified:</strong> Approved by{' '}
              <strong className="text-slate-900">{matchData.reviewed_by || 'Dr. Rajesh Verma (MoPNG Committee)'}</strong>
            </span>
          </div>
          <span className="text-[11px] font-mono font-semibold text-slate-900 bg-white border border-slate-200 px-2.5 py-1 rounded-md shadow-2xs">
            National Code: {nationalCode || matchData.nationalCode || 'IND-MAT-CODE'}
          </span>
        </div>
      )}

      {/* Rejection Banner */}
      {status === 'rejected' && (
        <div className="p-3 bg-rose-50 border-t border-rose-200 text-xs text-rose-800 flex items-center space-x-2">
          <MdClose className="text-rose-600 text-base" />
          <span>Match marked as <strong>Rejected</strong>. Flagged as non-substitutable due to engineering specification variance.</span>
        </div>
      )}

      {/* Interactive Actions Area Based on Persona Authority */}
      {status !== 'approved' && status !== 'rejected' && (
        <div className="p-3.5 border-t border-slate-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-slate-50/60">
          <div className="text-[11px] text-slate-500">
            {currentRole === 'admin' ? (
              <span className="text-amber-800 font-semibold flex items-center gap-1">
                👑 MoPNG Sovereign Authority: You can grant Sovereign Ratification & mint National Code.
              </span>
            ) : status === 'pending' ? (
              <span className="text-slate-600 font-medium">
                🏢 CPSE Domain Officer: Verify technical specs. Your endorsement forwards this to MoPNG.
              </span>
            ) : (
              <span className="text-emerald-700 font-medium">
                ✅ You have endorsed this match. It is in the MoPNG Central Standardization queue.
              </span>
            )}
          </div>

          <div className="flex items-center space-x-2 flex-wrap self-end sm:self-auto">
            {/* Rejection Button (Available to both officer and admin) */}
            <button
              onClick={handleRejectAction}
              disabled={loading}
              className="flex items-center px-3 py-1.5 text-xs font-semibold text-rose-600 bg-white border border-rose-200 rounded-lg hover:bg-rose-50 transition-colors cursor-pointer disabled:opacity-50"
            >
              <MdClose className="mr-1 text-sm" /> Flag Mismatch
            </button>

            {/* Officer Action: Endorse Technical Parity */}
            {currentRole === 'officer' && status === 'pending' && (
              <button
                onClick={handleEndorseAction}
                disabled={loading}
                className="flex items-center px-4 py-1.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-xs transition-colors cursor-pointer disabled:opacity-50"
              >
                <MdCheck className="mr-1 text-sm" /> Endorse Technical Parity ({currentUser?.cpse_organization || 'CPSE'})
              </button>
            )}

            {/* MoPNG Admin Action: Sovereign Ratification & National Code Minting */}
            {currentRole === 'admin' && (
              <button
                onClick={handleApproveAction}
                disabled={loading}
                className="flex items-center px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg shadow-xs transition-all cursor-pointer disabled:opacity-50"
              >
                <FiAward className="mr-1.5 text-sm text-slate-300" />
                <span>Sovereign Ratify & Mint National Code</span>
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default MatchCard;
