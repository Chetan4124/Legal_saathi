import { createContext, useState, useEffect, useCallback } from 'react';
import { loginUser, registerUser, getProfile } from '../api/auth';

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = useCallback(async () => {
    try {
      const { data } = await getProfile();
      setUser(data);
    } catch {
      setUser(null);
      localStorage.clear();
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (token) fetchProfile();
    else setLoading(false);
  }, [fetchProfile]);

  const login = async (credentials) => {
    const { data } = await loginUser(credentials);
    localStorage.setItem('access_token', data.access);
    localStorage.setItem('refresh_token', data.refresh);
    await fetchProfile();
  };

  const register = async (credentials) => {
    await registerUser(credentials);
    // Auto-login after register
    await login({ email: credentials.email, password: credentials.password });
  };

  const logout = () => {
    localStorage.clear();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}