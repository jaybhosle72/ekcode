import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import FloatingChat from './components/FloatingChat';
import LoginModal from './components/LoginModal';
import Dashboard from './pages/Dashboard';
import Upload from './pages/Upload';
import Matches from './pages/Matches';
import MaterialMaster from './pages/MaterialMaster';
import KnowledgeGraph from './pages/KnowledgeGraph';
import Governance from './pages/Governance';

/**
 * RoleRoute: Role-Based UI Abstraction Guard
 * If user does not have permission, silently redirect to home ('/')
 * Strictly abstracts away restricted modules with zero teasing or lock warnings.
 */
function RoleRoute({ allowedRoles, children }) {
  const { currentRole } = useAuth();
  if (!allowedRoles.includes(currentRole)) {
    return <Navigate to="/" replace />;
  }
  return children;
}

function AppContent() {
  return (
    <div className="min-h-screen text-[#0F172A] flex flex-col font-sans relative overflow-x-hidden">
      {/* Ambient Saffron / Emerald National Theme Mesh Background (inspired by KaryaSetu / Digital Public Infrastructure) */}
      <div 
        className="fixed inset-0 pointer-events-none z-0 overflow-hidden" 
        aria-hidden="true"
      >
        {/* Top-Right Soft Saffron Glow */}
        <div className="absolute -top-40 -right-40 w-[650px] h-[650px] sm:w-[850px] sm:h-[850px] rounded-full bg-gradient-to-br from-amber-200/50 via-orange-200/30 to-transparent blur-3xl opacity-80" />
        
        {/* Bottom-Left Soft Mint/Emerald Glow */}
        <div className="absolute -bottom-40 -left-40 w-[650px] h-[650px] sm:w-[850px] sm:h-[850px] rounded-full bg-gradient-to-tr from-emerald-200/50 via-teal-200/30 to-transparent blur-3xl opacity-80" />

        {/* Ambient Mid-Tone Diffusions */}
        <div className="absolute top-1/4 right-0 w-[500px] h-[500px] rounded-full bg-orange-100/30 blur-3xl pointer-events-none" />
        <div className="absolute bottom-1/3 left-0 w-[500px] h-[500px] rounded-full bg-emerald-100/30 blur-3xl pointer-events-none" />
      </div>

      <div className="relative z-10 flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-1 overflow-x-hidden overflow-y-auto p-4 sm:p-6 lg:p-8">
          <Routes>
            {/* Public Transparency Pages: Accessible to All Roles */}
            <Route path="/" element={<Dashboard />} />
            <Route path="/master" element={<MaterialMaster />} />
            <Route path="/graph" element={<KnowledgeGraph />} />

            {/* Operational Procurement Modules: Scoped to CPSE Officer & Admin */}
            <Route 
              path="/upload" 
              element={
                <RoleRoute allowedRoles={['officer', 'admin']}>
                  <Upload />
                </RoleRoute>
              } 
            />
            <Route 
              path="/matches" 
              element={
                <RoleRoute allowedRoles={['officer', 'admin']}>
                  <Matches />
                </RoleRoute>
              } 
            />

            {/* Central Governance & ERP Module: Scoped exclusively to Admin */}
            <Route 
              path="/governance" 
              element={
                <RoleRoute allowedRoles={['admin']}>
                  <Governance />
                </RoleRoute>
              } 
            />

            {/* Silent Fallback to Home */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
        {/* Floating AI Copilot & Real Auth Modal */}
        <FloatingChat />
        <LoginModal />
      </div>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
