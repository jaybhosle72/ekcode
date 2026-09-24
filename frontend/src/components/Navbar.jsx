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
    <nav className="sticky top-0 z-40 bg-[#0f172a] border-b border-[#334155] shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo & Tagline */}
          <div className="flex items-center space-x-3">
            <Link to="/" className="flex items-center flex-shrink-0">
              <span className="text-2xl font-bold text-[#3b82f6]">EkCode</span>
              <span className="ml-2 text-xs text-[#94a3b8] italic hidden sm:inline-block">
                Ek Desh, Ek Code
              </span>
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
                  className={`flex items-center px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-[#1e293b] text-white border-b-2 border-[#3b82f6] shadow-inner'
                      : 'text-[#94a3b8] hover:bg-[#1e293b] hover:text-white'
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
              <div className="flex items-center space-x-2.5 bg-[#1e293b] border border-[#334155] px-3 py-1.5 rounded-xl">
                <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold text-white shadow-xs ${
                  currentUser.role === 'admin'
                    ? 'bg-amber-600'
                    : currentUser.role === 'viewer'
                    ? 'bg-emerald-600'
                    : 'bg-blue-600'
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
                  <span className="text-xs font-bold text-white leading-tight truncate max-w-[140px]">
                    {currentUser.name}
                  </span>
                  <span className={`text-[10px] font-semibold leading-tight ${
                    currentUser.role === 'admin'
                      ? 'text-amber-400'
                      : currentUser.role === 'viewer'
                      ? 'text-emerald-400'
                      : 'text-blue-400'
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
                  className="p-1.5 text-[#94a3b8] hover:text-rose-400 rounded-lg hover:bg-[#253349] transition-colors ml-1 cursor-pointer"
                >
                  <FiLogOut className="text-sm" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => setIsLoginModalOpen(true)}
                className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg bg-[#3b82f6] hover:bg-blue-600 text-white text-xs font-bold transition-all shadow-sm cursor-pointer"
              >
                <FiLogIn className="text-sm" />
                <span>Sign In / Register</span>
              </button>
            )}

            {/* Mobile Menu Hamburger Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-lg text-[#94a3b8] hover:text-white hover:bg-[#1e293b] transition-colors cursor-pointer"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <MdClose className="text-xl" /> : <MdMenu className="text-xl" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Navigation Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-[#0f172a] border-t border-[#334155] px-4 pt-2 pb-4 space-y-1">
          {visibleLinks.map((link) => {
            const isActive = location.pathname === link.path;
            return (
              <Link
                key={link.name}
                to={link.path}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center px-3 py-2 rounded-lg text-xs font-semibold transition-colors ${
                  isActive
                    ? 'bg-[#1e293b] text-white border-l-4 border-[#3b82f6]'
                    : 'text-[#94a3b8] hover:bg-[#1e293b] hover:text-white'
                }`}
              >
                <span className="mr-3 text-base">{link.icon}</span>
                {link.name}
              </Link>
            );
          })}

          <div className="pt-3 border-t border-[#334155] flex items-center justify-between text-xs text-[#94a3b8] px-2">
            {currentUser ? (
              <div className="flex items-center justify-between w-full">
                <div className="flex flex-col">
                  <span className="text-white font-bold leading-tight">{currentUser.name}</span>
                  <span className={`text-[11px] font-semibold mt-0.5 ${
                    currentUser.role === 'admin'
                      ? 'text-amber-400'
                      : currentUser.role === 'viewer'
                      ? 'text-emerald-400'
                      : 'text-blue-400'
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
                  className="text-rose-400 font-bold hover:underline ml-4"
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
                className="text-[#3b82f6] font-bold hover:underline"
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
