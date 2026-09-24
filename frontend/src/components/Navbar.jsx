import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  MdDashboard, 
  MdUpload, 
  MdCompareArrows, 
  MdViewList, 
  MdTimeline, 
  MdMenu, 
  MdClose 
} from 'react-icons/md';
import { FiLogOut, FiLogIn, FiShield } from 'react-icons/fi';
import toast from 'react-hot-toast';

function Navbar() {
  const location = useLocation();
  const { 
    currentUser, 
    currentRole, 
    logout, 
    setIsLoginModalOpen 
  } = useAuth();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Strict Role-Based Nav Links (Pure Abstraction - No Lock Icons or Forbidden Teases)
  const allNavLinks = [
    { name: 'Dashboard', path: '/', icon: <MdDashboard />, roles: ['viewer', 'officer', 'admin'] },
    { name: 'Upload', path: '/upload', icon: <MdUpload />, roles: ['officer', 'admin'] },
    { name: 'Matches', path: '/matches', icon: <MdCompareArrows />, roles: ['officer', 'admin'] },
    { name: 'Master', path: '/master', icon: <MdViewList />, roles: ['viewer', 'officer', 'admin'] },
    { name: 'Harmonization', path: '/graph', icon: <MdTimeline />, roles: ['viewer', 'officer', 'admin'] },
    { name: 'Governance & ERP', path: '/governance', icon: <FiShield />, roles: ['admin'] }
  ];

  const visibleLinks = allNavLinks.filter(link => link.roles.includes(currentRole));

  const handleLogout = () => {
    logout();
    toast.success('Signed out successfully');
  };

  return (
    <nav className="sticky top-0 z-40 bg-white/85 backdrop-blur-md border-b border-slate-200/80 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo & Tagline */}
          <div className="flex items-center space-x-3">
            <Link to="/" className="flex items-center flex-shrink-0 group">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-blue-500 flex items-center justify-center text-white shadow-xs font-black text-xs tracking-wider mr-2.5">
                EK
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-black text-slate-900 tracking-tight leading-none">
                  EkCode
                </span>
                <span className="text-[10px] font-semibold text-slate-500 tracking-tight mt-0.5 hidden sm:inline-block">
                  One Nation, One Material Code
                </span>
              </div>
            </Link>
          </div>

          {/* Desktop Navigation Links (Scoped to currentRole) */}
          <div className="hidden lg:flex items-center space-x-1.5">
            {visibleLinks.map((link) => {
              const isActive = location.pathname === link.path;
              return (
                <Link
                  key={link.name}
                  to={link.path}
                  className={`flex items-center px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                    isActive
                      ? 'bg-slate-900 text-white font-bold shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
                  }`}
                >
                  <span className="mr-1.5 text-base">{link.icon}</span>
                  {link.name}
                </Link>
              );
            })}
          </div>

          {/* User Profile / Genuine Authentication Controls */}
          <div className="flex items-center space-x-3">
            {currentUser ? (
              <div className="flex items-center space-x-2.5 bg-white border border-slate-200 shadow-2xs px-3 py-1.5 rounded-xl">
                <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold shadow-2xs ${
                  currentUser.role === 'admin'
                    ? 'bg-amber-100 text-amber-900 border border-amber-300/80'
                    : currentUser.role === 'viewer'
                    ? 'bg-emerald-100 text-emerald-900 border border-emerald-300/80'
                    : 'bg-blue-100 text-blue-900 border border-blue-300/80'
                }`}>
                  {currentUser.role === 'admin'
                    ? '👑'
                    : currentUser.role === 'viewer'
                    ? '🌐'
                    : currentUser.name
                    ? currentUser.name.slice(0, 2).toUpperCase()
                    : 'CP'}
                </div>
                <div className="hidden sm:flex flex-col text-left">
                  <span className="text-xs font-bold text-slate-900 leading-tight truncate max-w-[140px]">
                    {currentUser.name}
                  </span>
                  <span className={`text-[10px] font-bold leading-tight ${
                    currentUser.role === 'admin'
                      ? 'text-amber-700'
                      : currentUser.role === 'viewer'
                      ? 'text-emerald-700'
                      : 'text-blue-700'
                  }`}>
                    {currentUser.role === 'admin'
                      ? (currentUser.designation || 'MoPNG National Admin')
                      : currentUser.role === 'viewer'
                      ? (currentUser.designation || 'Public Citizen / Auditor')
                      : `${currentUser.cpse_organization || 'CPSE'} · ${currentUser.designation || 'Officer'}`}
                  </span>
                </div>
                <button
                  onClick={handleLogout}
                  title="Sign Out"
                  className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors ml-1 cursor-pointer"
                >
                  <FiLogOut className="text-sm" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => setIsLoginModalOpen(true)}
                className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
              >
                <FiLogIn className="text-sm" />
                <span>Sign In / Register</span>
              </button>
            )}

            {/* Mobile Menu Hamburger Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <MdClose className="text-xl" /> : <MdMenu className="text-xl" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Navigation Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-white/95 backdrop-blur-md border-t border-slate-200/80 px-4 pt-2 pb-4 space-y-1 shadow-lg">
          {visibleLinks.map((link) => {
            const isActive = location.pathname === link.path;
            return (
              <Link
                key={link.name}
                to={link.path}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-slate-900 text-white shadow-xs font-bold'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <span className="mr-3 text-base">{link.icon}</span>
                {link.name}
              </Link>
            );
          })}

          <div className="pt-3 border-t border-slate-200 flex items-center justify-between text-xs text-slate-600 px-2">
            {currentUser ? (
              <div className="flex items-center justify-between w-full">
                <div className="flex flex-col">
                  <span className="text-slate-900 font-bold leading-tight">{currentUser.name}</span>
                  <span className={`text-[11px] font-semibold mt-0.5 ${
                    currentUser.role === 'admin'
                      ? 'text-amber-700'
                      : currentUser.role === 'viewer'
                      ? 'text-emerald-700'
                      : 'text-blue-700'
                  }`}>
                    {currentUser.role === 'admin'
                      ? (currentUser.designation || 'MoPNG National Admin')
                      : currentUser.role === 'viewer'
                      ? (currentUser.designation || 'Public Citizen / Auditor')
                      : `${currentUser.cpse_organization || 'CPSE'} · ${currentUser.designation || 'Officer'}`}
                  </span>
                </div>
                <button
                  onClick={() => {
                    handleLogout();
                    setMobileMenuOpen(false);
                  }}
                  className="text-rose-600 font-bold hover:underline ml-4"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  setIsLoginModalOpen(true);
                }}
                className="text-slate-900 font-bold hover:underline"
              >
                Sign In / Register
              </button>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}

export default Navbar;
