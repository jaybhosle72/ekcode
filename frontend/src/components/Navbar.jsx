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

function Navbar() {
  const location = useLocation();
  const { currentUser, logout, setIsLoginModalOpen } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { name: 'Dashboard', path: '/', icon: <MdDashboard /> },
    { name: 'Upload', path: '/upload', icon: <MdUpload /> },
    { name: 'Matches', path: '/matches', icon: <MdCompareArrows /> },
    { name: 'Master', path: '/master', icon: <MdViewList /> },
    { name: 'Harmonization', path: '/graph', icon: <MdTimeline /> },
    { name: 'Governance & ERP', path: '/governance', icon: <FiShield /> }
  ];

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

          {/* Desktop Navigation Links */}
          <div className="hidden lg:flex items-center space-x-2">
            {navLinks.map((link) => {
              const isActive = location.pathname === link.path;
              return (
                <Link
                  key={link.name}
                  to={link.path}
                  className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-[#1e293b] text-white border-b-2 border-[#3b82f6]'
                      : 'text-[#94a3b8] hover:bg-[#1e293b] hover:text-white'
                  }`}
                >
                  <span className="mr-2 text-base">{link.icon}</span>
                  {link.name}
                </Link>
              );
            })}
          </div>

          {/* User Profile / Real-Time Login / Logout & Mobile Hamburger */}
          <div className="flex items-center space-x-3">
            {currentUser ? (
              <div className="flex items-center space-x-2 bg-[#1e293b] border border-[#334155] px-3 py-1.5 rounded-lg">
                <div className="w-7 h-7 rounded-full bg-[#3b82f6] flex items-center justify-center text-xs font-bold text-white">
                  {currentUser.name ? currentUser.name.slice(0, 2).toUpperCase() : 'U'}
                </div>
                <div className="hidden sm:flex flex-col text-left">
                  <span className="text-xs font-semibold text-white leading-tight truncate max-w-[120px]">
                    {currentUser.name}
                  </span>
                  <span className="text-[10px] text-[#94a3b8] leading-tight">
                    {currentUser.cpse_organization || 'CPSE'}
                  </span>
                </div>
                <button
                  onClick={logout}
                  title="Log out"
                  className="p-1 text-[#94a3b8] hover:text-rose-400 rounded transition-colors ml-1 cursor-pointer"
                >
                  <FiLogOut className="text-sm" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => setIsLoginModalOpen(true)}
                className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg bg-[#3b82f6] hover:bg-blue-700 text-white text-xs font-semibold transition-colors cursor-pointer"
              >
                <FiLogIn className="text-sm" />
                <span>Sign In / Register</span>
              </button>
            )}

            {/* Mobile Menu Hamburger Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-md text-[#94a3b8] hover:text-white hover:bg-[#1e293b] transition-colors cursor-pointer"
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
          {navLinks.map((link) => {
            const isActive = location.pathname === link.path;
            return (
              <Link
                key={link.name}
                to={link.path}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-[#1e293b] text-white border-l-4 border-[#3b82f6]'
                    : 'text-[#94a3b8] hover:bg-[#1e293b] hover:text-white'
                }`}
              >
                <span className="mr-3 text-lg">{link.icon}</span>
                {link.name}
              </Link>
            );
          })}

          <div className="pt-3 border-t border-[#334155] flex items-center justify-between text-xs text-[#94a3b8] px-2">
            {currentUser ? (
              <div className="flex items-center justify-between w-full">
                <span>Signed in as: <strong className="text-white">{currentUser.name}</strong></span>
                <button
                  onClick={() => {
                    logout();
                    setMobileMenuOpen(false);
                  }}
                  className="text-rose-400 font-bold hover:underline"
                >
                  Log Out
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
