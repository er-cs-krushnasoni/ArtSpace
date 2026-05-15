import { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/axiosInstance';
import { getLabels } from '../config/businessTypeLabels';
import { getTenantSlug } from '../utils/subdomainUtils';

const TenantContext = createContext(null);

export const TenantProvider = ({ children }) => {
  const [tenant, setTenant] = useState(null);
  const [labels, setLabels] = useState(getLabels('generic'));
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const slug = getTenantSlug();
    if (!slug) {
      // No tenant slug (super admin domain or root) — skip fetch
      setIsLoading(false);
      return;
    }

    const fetchTenantConfig = async () => {
      try {
const { data } = await api.get('/tenant/config', {
  headers: { 'x-tenant-slug': slug }
});
        setTenant(data);
        setLabels(getLabels(data.businessType || 'generic'));

        // Apply tenant colors as CSS variables
        if (data.primaryColor) {
          document.documentElement.style.setProperty('--color-primary', data.primaryColor);
        }
        if (data.accentColor) {
          document.documentElement.style.setProperty('--color-accent', data.accentColor);
        }

        // Set page title to business name
        if (data.businessName) {
          document.title = data.businessName;
        }
      } catch (err) {
        console.error('Failed to load tenant config:', err);
        setError(err.response?.data?.message || 'Failed to load store configuration');
      } finally {
        setIsLoading(false);
      }
    };

    fetchTenantConfig();
  }, []);

  return (
    <TenantContext.Provider value={{ tenant, labels, isLoading, error }}>
      {children}
    </TenantContext.Provider>
  );
};

export const useTenant = () => {
  const context = useContext(TenantContext);
  if (!context) throw new Error('useTenant must be used within TenantProvider');
  return context;
};

export default TenantContext;
