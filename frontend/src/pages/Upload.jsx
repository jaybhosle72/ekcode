import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { MdCloudUpload, MdPlayArrow, MdCheckCircle } from 'react-icons/md';
import { FiUserCheck, FiDownload } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { uploadFile, runMatching } from '../services/api';

function Upload() {
  const { currentUser } = useAuth();
  const [cpse, setCpse] = useState('ONGC');
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState(null);
  const [matching, setMatching] = useState(false);

  // Sync selected CPSE with active user profile if specific
  useEffect(() => {
    const org = currentUser?.cpse_organization || currentUser?.cpse;
    if (org && ['ONGC', 'BPCL', 'IOC', 'HPCL', 'GAIL', 'NTPC', 'SAIL'].includes(org)) {
      setCpse(org);
    }
  }, [currentUser]);

  const cpseList = ['ONGC', 'BPCL', 'IOC', 'HPCL', 'GAIL', 'NTPC', 'SAIL'];

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!cpse || !file) {
      toast.error("Please select a CPSE and choose an Excel (.xlsx) or CSV file.");
      return;
    }
    setUploading(true);
    setUploadResult(null);

    try {
      const res = await uploadFile(file, cpse);
      setUploading(false);
      setUploadResult(res.data);
      toast.success(`Successfully uploaded ${res.data.uploaded || 0} materials for ${cpse}!`);
    } catch (err) {
      setUploading(false);
      console.error('Upload failed:', err);
      toast.error(err.response?.data?.error || "Error uploading file. Please verify columns.");
    }
  };

  const handleRunMatching = async () => {
    setMatching(true);
    try {
      const res = await runMatching();
      setMatching(false);
      toast.success(`AI Matching completed! Generated ${res.data?.matchesCount || 'new'} match relationships.`);
    } catch (err) {
      setMatching(false);
      console.error('Matching failed:', err);
      toast.error("Error triggering AI matching engine.");
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">Upload CPSE Material Catalogs</h1>
        <p className="text-slate-500 text-xs sm:text-sm mt-1">
          Ingest enterprise legacy ERP catalogs (Excel .xlsx, .xls, or CSV) for automated NLP attribute extraction and duplicate detection.
        </p>
      </div>

      {/* Active Session Info Banner (Only if user is logged in) */}
      {currentUser && (
        <div className="bg-white border border-slate-200 rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[#3b82f6] text-white rounded-lg text-lg shadow-xs">
              <FiUserCheck />
            </div>
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                Authenticated Officer: {currentUser.name}
              </h4>
              <p className="text-xs text-slate-500">
                Designation: <strong>{currentUser.designation || 'Procurement Executive'}</strong> · Organization: <strong className="text-blue-600">{currentUser.cpse_organization || 'CPSE'}</strong>
              </p>
            </div>
          </div>
        </div>
      )}

      {/* External Catalog Download Resources */}
      <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 sm:p-5 space-y-3">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center space-x-2">
            <FiDownload className="text-blue-600 text-lg" />
            <h3 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-800">
              External Real CPSE Material Catalogs
            </h3>
          </div>
          <span className="text-[11px] text-slate-500">Download and upload these realistic files to test cross-CPSE deduplication</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <a
            href="/catalogs/ONGC_Offshore_Field_Catalog_2026.xlsx"
            download="ONGC_Offshore_Field_Catalog_2026.xlsx"
            className="flex items-center justify-between p-3 bg-white hover:bg-blue-50/60 border border-slate-200 hover:border-blue-300 rounded-xl transition-all shadow-2xs group cursor-pointer"
          >
            <div>
              <div className="text-xs font-bold text-slate-800 group-hover:text-blue-600">ONGC Offshore Catalog</div>
              <div className="text-[10px] text-slate-500">20 Fresh Exploration & Field Items</div>
            </div>
            <span className="text-[10px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">.XLSX</span>
          </a>

          <a
            href="/catalogs/BPCL_Terminal_Operations_Catalog_2026.xlsx"
            download="BPCL_Terminal_Operations_Catalog_2026.xlsx"
            className="flex items-center justify-between p-3 bg-white hover:bg-blue-50/60 border border-slate-200 hover:border-blue-300 rounded-xl transition-all shadow-2xs group cursor-pointer"
          >
            <div>
              <div className="text-xs font-bold text-slate-800 group-hover:text-blue-600">BPCL Operations Master</div>
              <div className="text-[10px] text-slate-500">20 Fresh Terminal & POL Items</div>
            </div>
            <span className="text-[10px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">.XLSX</span>
          </a>

          <a
            href="/catalogs/IOCL_Petrochem_Refinery_Catalog_2026.xlsx"
            download="IOCL_Petrochem_Refinery_Catalog_2026.xlsx"
            className="flex items-center justify-between p-3 bg-white hover:bg-blue-50/60 border border-slate-200 hover:border-blue-300 rounded-xl transition-all shadow-2xs group cursor-pointer"
          >
            <div>
              <div className="text-xs font-bold text-slate-800 group-hover:text-blue-600">IOCL Petrochem Inventory</div>
              <div className="text-[10px] text-slate-500">20 Fresh Refinery & Process Items</div>
            </div>
            <span className="text-[10px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">.XLSX</span>
          </a>
        </div>
      </div>

      {/* Main Upload Box */}
      <div className="bg-white p-6 sm:p-7 rounded-xl border border-slate-200 shadow-sm space-y-6">
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-2">Target CPSE Enterprise</label>
          <select 
            className="w-full bg-slate-50 border border-slate-300 rounded-lg py-2.5 px-3.5 text-xs sm:text-sm text-slate-800 font-semibold focus:outline-none focus:border-[#3b82f6] cursor-pointer"
            value={cpse}
            onChange={(e) => setCpse(e.target.value)}
          >
            {cpseList.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-2">Catalog File (.xlsx, .xls, .csv)</label>
          <div className="border-2 border-dashed border-slate-300 hover:border-[#3b82f6] rounded-xl p-8 sm:p-12 flex flex-col items-center justify-center bg-slate-50 hover:bg-blue-50/40 transition-colors cursor-pointer relative">
            <input 
              type="file" 
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              accept=".csv, .xlsx, .xls"
              onChange={handleFileChange}
            />
            <MdCloudUpload className="text-4xl sm:text-5xl text-[#3b82f6] mb-3" />
            <p className="text-xs sm:text-sm font-bold text-slate-800 text-center">{file ? file.name : "Click or drag catalog file here to upload"}</p>
            <p className="text-[11px] sm:text-xs text-slate-400 mt-1 text-center">Accepts Excel (.xlsx) and CSV with columns: Code, Description, Category, Unit, Price, Quantity</p>
          </div>
        </div>

        <div className="flex justify-end">
          <button 
            onClick={handleUpload}
            disabled={uploading || !file || !cpse}
            className="w-full sm:w-auto px-6 py-2.5 bg-[#3b82f6] hover:bg-blue-700 text-white rounded-lg font-semibold text-xs sm:text-sm shadow-sm transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center cursor-pointer"
          >
            {uploading ? 'Processing File with AI...' : 'Upload & Parse Catalog'}
          </button>
        </div>
      </div>

      {uploadResult && (
        <div className="bg-white border border-blue-200 p-6 rounded-xl space-y-4 shadow-sm">
          <div className="flex items-center text-slate-900 font-bold">
            <MdCheckCircle className="text-2xl mr-2 text-emerald-600" />
            <h3 className="text-sm sm:text-base font-bold">Upload & Ingestion Complete</h3>
          </div>
          <p className="text-xs text-slate-600">
            Successfully ingested <strong>{uploadResult.uploaded || 0}</strong> materials into the central EkCode master database. AI matching pipeline has been scheduled.
          </p>
          
          <button 
            onClick={handleRunMatching}
            disabled={matching}
            className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg font-semibold text-xs shadow-sm transition-colors disabled:opacity-50 flex items-center cursor-pointer"
          >
            {matching ? (
              'Running AI Matching Pipeline...'
            ) : (
              <><MdPlayArrow className="mr-1.5 text-base text-[#3b82f6]" /> Trigger AI Matching Pipeline</>
            )}
          </button>
        </div>
      )}
    </div>
  );
}

export default Upload;
