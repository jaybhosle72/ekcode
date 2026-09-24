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
    <nav className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14">
          {/* Brand Logo & Tagline */}
          <div className="flex items-center space-x-3">
            <Link to="/" className="flex items-center space-x-2.5">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-600 to-indigo-700 text-white flex items-center justify-center font-bold text-xs tracking-wider shadow-sm">
                EK
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-base font-bold text-slate-900 tracking-tight">EkCode</span>
                <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200">
                  DPI
                </span>
                <span className="hidden md:inline-block text-[11px] text-slate-400 font-normal border-l border-slate-200 pl-2">
                  National Materials Standardization
                </span>
              </div>
            </Link>
          </div>

          {/* Desktop Navigation Links */}
          <div className="hidden lg:flex items-center space-x-1">
            {visibleLinks.map((link) => {
              const isActive = location.pathname === link.path;
              return (
                <Link
                  key={link.name}
                  to={link.path}
                  className={`flex items-center px-3 py-1.5 rounded-lg text-xs transition-colors cursor-pointer ${
                    isActive
                      ? 'bg-blue-50 text-blue-700 font-semibold shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50 font-medium'
                  }`}
                >
                  <span className={`mr-1.5 text-sm ${isActive ? 'text-blue-600' : 'text-slate-400'}`}>{link.icon}</span>
                  {link.name}
                </Link>
              );
            })}
          </div>

          {/* User Profile Controls */}
          <div className="flex items-center space-x-2">
            {currentUser ? (
              <div className="flex items-center space-x-2 bg-slate-50 border border-slate-200/80 px-2.5 py-1 rounded-lg">
                <div className={`w-6 h-6 rounded-md flex items-center justify-center text-[10px] font-bold ${
                  currentUser.role === 'admin'
                    ? 'bg-amber-100 text-amber-800'
                    : currentUser.role === 'viewer'
                    ? 'bg-emerald-100 text-emerald-800'
                    : 'bg-blue-100 text-blue-800'
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
                  <span className="text-xs font-semibold text-slate-900 leading-none truncate max-w-[130px]">
                    {currentUser.name}
                  </span>
                  <span className="text-[10px] text-slate-500 font-medium leading-none mt-1">
                    {currentUser.role === 'admin'
                      ? (currentUser.designation || 'MoPNG Admin')
                      : currentUser.role === 'viewer'
                      ? (currentUser.designation || 'Public Citizen')
                      : `${currentUser.cpse_organization || 'CPSE'} · ${currentUser.designation || 'Officer'}`}
                  </span>
                </div>
                <button
                  onClick={handleLogout}
                  title="Sign Out"
                  className="p-1 text-slate-400 hover:text-rose-600 hover:bg-slate-200/50 rounded transition-colors ml-1 cursor-pointer"
                >
                  <FiLogOut className="text-xs" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => setIsLoginModalOpen(true)}
                className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs shadow-blue-500/20 transition-all cursor-pointer"
              >
                <FiLogIn className="text-xs" />
                <span>Sign In</span>
              </button>
            )}

            {/* Mobile Menu Hamburger Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-1.5 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <MdClose className="text-lg" /> : <MdMenu className="text-lg" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Navigation Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-white border-t border-slate-200 px-4 pt-2 pb-3 space-y-1 shadow-sm">
          {visibleLinks.map((link) => {
            const isActive = location.pathname === link.path;
            return (
              <Link
                key={link.name}
                to={link.path}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                  isActive
                    ? 'bg-slate-100 text-slate-900 font-semibold'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <span className="mr-3 text-base text-slate-500">{link.icon}</span>
                {link.name}
              </Link>
            );
          })}

          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600 px-2">
            {currentUser ? (
              <div className="flex items-center justify-between w-full">
                <div className="flex flex-col">
                  <span className="text-slate-900 font-semibold leading-tight">{currentUser.name}</span>
                  <span className="text-[10px] text-slate-500 font-medium mt-0.5">
                    {currentUser.role === 'admin'
                      ? (currentUser.designation || 'MoPNG Admin')
                      : currentUser.role === 'viewer'
                      ? (currentUser.designation || 'Public Citizen')
                      : `${currentUser.cpse_organization || 'CPSE'} · ${currentUser.designation || 'Officer'}`}
                  </span>
                </div>
                <button
                  onClick={() => {
                    handleLogout();
                    setMobileMenuOpen(false);
                  }}
                  className="text-rose-600 font-medium hover:underline ml-4 text-xs"
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
                className="text-slate-900 font-medium hover:underline text-xs"
              >
                Sign In
              </button>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}

export default Navbar;
