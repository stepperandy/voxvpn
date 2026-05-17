import { createContext, useContext, useState } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem('voxvpn_user')) || null; } catch { return null; }
  });

  const login = (userData) => {
    localStorage.setItem('voxvpn_user', JSON.stringify(userData));
    setUser(userData);
  };

  const logout = async () => {
    localStorage.removeItem('voxvpn_user');
    // Clear secure token from OS keychain
    if (window.electronVPN?.clearToken) {
      await window.electronVPN.clearToken();
    } else {
      localStorage.removeItem('voxvpn_token');
    }
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);