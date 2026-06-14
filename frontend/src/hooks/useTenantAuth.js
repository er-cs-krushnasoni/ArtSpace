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
  // Guard against HMR-induced React null reference (duplicate React instance in dev)
  // All hooks must be inside try/catch because useContext → null during HMR reload
  let authState, navigate, slug;
  try {
    authState = useAuth();                    // eslint-disable-line react-hooks/rules-of-hooks
    navigate  = useNavigate();                // eslint-disable-line react-hooks/rules-of-hooks
    slug      = useParams().slug;             // eslint-disable-line react-hooks/rules-of-hooks
  } catch {
    // HMR edge case — React module reference is null mid-reload.
    // Return safe no-op defaults; component will re-render cleanly once HMR settles.
    return {
      user: null,
      isAuthenticated: false,
      isLoading: true,
      tenantLogin: async () => {},
      tenantLogout: async () => {},
    };
  }

  const { user, login, logout, isAuthenticated, isLoading } = authState;

  const tenantLogin = useCallback(async (email, password) => { // eslint-disable-line react-hooks/rules-of-hooks
    const response = await api.post('/tenantauth/login', { email, password });
    const { accessToken, user: userData, statusCode } = response.data;
    login(accessToken, userData);
    return { userData, statusCode };
  }, [login]);

  const tenantLogout = useCallback(async () => { // eslint-disable-line react-hooks/rules-of-hooks
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