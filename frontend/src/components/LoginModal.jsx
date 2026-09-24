import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { FiX, FiShield, FiLogIn, FiUserPlus, FiMail, FiLock, FiUser } from 'react-icons/fi';
import toast from 'react-hot-toast';

function LoginModal() {
  const { isLoginModalOpen, setIsLoginModalOpen, login, register } = useAuth();
  const [activeTab, setActiveTab] = useState('signin'); // 'signin' or 'signup'
  const [loading, setLoading] = useState(false);

  // Sign In Form State
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Sign Up Form State
  const [registerName, setRegisterName] = useState('');
  const [registerEmail, setRegisterEmail] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');
  const [registerConfirmPassword, setRegisterConfirmPassword] = useState('');
  const [registerRole, setRegisterRole] = useState('officer');
  const [registerCpse, setRegisterCpse] = useState('ONGC');
  const [registerDesignation, setRegisterDesignation] = useState('Materials & Procurement Officer');

  const handleRoleChange = (newRole) => {
    setRegisterRole(newRole);
    if (newRole === 'viewer') {
      setRegisterCpse('Public Citizen');
      setRegisterDesignation('Public Citizen / Auditor');
    } else if (newRole === 'admin') {
      setRegisterCpse('MoPNG');
      setRegisterDesignation('MoPNG Master Administrator');
    } else {
      setRegisterCpse('ONGC');
      setRegisterDesignation('Materials & Procurement Officer');
    }
  };

  if (!isLoginModalOpen) return null;

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    if (!loginEmail || !loginPassword) {
      toast.error('Please enter your email and password');
      return;
    }
    setLoading(true);
    try {
      const user = await login(loginEmail, loginPassword);
      toast.success(`Welcome back, ${user.name}!`);
      setLoginPassword('');
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.error || err.message || 'Login failed. Please check credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    if (!registerName || !registerEmail || !registerPassword) {
      toast.error('Please fill in all required fields');
      return;
    }
    if (registerPassword !== registerConfirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    if (registerPassword.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    const isViewer = registerRole === 'viewer';
    const isAdmin = registerRole === 'admin';
    const cpseOrg = isAdmin ? 'MoPNG' : isViewer ? 'Public Citizen' : registerCpse;
    const desig = isAdmin 
      ? 'MoPNG Master Administrator' 
      : isViewer 
      ? 'Public Citizen / Auditor' 
      : (registerDesignation.trim() || 'Materials & Procurement Officer');

    setLoading(true);
    try {
      const user = await register({
        name: registerName.trim(),
        email: registerEmail.trim(),
        password: registerPassword,
        role: registerRole,
        cpse_organization: cpseOrg,
        designation: desig
      });
      toast.success(`Account created successfully as ${user.name}!`);
      setIsLoginModalOpen(false);
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.error || err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-white border border-slate-200 rounded-2xl shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="p-4 sm:p-5 bg-white border-b border-slate-200/80 flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-200/60 flex items-center justify-center text-blue-600 text-lg font-bold shadow-2xs">
              <FiShield />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-slate-900 leading-tight">EkCode Authentication</h3>
              <p className="text-[11px] text-slate-500 font-medium">National Petroleum & Energy Materials DPI</p>
            </div>
          </div>
          <button
            onClick={() => setIsLoginModalOpen(false)}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
          >
            <FiX className="text-lg" />
          </button>
        </div>

        <div className="p-5 sm:p-6 space-y-4 max-h-[82vh] overflow-y-auto">
          {/* Production Real-Database Badge (inspired by KaryaSetu) */}
          <div className="flex items-center justify-between pb-0.5">
            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase bg-emerald-50 text-emerald-700 border border-emerald-200/80">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1.5 animate-pulse"></span>
              REAL-TIME ENTERPRISE AUTHENTICATION
            </span>
          </div>

          {/* Sign In vs Sign Up Tabs (Pill Container) */}
          <div className="flex bg-slate-100/80 p-1 rounded-xl border border-slate-200/60">
            <button
              type="button"
              onClick={() => setActiveTab('signin')}
              className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                activeTab === 'signin'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('signup')}
              className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                activeTab === 'signup'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Create Account (Sign Up)
            </button>
          </div>

          {/* TAB 1: Sign In Form */}
          {activeTab === 'signin' && (
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Email Address
                </label>
                <div className="relative">
                  <FiMail className="absolute left-3 top-3 text-slate-400" />
                  <input
                    type="email"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    placeholder="officer@ongc.in"
                    required
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-9 pr-3.5 py-2.5 text-xs sm:text-sm text-slate-900 focus:outline-none focus:border-blue-600 font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Password
                </label>
                <div className="relative">
                  <FiLock className="absolute left-3 top-3 text-slate-400" />
                  <input
                    type="password"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-9 pr-3.5 py-2.5 text-xs sm:text-sm text-slate-900 focus:outline-none focus:border-blue-600"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold text-xs sm:text-sm shadow-xs transition-colors flex items-center justify-center space-x-1.5 cursor-pointer disabled:opacity-50"
              >
                <FiLogIn />
                <span>{loading ? 'Verifying Credentials...' : 'Sign In to Portal →'}</span>
              </button>
            </form>
          )}

          {/* TAB 2: Sign Up Form */}
          {activeTab === 'signup' && (
            <form onSubmit={handleRegisterSubmit} className="space-y-3.5">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Full Name
                </label>
                <div className="relative">
                  <FiUser className="absolute left-3 top-2.5 text-slate-400" />
                  <input
                    type="text"
                    value={registerName}
                    onChange={(e) => setRegisterName(e.target.value)}
                    placeholder="e.g. Vikram Sharma"
                    required
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-9 pr-3.5 py-2 text-xs text-slate-900 focus:outline-none focus:border-blue-600 font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Email Address
                </label>
                <div className="relative">
                  <FiMail className="absolute left-3 top-2.5 text-slate-400" />
                  <input
                    type="email"
                    value={registerEmail}
                    onChange={(e) => setRegisterEmail(e.target.value)}
                    placeholder="name@domain.com"
                    required
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-9 pr-3.5 py-2 text-xs text-slate-900 focus:outline-none focus:border-blue-600 font-medium"
                  />
                </div>
              </div>

              {/* Role Scope Selector (Interactive Persona Cards) */}
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Select Account Persona & Scope
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => handleRoleChange('officer')}
                    className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                      registerRole === 'officer'
                        ? 'border-2 border-blue-600 bg-blue-50/60 shadow-2xs'
                        : 'border-slate-200 bg-white hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-base">🏢</span>
                      <span className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${
                        registerRole === 'officer' ? 'border-blue-600 bg-blue-600' : 'border-slate-300'
                      }`}>
                        {registerRole === 'officer' && <span className="w-1.5 h-1.5 rounded-full bg-white"></span>}
                      </span>
                    </div>
                    <div className="text-xs font-bold text-slate-900 leading-tight">CPSE Officer</div>
                    <div className="text-[10px] text-slate-500 mt-0.5">Procurement</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleRoleChange('admin')}
                    className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                      registerRole === 'admin'
                        ? 'border-2 border-amber-600 bg-amber-50/60 shadow-2xs'
                        : 'border-slate-200 bg-white hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-base">👑</span>
                      <span className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${
                        registerRole === 'admin' ? 'border-amber-600 bg-amber-600' : 'border-slate-300'
                      }`}>
                        {registerRole === 'admin' && <span className="w-1.5 h-1.5 rounded-full bg-white"></span>}
                      </span>
                    </div>
                    <div className="text-xs font-bold text-slate-900 leading-tight">MoPNG Admin</div>
                    <div className="text-[10px] text-slate-500 mt-0.5">Governance</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleRoleChange('viewer')}
                    className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                      registerRole === 'viewer'
                        ? 'border-2 border-emerald-600 bg-emerald-50/60 shadow-2xs'
                        : 'border-slate-200 bg-white hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-base">🌐</span>
                      <span className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${
                        registerRole === 'viewer' ? 'border-emerald-600 bg-emerald-600' : 'border-slate-300'
                      }`}>
                        {registerRole === 'viewer' && <span className="w-1.5 h-1.5 rounded-full bg-white"></span>}
                      </span>
                    </div>
                    <div className="text-xs font-bold text-slate-900 leading-tight">Public Citizen</div>
                    <div className="text-[10px] text-slate-500 mt-0.5">Open Data</div>
                  </button>
                </div>
              </div>

              {registerRole === 'officer' && (
                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-700 mb-1">
                      CPSE Enterprise
                    </label>
                    <select
                      value={registerCpse}
                      onChange={(e) => setRegisterCpse(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl px-2.5 py-2 text-xs text-slate-900 font-semibold focus:outline-none focus:border-blue-600 cursor-pointer"
                    >
                      <option value="ONGC">ONGC</option>
                      <option value="BPCL">BPCL</option>
                      <option value="IOC">IOC</option>
                      <option value="HPCL">HPCL</option>
                      <option value="GAIL">GAIL</option>
                      <option value="NTPC">NTPC</option>
                      <option value="SAIL">SAIL</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-700 mb-1">
                      Designation
                    </label>
                    <input
                      type="text"
                      value={registerDesignation}
                      onChange={(e) => setRegisterDesignation(e.target.value)}
                      placeholder="Materials & Procurement Officer"
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl px-2.5 py-2 text-xs text-slate-900 focus:outline-none focus:border-blue-600"
                    />
                  </div>
                </div>
              )}

              {registerRole === 'admin' && (
                <div className="p-3 bg-amber-50/90 border border-amber-200 rounded-xl flex items-start space-x-2.5 text-left">
                  <span className="text-base mt-0.5">👑</span>
                  <div className="text-[11px] leading-relaxed">
                    <div className="font-bold text-amber-950">MoPNG Master Administrator Persona</div>
                    <div className="text-amber-800">
                      Organization: <span className="font-semibold text-amber-950">MoPNG</span> · Designation: <span className="font-semibold text-amber-950">MoPNG Master Administrator</span>
                    </div>
                    <div className="text-amber-700 text-[10px] mt-0.5">
                      Full authority: Catalog governance, Cross-CPSE approval, ERP Sync & Audit logs.
                    </div>
                  </div>
                </div>
              )}

              {registerRole === 'viewer' && (
                <div className="p-3 bg-emerald-50/90 border border-emerald-200 rounded-xl flex items-start space-x-2.5 text-left">
                  <span className="text-base mt-0.5">🌐</span>
                  <div className="text-[11px] leading-relaxed">
                    <div className="font-bold text-emerald-950">Public Citizen / Auditor Persona</div>
                    <div className="text-emerald-800">
                      Organization: <span className="font-semibold text-emerald-950">Public Citizen</span> · Designation: <span className="font-semibold text-emerald-950">Public Citizen / Auditor</span>
                    </div>
                    <div className="text-emerald-700 text-[10px] mt-0.5">
                      Open Data Access: Read-only access to Central Master Catalogue & Semantic Graph.
                    </div>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-700 mb-1">
                    Password
                  </label>
                  <input
                    type="password"
                    value={registerPassword}
                    onChange={(e) => setRegisterPassword(e.target.value)}
                    placeholder="Min 6 chars"
                    required
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-2.5 py-2 text-xs text-slate-900 focus:outline-none focus:border-blue-600"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-700 mb-1">
                    Confirm Password
                  </label>
                  <input
                    type="password"
                    value={registerConfirmPassword}
                    onChange={(e) => setRegisterConfirmPassword(e.target.value)}
                    placeholder="Repeat password"
                    required
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-2.5 py-2 text-xs text-slate-900 focus:outline-none focus:border-blue-600"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold text-xs sm:text-sm shadow-xs transition-colors flex items-center justify-center space-x-1.5 cursor-pointer disabled:opacity-50 mt-1"
              >
                <FiUserPlus />
                <span>{loading ? 'Creating Account...' : 'Complete Registration & Access DPI →'}</span>
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

export default LoginModal;
