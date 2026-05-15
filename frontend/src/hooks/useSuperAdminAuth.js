import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axiosInstance';
import { tokenStore } from '../api/tokenStore';

/**
 * Hook for super admin auth operations.
 * Verifies session on mount via /me endpoint.
 * Provides login + logout helpers for super admin pages.
 */
const useSuperAdminAuth = () => {
  const { user, login, logout, isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();

  // Redirect to login if not authenticated and not loading
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate('/superadmin/login', { replace: true });
    }
  }, [isLoading, isAuthenticated, navigate]);

  // Verify the session is specifically a super admin session
  useEffect(() => {
    if (!isLoading && isAuthenticated && user?.role !== 'superadmin') {
      // Authenticated but wrong role — clear and redirect
      logout().then(() => navigate('/superadmin/login', { replace: true }));
    }
  }, [isLoading, isAuthenticated, user, logout, navigate]);

  const superAdminLogin = async (email, password) => {
    const response = await api.post('/superadmin/auth/login', { email, password });
    const { accessToken, user: userData } = response.data;
    login(accessToken, userData);
    return userData;
  };

  const superAdminLogout = async () => {
    try {
      await api.post('/superadmin/auth/logout');
    } catch {
      // Clear client state regardless
    } finally {
      tokenStore.clear();
      logout();
      navigate('/superadmin/login', { replace: true });
    }
  };

  return {
    user,
    isAuthenticated,
    isLoading,
    superAdminLogin,
    superAdminLogout,
  };
};

export default useSuperAdminAuth;