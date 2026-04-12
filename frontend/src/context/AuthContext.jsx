import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [authEnabled, setAuthEnabled] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/auth/me')
      .then((r) => r.json())
      .then((data) => {
        if (data.authenticated && data.authEnabled) {
          setAuthEnabled(true);
          setUser(data);
        } else if (data.authEnabled) {
          setAuthEnabled(true);
        } else {
          setAuthEnabled(false);
        }
      })
      .catch(() => setAuthEnabled(false))
      .finally(() => setLoading(false));
  }, []);

  const login = () => {
    window.location.href = '/auth/login';
  };

  const logout = async () => {
    await fetch('/auth/logout', { method: 'POST' });
    setUser(null);
    window.location.href = '/';
  };

  return (
    <AuthContext.Provider value={{ user, authEnabled, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
