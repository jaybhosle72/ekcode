import { useState } from 'react';
import { MdCheck, MdClose } from 'react-icons/md';

function MatchCard({ matchData, onApprove, onReject }) {
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState(matchData.status);

  if (!matchData) return null;

  const { score, type, materialA, materialB, comparison, reasoning, nationalCode } = matchData;

  const getScoreColor = (s) => {
    if (s > 85) return 'text-blue-700 bg-blue-50 border-blue-200';
    if (s >= 70) return 'text-slate-700 bg-slate-100 border-slate-200';
    return 'text-rose-700 bg-rose-50 border-rose-200';
  };

  const getCpseBadge = (cpse) => {
    if (cpse === 'ONGC') return 'text-rose-700 bg-rose-50 border-rose-200';
    if (cpse === 'BPCL') return 'text-blue-700 bg-blue-50 border-blue-200';
    return 'text-amber-700 bg-amber-50 border-amber-200';
  };

  const handleAction = async (actionFn, newStatus) => {
    setLoading(true);
    try {
      await actionFn(matchData.id);
      setStatus(newStatus);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col mb-6">
      {/* Header */}
      <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/70 flex-wrap gap-2">
        <div className="flex items-center space-x-3">
          <span className={`px-3 py-1 rounded-full text-xs font-bold border ${getScoreColor(score)}`}>
            {score}% Match Confidence
          </span>
          <span className="text-slate-500 text-xs uppercase tracking-wider font-semibold">{type}</span>
        </div>
        {status === 'approved' && nationalCode && (
          <div className="text-xs font-bold text-blue-700 bg-blue-50 border border-blue-200 px-3 py-1 rounded-full">
            National Code: <span className="font-mono">{nationalCode}</span>
          </div>
        )}
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

      {/* Reasoning */}
      <div className="p-4 bg-slate-50 border-t border-slate-100">
        <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">Explainable AI Reasoning</div>
        <p className="text-xs text-slate-700 italic leading-relaxed">{reasoning}</p>
      </div>

      {/* Actions */}
      {status === 'pending' && (
        <div className="p-3 border-t border-slate-100 flex justify-end space-x-3 bg-slate-50/60 flex-wrap gap-2">
          <button
            onClick={() => handleAction(onReject, 'rejected')}
            disabled={loading}
            className="flex items-center px-4 py-2 text-xs font-semibold text-rose-600 bg-white border border-rose-200 rounded-lg hover:bg-rose-50 transition-colors cursor-pointer disabled:opacity-50"
          >
            <MdClose className="mr-1 text-sm" /> Reject Match
          </button>
          <button
            onClick={() => handleAction(onApprove, 'approved')}
            disabled={loading}
            className="flex items-center px-4 py-2 text-xs font-semibold text-white bg-[#3b82f6] hover:bg-blue-700 rounded-lg shadow-xs transition-colors cursor-pointer disabled:opacity-50"
          >
            <MdCheck className="mr-1 text-sm" /> Approve & Generate National Code
          </button>
        </div>
      )}
      
      {status !== 'pending' && (
        <div className="p-3 border-t border-slate-100 flex justify-center items-center bg-slate-50/60">
           <span className={`text-xs font-semibold ${status === 'approved' ? 'text-blue-700' : 'text-rose-700'}`}>
             Match status: {status.toUpperCase()}
           </span>
        </div>
      )}
    </div>
  );
}

export default MatchCard;
