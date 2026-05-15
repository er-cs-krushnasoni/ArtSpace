import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../api/axiosInstance';
import { tokenStore } from '../api/tokenStore';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  /**
   * On mount: attempt silent refresh using the httpOnly refresh token cookie.
   * If successful, store new access token in memory and restore user state.
   * If it fails (no cookie / expired), user stays logged out — no redirect here.
   */
  useEffect(() => {
    const silentRefresh = async () => {
      try {
        const response = await api.post('/auth/refresh');
        const { accessToken, user: userData } = response.data;
        tokenStore.set(accessToken);
        setUser(userData);
      } catch {
        // No valid refresh token — user is logged out, that's fine
        tokenStore.clear();
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    silentRefresh();
  }, []);

  // Listen for forced logout events dispatched by axiosInstance (refresh failed mid-session)
  useEffect(() => {
    const handleForcedLogout = () => {
      tokenStore.clear();
      setUser(null);
    };
    window.addEventListener('auth:logout', handleForcedLogout);
    return () => window.removeEventListener('auth:logout', handleForcedLogout);
  }, []);

  /**
   * Called after successful login API response.
   * Stores access token in memory only — never in localStorage.
   */
  const login = useCallback((accessToken, userData) => {
    tokenStore.set(accessToken);
    setUser(userData);
  }, []);

  /**
   * Clears memory token + user state.
   * Calls logout API so server can clear the httpOnly refresh token cookie.
   */
  const logout = useCallback(async () => {
    try {
      await api.post('/auth/logout');
    } catch {
      // Even if server call fails, clear client state
    } finally {
      tokenStore.clear();
      setUser(null);
    }
  }, []);

  const isAuthenticated = Boolean(tokenStore.get() && user);

  return (
    <AuthContext.Provider value={{ user, login, logout, isAuthenticated, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};

export default AuthContext;