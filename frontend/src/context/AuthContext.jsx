import { createContext, useContext, useState, useEffect } from 'react';
import { loginUser, registerUser, googleAuth } from '../services/api';

const AuthContext = createContext();

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
      isLoginModalOpen, 
      setIsLoginModalOpen 
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
