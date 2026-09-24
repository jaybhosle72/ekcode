import { createContext, useContext, useState, useEffect } from 'react';
import { loginUser, registerUser, googleAuth } from '../services/api';

const AuthContext = createContext();

export const DEMO_PERSONAS = {
  ongc_officer: {
    id: 'demo-officer-ongc',
    name: 'Vikram Sharma',
    email: 'vikram.sharma@ongc.in',
    role: 'officer',
    cpse_organization: 'ONGC',
    designation: 'Sr. Procurement Manager',
    avatar: 'https://api.dicebear.com/7.x/initials/svg?seed=Vikram%20Sharma&backgroundColor=2563EB'
  },
  bpcl_officer: {
    id: 'demo-officer-bpcl',
    name: 'Pooja Iyer',
    email: 'pooja.iyer@bpcl.in',
    role: 'officer',
    cpse_organization: 'BPCL',
    designation: 'Procurement Specialist',
    avatar: 'https://api.dicebear.com/7.x/initials/svg?seed=Pooja%20Iyer&backgroundColor=0284C7'
  },
  admin: {
    id: 'demo-admin-mopng',
    name: 'Dr. Rajesh Verma',
    email: 'rajesh.verma@nic.in',
    role: 'admin',
    cpse_organization: 'MoPNG',
    designation: 'Joint Secretary & Master Admin',
    avatar: 'https://api.dicebear.com/7.x/initials/svg?seed=Rajesh%20Verma&backgroundColor=D97706'
  },
  viewer: null // Unauthenticated public citizen / auditor mode
};

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const saved = localStorage.getItem('ekcode_auth_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  useEffect(() => {
    try {
      if (currentUser) {
        localStorage.setItem('ekcode_auth_user', JSON.stringify(currentUser));
      } else {
        localStorage.removeItem('ekcode_auth_user');
      }
    } catch (e) {
      console.warn('Could not update localStorage auth user:', e);
    }
  }, [currentUser]);

  // Role Scoping Helpers
  const currentRole = currentUser?.role || 'viewer';
  const isViewer = currentRole === 'viewer';
  const isOfficer = currentRole === 'officer';
  const isAdmin = currentRole === 'admin';
  const canUpload = isOfficer || isAdmin;
  const canMatch = isOfficer || isAdmin;
  const canGovern = isAdmin;

  const login = async (email, password) => {
    const res = await loginUser({ email, password });
    if (res.data?.success && res.data?.user) {
      setCurrentUser(res.data.user);
      setIsLoginModalOpen(false);
      return res.data.user;
    }
    throw new Error(res.data?.error || 'Login failed');
  };

  const register = async (userData) => {
    const res = await registerUser(userData);
    if (res.data?.success && res.data?.user) {
      setCurrentUser(res.data.user);
      setIsLoginModalOpen(false);
      return res.data.user;
    }
    throw new Error(res.data?.error || 'Registration failed');
  };

  const loginWithGoogle = async (googleData) => {
    const res = await googleAuth(googleData);
    if (res.data?.success && res.data?.user) {
      setCurrentUser(res.data.user);
      setIsLoginModalOpen(false);
      return res.data.user;
    }
    throw new Error(res.data?.error || 'Google authentication failed');
  };

  const logout = () => {
    setCurrentUser(null);
  };

  const switchDemoPersona = (key) => {
    const persona = DEMO_PERSONAS[key] !== undefined ? DEMO_PERSONAS[key] : null;
    setCurrentUser(persona);
    setIsLoginModalOpen(false);
    return persona;
  };

  return (
    <AuthContext.Provider value={{ 
      currentUser, 
      currentRole,
      isViewer,
      isOfficer,
      isAdmin,
      canUpload,
      canMatch,
      canGovern,
      login, 
      register, 
      loginWithGoogle, 
      logout, 
      switchDemoPersona,
      isLoginModalOpen, 
      setIsLoginModalOpen 
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
