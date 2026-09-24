import { Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import FloatingChat from './components/FloatingChat';
import LoginModal from './components/LoginModal';
import Dashboard from './pages/Dashboard';
import Upload from './pages/Upload';
import Matches from './pages/Matches';
import MaterialMaster from './pages/MaterialMaster';
import KnowledgeGraph from './pages/KnowledgeGraph';
import Governance from './pages/Governance';

function App() {
  return (
    <AuthProvider>
      <div className="min-h-screen bg-[#F8FAFC] text-[#0F172A] flex flex-col font-sans">
        <Navbar />
        <main className="flex-1 overflow-x-hidden overflow-y-auto p-4 sm:p-6 lg:p-8">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/upload" element={<Upload />} />
            <Route path="/matches" element={<Matches />} />
            <Route path="/master" element={<MaterialMaster />} />
            <Route path="/graph" element={<KnowledgeGraph />} />
            <Route path="/governance" element={<Governance />} />
          </Routes>
        </main>
        {/* Floating AI Copilot & Real Auth Modal */}
        <FloatingChat />
        <LoginModal />
      </div>
    </AuthProvider>
  );
}

export default App;
