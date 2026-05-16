import { useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axiosInstance';
import { tokenStore } from '../api/tokenStore';

/**
 * Hook for tenant admin auth operations.
 * Provides login + logout helpers for tenant admin pages.
 */
const useTenantAuth = () => {
  const { user, login, logout, isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();
  const { slug } = useParams();

  const tenantLogin = useCallback(async (email, password) => {
    const response = await api.post('/tenantauth/login', { email, password });
    const { accessToken, user: userData, statusCode } = response.data;
    login(accessToken, userData);
    return { userData, statusCode };
  }, [login]);

  const tenantLogout = useCallback(async () => {
    try {
      await api.post('/tenantauth/logout');
    } catch {
      // Clear client state regardless
    } finally {
      tokenStore.clear();
      logout();
      if (slug) {
        navigate(`/s/${slug}/admin/login`, { replace: true });
      }
    }
  }, [logout, navigate, slug]);

  return {
    user,
    isAuthenticated,
    isLoading,
    tenantLogin,
    tenantLogout,
  };
};

export default useTenantAuth;