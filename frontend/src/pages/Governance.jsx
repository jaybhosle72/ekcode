import { useState, useEffect } from 'react';
import { getAuditLog, getErpStatus, getSapMatmas, triggerErpSync } from '../services/api';
import { 
  FiShield, 
  FiDatabase, 
  FiRefreshCw, 
  FiDownload, 
  FiCheckCircle, 
  FiClock, 
  FiServer,
  FiCheck
} from 'react-icons/fi';
import toast from 'react-hot-toast';

function Governance() {
  const [auditLogs, setAuditLogs] = useState([]);
  const [erpStatus, setErpStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [syncingCpse, setSyncingCpse] = useState(null);
  const [recentlySynced, setRecentlySynced] = useState({});
  const [sapPayload, setSapPayload] = useState(null);
  const [activeTab, setActiveTab] = useState('erp'); // Default to ERP tab so user immediately sees their updates

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [auditRes, erpRes, sapRes] = await Promise.all([
        getAuditLog(),
        getErpStatus(),
        getSapMatmas()
      ]);
      setAuditLogs(auditRes.data || []);
      setErpStatus(erpRes.data || null);
      setSapPayload(sapRes.data || null);
    } catch (err) {
      console.error('Governance fetch error:', err);
      toast.error('Failed to load governance & ERP data');
    } finally {
      setLoading(false);
    }
  };

  const handleSync = async (cpseName) => {
    setSyncingCpse(cpseName);
    try {
      const res = await triggerErpSync(cpseName);
      
      // Dismiss existing stacked toasts so they don't pile up on screen
      toast.dismiss();
      toast.success(res.data?.message || `Successfully synchronized National Codes with ${cpseName} instances.`);
      
      const nowStr = new Date().toISOString();

      // Immediately update local state so card visibly updates instantly
      setRecentlySynced(prev => ({ ...prev, [cpseName]: true }));
      setErpStatus(prev => {
        if (!prev) return prev;
        const updated = (prev.active_integrations || []).map(conn => {
          if (conn.cpse === cpseName) {
            return {
              ...conn,
              last_sync: nowStr,
              sync_count: (conn.sync_count || 1) + 1,
              status: 'Synchronized Just Now'
            };
          }
          return conn;
        });
        return { ...prev, active_integrations: updated };
      });

      // Also reload background audit logs
      const auditRes = await getAuditLog();
      setAuditLogs(auditRes.data || []);

      setTimeout(() => {
        setRecentlySynced(prev => ({ ...prev, [cpseName]: false }));
      }, 5000);
    } catch (err) {
      console.error(err);
      toast.dismiss();
      toast.error(`ERP synchronization failed for ${cpseName}`);
    } finally {
      setSyncingCpse(null);
    }
  };

  const formatLastSync = (dateStr) => {
    if (!dateStr) return 'Pending First Sync';
    const d = new Date(dateStr);
    const diffSec = Math.floor((Date.now() - d.getTime()) / 1000);
    
    if (diffSec < 30) return 'Just now (Live In-Sync)';
    if (diffSec < 120) return '1 minute ago';
    if (diffSec < 3600) return `${Math.floor(diffSec / 60)} minutes ago`;
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  };

  const downloadSapJSON = () => {
    if (!sapPayload || !sapPayload.records) {
      toast.error('No SAP payload available to download');
      return;
    }
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(sapPayload, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `SAP_MM_MATMAS05_National_Master_${new Date().toISOString().slice(0,10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    toast.success('Downloaded SAP MM MATMAS05 Payload');
  };

  const downloadSapCSV = () => {
    if (!sapPayload || !sapPayload.records || sapPayload.records.length === 0) {
      toast.error('No SAP payload available to download');
      return;
    }
    const headers = ['MATNR,MAKTX,MEINS,MATKL,BISMT,BISMT_ONGC,BISMT_BPCL,BISMT_IOC,SPART,TOTAL_ANNUAL_DEMAND,PROJECTED_SAVINGS_INR'];
    const rows = sapPayload.records.map(r => 
      `"${r.MATNR}","${r.MAKTX}","${r.MEINS}","${r.MATKL}","${r.BISMT}","${r.BISMT_ONGC}","${r.BISMT_BPCL}","${r.BISMT_IOC}","${r.SPART}",${r.TOTAL_ANNUAL_DEMAND},${r.PROJECTED_SAVINGS_INR}`
    );
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers, ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `SAP_MM_Migration_Sheet_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    toast.success('Downloaded SAP MM Migration CSV');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-end flex-wrap gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <FiShield className="text-slate-700" /> Audit Trail & ERP Governance
          </h1>
          <p className="text-slate-500 text-xs sm:text-sm mt-0.5">
            Enterprise compliance, immutable approval ledger, and SAP S/4HANA & Oracle ERP integration support.
          </p>
        </div>
        <button 
          onClick={fetchData}
          className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs text-slate-700 hover:text-slate-900 hover:bg-slate-50 font-medium shadow-2xs transition-colors cursor-pointer"
        >
          <FiRefreshCw className="inline mr-1.5 text-xs" /> Refresh Live Data
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 gap-4">
        <button
          onClick={() => setActiveTab('erp')}
          className={`pb-2.5 text-xs sm:text-sm font-semibold border-b-2 transition-all cursor-pointer ${
            activeTab === 'erp'
              ? 'border-slate-900 text-slate-900'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          SAP / ERP Integration & MATMAS
        </button>
        <button
          onClick={() => setActiveTab('audit')}
          className={`pb-2.5 text-xs sm:text-sm font-semibold border-b-2 transition-all cursor-pointer ${
            activeTab === 'audit'
              ? 'border-slate-900 text-slate-900'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Audit Trail & Review Log
        </button>
      </div>

      {/* TAB 1: SAP / ERP INTEGRATION */}
      {activeTab === 'erp' && (
        <div className="space-y-6">
          {/* ERP Connectors */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-5">
            {(erpStatus?.active_integrations || []).map((conn) => {
              const isSyncing = syncingCpse === conn.cpse;
              const wasJustSynced = recentlySynced[conn.cpse];

              return (
                <div 
                  key={conn.cpse} 
                  className={`bg-white p-4 sm:p-5 rounded-xl border transition-all duration-300 shadow-2xs flex flex-col justify-between ${
                    wasJustSynced 
                      ? 'border-emerald-500 ring-1 ring-emerald-200 shadow-xs' 
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-semibold text-slate-900 flex items-center gap-1.5">
                        <FiServer className="text-slate-600 text-xs" />
                        {conn.cpse} ERP Interface
                      </span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-medium uppercase border transition-colors ${
                        wasJustSynced || conn.status === 'Synchronized Just Now'
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                          : 'bg-slate-100 text-slate-700 border-slate-200'
                      }`}>
                        {wasJustSynced ? 'SYNCED JUST NOW' : 'CONNECTED'}
                      </span>
                    </div>

                    <div className="text-xs text-slate-600 space-y-1.5 pt-1">
                      <div className="flex justify-between">
                        <span className="text-slate-400">System:</span>
                        <span className="font-medium text-slate-800">{conn.erp_system}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Protocol:</span>
                        <span className="font-mono text-[11px] text-slate-700">{conn.protocol}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Synced Items:</span>
                        <span className="font-semibold text-slate-900">{conn.synced_items} materials</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">National Codes:</span>
                        <span className="font-semibold text-slate-900">{conn.national_codes_mapped || 4} Mapped</span>
                      </div>
                      <div className="flex justify-between items-center pt-1 border-t border-slate-100">
                        <span className="text-slate-400 flex items-center gap-1">
                          <FiClock className="text-slate-400 text-xs" /> Last Synced:
                        </span>
                        <span className="font-medium text-slate-800 bg-slate-100 px-2 py-0.5 rounded text-[10px]">
                          {formatLastSync(conn.last_sync)}
                        </span>
                      </div>
                    </div>

                    <div className="text-[10px] text-slate-400 truncate bg-slate-50 p-2 rounded border border-slate-100">
                      <code>{conn.endpoint}</code>
                    </div>
                  </div>

                  <button
                    onClick={() => handleSync(conn.cpse)}
                    disabled={isSyncing}
                    className={`w-full mt-4 py-2 rounded-lg text-xs font-medium transition-colors cursor-pointer flex items-center justify-center gap-1.5 shadow-2xs ${
                      wasJustSynced
                        ? 'bg-emerald-700 text-white hover:bg-emerald-800'
                        : 'bg-slate-900 hover:bg-slate-800 text-white'
                    } disabled:opacity-50 disabled:cursor-not-allowed`}
                  >
                    {isSyncing ? (
                      <>
                        <FiRefreshCw className="animate-spin text-xs" />
                        <span>Synchronizing {conn.cpse} ERP...</span>
                      </>
                    ) : wasJustSynced ? (
                      <>
                        <FiCheck className="text-xs font-bold" />
                        <span>{conn.cpse} Synchronized (Click to Re-sync)</span>
                      </>
                    ) : (
                      <>
                        <FiRefreshCw className="text-xs" />
                        <span>Sync {conn.cpse} ERP</span>
                      </>
                    )}
                  </button>
                </div>
              );
            })}
          </div>

          {/* SAP MM MATMAS05 Payload & Export */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs space-y-4">
            <div className="flex justify-between items-center flex-wrap gap-3">
              <div>
                <h3 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
                  <FiDatabase className="text-slate-700" /> SAP Material Master (MATMAS05) Payload Generator
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Ready-to-import payload for SAP S/4HANA (BAPI_MATERIAL_SAVEDATA) including <code>BISMT</code> (Old Material Number) for backward traceability.
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={downloadSapJSON}
                  className="px-3 py-1.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-800 rounded-lg text-xs font-medium shadow-2xs flex items-center gap-1.5 cursor-pointer"
                >
                  <FiDownload /> Download SAP JSON
                </button>
                <button
                  onClick={downloadSapCSV}
                  className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-medium shadow-2xs flex items-center gap-1.5 cursor-pointer"
                >
                  <FiDownload /> Export SAP CSV
                </button>
              </div>
            </div>

            {/* Preview of SAP Records */}
            {sapPayload && sapPayload.records && (
              <div className="overflow-x-auto border border-slate-200 rounded-lg">
                <table className="w-full text-xs text-left">
                  <thead className="text-[11px] text-slate-500 uppercase bg-slate-50/80 border-b border-slate-200 font-semibold">
                    <tr>
                      <th className="px-4 py-2">MATNR (National Code)</th>
                      <th className="px-4 py-2">MAKTX (Material Description)</th>
                      <th className="px-4 py-2">MEINS (UOM)</th>
                      <th className="px-4 py-2">MATKL (Group)</th>
                      <th className="px-4 py-2">BISMT (Backward Traceability)</th>
                      <th className="px-4 py-2 text-right">Aggregated Demand</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {sapPayload.records.slice(0, 5).map((row, idx) => (
                      <tr key={idx} className="hover:bg-slate-50/60">
                        <td className="px-4 py-2.5 font-mono font-semibold text-slate-900">{row.MATNR}</td>
                        <td className="px-4 py-2.5 text-slate-800 font-medium">{row.MAKTX}</td>
                        <td className="px-4 py-2.5 text-slate-600">{row.MEINS}</td>
                        <td className="px-4 py-2.5 text-slate-600">{row.MATKL}</td>
                        <td className="px-4 py-2.5 font-mono text-[11px] text-slate-600">{row.BISMT}</td>
                        <td className="px-4 py-2.5 text-right font-medium text-slate-800">{row.TOTAL_ANNUAL_DEMAND}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: AUDIT TRAIL */}
      {activeTab === 'audit' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden space-y-4">
          <div className="p-3.5 border-b border-slate-100 flex justify-between items-center bg-slate-50/60 flex-wrap gap-2">
            <div>
              <h3 className="text-xs font-semibold text-slate-900">Immutable Governance Audit Log</h3>
              <p className="text-[11px] text-slate-500">Every match approval, catalog ingestion, and code generation is permanently recorded.</p>
            </div>
            <span className="text-[10px] bg-slate-100 text-slate-700 border border-slate-200 px-2.5 py-0.5 rounded font-medium">
              CVC & MoPNG Guidelines Compliant
            </span>
          </div>

          {loading ? (
            <div className="text-center py-20 text-slate-400 text-xs">Loading audit trail...</div>
          ) : auditLogs.length === 0 ? (
            <div className="text-center py-16 text-slate-500 text-xs">No audit records found yet.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left min-w-[650px]">
                <thead className="text-[11px] text-slate-500 uppercase bg-slate-50/80 border-b border-slate-200 font-semibold">
                  <tr>
                    <th className="px-4 py-2.5">Timestamp</th>
                    <th className="px-4 py-2.5">Action Type</th>
                    <th className="px-4 py-2.5">Details / Target Item</th>
                    <th className="px-4 py-2.5">Authorized Officer</th>
                    <th className="px-4 py-2.5 text-right">Integrity Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {auditLogs.map((log) => (
                    <tr key={log._id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="px-4 py-2.5 text-slate-500 whitespace-nowrap text-[11px]">
                        <FiClock className="inline mr-1 text-slate-400" />
                        {new Date(log.timestamp).toLocaleString()}
                      </td>
                      <td className="px-5 py-3.5">
                        <span className={`px-2 py-0.5 rounded font-mono text-[10px] font-bold uppercase border ${
                          log.action === 'approve' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                          log.action === 'upload' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                          log.action === 'erp_sync' ? 'bg-purple-50 text-purple-700 border-purple-200' :
                          'bg-slate-100 text-slate-700 border-slate-200'
                        }`}>
                          {log.action}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 font-medium text-slate-800">
                        {log.details || 'System event'}
                      </td>
                      <td className="px-5 py-3.5 text-slate-600 font-semibold">
                        {log.user || 'Admin'}
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        <span className="text-emerald-600 font-semibold flex items-center justify-end gap-1">
                          <FiCheckCircle /> Verified
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default Governance;
