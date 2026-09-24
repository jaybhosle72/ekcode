import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { FiX, FiShield, FiLogIn, FiUserPlus, FiMail, FiLock, FiUser, FiCheckCircle } from 'react-icons/fi';
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
  const [registerCpse, setRegisterCpse] = useState('ONGC');
  const [registerDesignation, setRegisterDesignation] = useState('Materials & Procurement Officer');

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

    setLoading(true);
    try {
      const user = await register({
        name: registerName,
        email: registerEmail,
        password: registerPassword,
        cpse_organization: registerCpse,
        designation: registerDesignation
      });
      toast.success(`Account created successfully for ${user.name}!`);
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
        <div className="p-4 sm:p-5 bg-gradient-to-r from-[#1E293B] to-[#243C4C] text-white flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white text-base font-bold shadow-xs">
              <FiShield />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold leading-tight">EkCode Authentication</h3>
              <p className="text-[11px] text-slate-300">Central Material Master Portal</p>
            </div>
          </div>
          <button
            onClick={() => setIsLoginModalOpen(false)}
            className="p-1.5 text-slate-300 hover:text-white hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
          >
            <FiX className="text-lg" />
          </button>
        </div>

        <div className="p-5 sm:p-6 space-y-5 max-h-[82vh] overflow-y-auto">
          {/* Sign In vs Sign Up Tabs */}
          <div className="flex border-b border-slate-200">
            <button
              type="button"
              onClick={() => setActiveTab('signin')}
              className={`flex-1 pb-3 text-xs sm:text-sm font-bold border-b-2 transition-all cursor-pointer ${
                activeTab === 'signin'
                  ? 'border-blue-600 text-slate-900'
                  : 'border-transparent text-slate-400 hover:text-slate-700'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('signup')}
              className={`flex-1 pb-3 text-xs sm:text-sm font-bold border-b-2 transition-all cursor-pointer ${
                activeTab === 'signup'
                  ? 'border-blue-600 text-slate-900'
                  : 'border-transparent text-slate-400 hover:text-slate-700'
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
                    placeholder="yourname@gmail.com"
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
                className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-xs sm:text-sm shadow-sm transition-colors flex items-center justify-center space-x-1.5 cursor-pointer disabled:opacity-50"
              >
                <FiLogIn />
                <span>{loading ? 'Verifying Credentials...' : 'Sign In'}</span>
              </button>

              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-[11px] text-slate-500 flex items-start space-x-2">
                <FiCheckCircle className="text-blue-600 text-sm mt-0.5 flex-shrink-0" />
                <span>First time here? Click <strong>Create Account</strong> above to register with your email.</span>
              </div>
            </form>
          )}

          {/* TAB 2: Sign Up Form */}
          {activeTab === 'signup' && (
            <form onSubmit={handleRegisterSubmit} className="space-y-3.5">
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 mb-1">
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
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-9 pr-3.5 py-2 text-xs sm:text-sm text-slate-900 focus:outline-none focus:border-blue-600 font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Email Address
                </label>
                <div className="relative">
                  <FiMail className="absolute left-3 top-2.5 text-slate-400" />
                  <input
                    type="email"
                    value={registerEmail}
                    onChange={(e) => setRegisterEmail(e.target.value)}
                    placeholder="name@gmail.com"
                    required
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-9 pr-3.5 py-2 text-xs sm:text-sm text-slate-900 focus:outline-none focus:border-blue-600 font-medium"
                  />
                </div>
              </div>

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
                    <option value="MoPNG">MoPNG (Admin)</option>
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
                    placeholder="Procurement Officer"
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-2.5 py-2 text-xs text-slate-900 focus:outline-none focus:border-blue-600"
                  />
                </div>
              </div>

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
                className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-xs sm:text-sm shadow-sm transition-colors flex items-center justify-center space-x-1.5 cursor-pointer disabled:opacity-50 mt-2"
              >
                <FiUserPlus />
                <span>{loading ? 'Creating Account in Database...' : 'Register & Log In'}</span>
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

export default LoginModal;
