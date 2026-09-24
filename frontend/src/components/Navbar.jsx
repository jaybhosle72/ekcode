import { useState, useRef, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  MdDashboard, 
  MdUpload, 
  MdCompareArrows, 
  MdViewList, 
  MdTimeline, 
  MdMenu, 
  MdClose,
  MdCheckCircle
} from 'react-icons/md';
import { FiLogOut, FiLogIn, FiShield, FiUser, FiChevronDown, FiLayers } from 'react-icons/fi';
import toast from 'react-hot-toast';

function Navbar() {
  const location = useLocation();
  const { 
    currentUser, 
    currentRole, 
    logout, 
    switchDemoPersona, 
    setIsLoginModalOpen 
  } = useAuth();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setProfileDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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

  const handlePersonaSwitch = (key, label) => {
    switchDemoPersona(key);
    setProfileDropdownOpen(false);
    setMobileMenuOpen(false);
    toast.success(`Active Persona: ${label}`);
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

          {/* User Profile / Quick Persona Switcher */}
          <div className="flex items-center space-x-3">
            <div className="relative" ref={dropdownRef}>
              {currentUser ? (
                <button
                  onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                  className="flex items-center space-x-2 bg-[#1e293b] hover:bg-[#253349] border border-[#334155] px-3 py-1.5 rounded-xl transition-all cursor-pointer text-left"
                >
                  <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold text-white shadow-xs ${
                    currentUser.role === 'admin' ? 'bg-amber-600' : 'bg-blue-600'
                  }`}>
                    {currentUser.role === 'admin' ? '👑' : currentUser.name ? currentUser.name.slice(0, 2).toUpperCase() : 'U'}
                  </div>
                  <div className="hidden sm:flex flex-col">
                    <span className="text-xs font-bold text-white leading-tight truncate max-w-[130px]">
                      {currentUser.name}
                    </span>
                    <span className={`text-[10px] font-semibold leading-tight flex items-center gap-1 ${
                      currentUser.role === 'admin' ? 'text-amber-400' : 'text-blue-400'
                    }`}>
                      {currentUser.role === 'admin' 
                        ? 'MoPNG National Admin' 
                        : `${currentUser.cpse_organization || 'CPSE'} Officer`}
                    </span>
                  </div>
                  <FiChevronDown className="text-[#94a3b8] text-xs ml-1" />
                </button>
              ) : (
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                    className="hidden sm:flex items-center space-x-1.5 px-2.5 py-1.5 rounded-lg bg-[#1e293b] border border-[#334155] hover:border-slate-500 text-[#94a3b8] hover:text-white text-xs font-medium transition-colors cursor-pointer"
                    title="Switch Demo Role"
                  >
                    <FiLayers className="text-blue-400" />
                    <span>Role: <strong className="text-slate-200">Public Viewer</strong></span>
                    <FiChevronDown className="text-[10px]" />
                  </button>
                  <button
                    onClick={() => setIsLoginModalOpen(true)}
                    className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg bg-[#3b82f6] hover:bg-blue-600 text-white text-xs font-bold transition-all shadow-sm cursor-pointer"
                  >
                    <FiLogIn className="text-sm" />
                    <span>Sign In</span>
                  </button>
                </div>
              )}

              {/* Persona Switcher Dropdown Menu */}
              {profileDropdownOpen && (
                <div className="absolute right-0 mt-2 w-72 bg-[#1e293b] border border-[#334155] rounded-xl shadow-2xl py-2 z-50 text-xs">
                  <div className="px-3.5 py-2 border-b border-[#334155]">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-[#94a3b8]">
                      Role Scope Switcher
                    </div>
                    <div className="text-[11px] text-slate-300 mt-0.5">
                      Switch login scope to preview role-based abstraction.
                    </div>
                  </div>

                  <div className="p-1 space-y-0.5">
                    {/* Persona 1: ONGC Officer */}
                    <button
                      onClick={() => handlePersonaSwitch('ongc_officer', 'ONGC Procurement Officer')}
                      className={`w-full text-left px-3 py-2 rounded-lg flex items-center justify-between hover:bg-[#253349] transition-colors cursor-pointer ${
                        currentUser?.cpse_organization === 'ONGC' ? 'bg-[#253349] text-white font-semibold' : 'text-[#cbd5e1]'
                      }`}
                    >
                      <div className="flex items-center space-x-2">
                        <span className="text-base">🏢</span>
                        <div>
                          <div className="text-xs font-bold text-white">ONGC Procurement Officer</div>
                          <div className="text-[10px] text-slate-400">Vikram Sharma · Ingestion & Matches</div>
                        </div>
                      </div>
                      {currentUser?.cpse_organization === 'ONGC' && <MdCheckCircle className="text-blue-400 text-sm" />}
                    </button>

                    {/* Persona 2: BPCL Officer */}
                    <button
                      onClick={() => handlePersonaSwitch('bpcl_officer', 'BPCL Procurement Officer')}
                      className={`w-full text-left px-3 py-2 rounded-lg flex items-center justify-between hover:bg-[#253349] transition-colors cursor-pointer ${
                        currentUser?.cpse_organization === 'BPCL' ? 'bg-[#253349] text-white font-semibold' : 'text-[#cbd5e1]'
                      }`}
                    >
                      <div className="flex items-center space-x-2">
                        <span className="text-base">🛢️</span>
                        <div>
                          <div className="text-xs font-bold text-white">BPCL Procurement Officer</div>
                          <div className="text-[10px] text-slate-400">Pooja Iyer · Ingestion & Matches</div>
                        </div>
                      </div>
                      {currentUser?.cpse_organization === 'BPCL' && <MdCheckCircle className="text-blue-400 text-sm" />}
                    </button>

                    {/* Persona 3: MoPNG National Admin */}
                    <button
                      onClick={() => handlePersonaSwitch('admin', 'MoPNG National Admin')}
                      className={`w-full text-left px-3 py-2 rounded-lg flex items-center justify-between hover:bg-[#253349] transition-colors cursor-pointer ${
                        currentUser?.role === 'admin' ? 'bg-[#253349] text-white font-semibold' : 'text-[#cbd5e1]'
                      }`}
                    >
                      <div className="flex items-center space-x-2">
                        <span className="text-base">👑</span>
                        <div>
                          <div className="text-xs font-bold text-amber-300">MoPNG National Admin</div>
                          <div className="text-[10px] text-slate-400">Dr. Rajesh Verma · Full Governance & ERP</div>
                        </div>
                      </div>
                      {currentUser?.role === 'admin' && <MdCheckCircle className="text-amber-400 text-sm" />}
                    </button>

                    {/* Persona 4: Public Viewer */}
                    <button
                      onClick={() => handlePersonaSwitch('viewer', 'Public Citizen / Auditor')}
                      className={`w-full text-left px-3 py-2 rounded-lg flex items-center justify-between hover:bg-[#253349] transition-colors cursor-pointer ${
                        !currentUser ? 'bg-[#253349] text-white font-semibold' : 'text-[#cbd5e1]'
                      }`}
                    >
                      <div className="flex items-center space-x-2">
                        <span className="text-base">👤</span>
                        <div>
                          <div className="text-xs font-bold text-white">Public Citizen / Auditor</div>
                          <div className="text-[10px] text-slate-400">Read-Only Open Data Transparency</div>
                        </div>
                      </div>
                      {!currentUser && <MdCheckCircle className="text-emerald-400 text-sm" />}
                    </button>
                  </div>

                  {currentUser && (
                    <div className="mt-1 pt-1 border-t border-[#334155] px-1">
                      <button
                        onClick={() => {
                          logout();
                          setProfileDropdownOpen(false);
                          toast.success('Signed out successfully');
                        }}
                        className="w-full text-left px-3 py-2 text-rose-400 hover:bg-rose-950/40 rounded-lg flex items-center space-x-2 font-semibold transition-colors cursor-pointer"
                      >
                        <FiLogOut />
                        <span>Sign Out Session</span>
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

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

          {/* Mobile Persona Switcher */}
          <div className="pt-3 border-t border-[#334155] space-y-2">
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-2">
              Current Scope: {currentUser ? currentUser.name : 'Public Citizen'}
            </div>
            <div className="grid grid-cols-2 gap-2 px-1">
              <button
                onClick={() => handlePersonaSwitch('ongc_officer', 'ONGC Officer')}
                className="px-2 py-1.5 bg-[#1e293b] rounded text-[11px] text-slate-200 text-left font-medium"
              >
                🏢 ONGC Officer
              </button>
              <button
                onClick={() => handlePersonaSwitch('admin', 'MoPNG Admin')}
                className="px-2 py-1.5 bg-[#1e293b] rounded text-[11px] text-amber-300 text-left font-medium"
              >
                👑 MoPNG Admin
              </button>
              <button
                onClick={() => handlePersonaSwitch('viewer', 'Public Citizen')}
                className="px-2 py-1.5 bg-[#1e293b] rounded text-[11px] text-slate-200 text-left font-medium col-span-2"
              >
                👤 Public Citizen / Viewer
              </button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}

export default Navbar;
