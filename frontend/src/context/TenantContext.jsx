import { createContext, useContext, useState, useEffect } from 'react';
import { getLabels } from '../config/businessTypeLabels';
import { getTenantSlug } from '../utils/subdomainUtils';

const TenantContext = createContext(null);

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const TenantProvider = ({ children }) => {
  const [tenant, setTenant] = useState(null);
  const [labels, setLabels] = useState(getLabels('generic'));
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isUnavailable, setIsUnavailable] = useState(false);
  const [isSetupIncomplete, setIsSetupIncomplete] = useState(false);

  useEffect(() => {
    const slug = getTenantSlug();
    if (!slug) {
      setIsLoading(false);
      return;
    }

    const fetchTenantConfig = async () => {
      try {
        const res = await fetch(`${API_BASE}/public/${slug}/config`);
        if (!res.ok) {
          if (res.status === 404) {
            setError('Shop not found');
          } else {
            setError('Failed to load store configuration');
          }
          return;
        }

        const json = await res.json();
        const data = json.data;

        setTenant(data);
        setLabels(getLabels(data.businessType || 'generic'));
        setIsUnavailable(!!data.unavailable);
        setIsSetupIncomplete(!!data.setupIncomplete);

        // Apply tenant brand colors
        if (data.websiteConfig?.primaryColor) {
          document.documentElement.style.setProperty('--tenant-primary', data.websiteConfig.primaryColor);
        }
        if (data.websiteConfig?.accentColor) {
          document.documentElement.style.setProperty('--tenant-accent', data.websiteConfig.accentColor);
        }
        if (data.businessName) {
          document.title = data.businessName;
        }

        // Inject tenant logo as browser tab favicon
        if (data.websiteConfig?.logo) {
          let link = document.querySelector("link[rel~='icon']");
          if (!link) {
            link = document.createElement('link');
            link.rel = 'icon';
            document.head.appendChild(link);
          }
          link.type = 'image/png';
          link.href = data.websiteConfig.logo;
        }
      } catch (err) {
        console.error('Failed to load tenant config:', err);
        setError('Failed to load store configuration');
      } finally {
        setIsLoading(false);
      }
    };

    fetchTenantConfig();
  }, []);

  return (
    <TenantContext.Provider value={{ tenant, labels, isLoading, error, isUnavailable, isSetupIncomplete }}>
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