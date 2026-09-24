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
    <div className="min-h-screen bg-[#F8FAFC] text-[#0F172A] flex flex-col font-sans">
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
