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
  const [isNotFound, setIsNotFound] = useState(false);

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
            setIsNotFound(true);
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

        if (data.websiteConfig?.primaryColor) {
          document.documentElement.style.setProperty('--tenant-primary', data.websiteConfig.primaryColor);
        }
        if (data.websiteConfig?.accentColor) {
          document.documentElement.style.setProperty('--tenant-accent', data.websiteConfig.accentColor);
        }
        if (data.websiteConfig?.bgColor) {
          document.documentElement.style.setProperty('--tenant-bg', data.websiteConfig.bgColor);
        }
        if (data.websiteConfig?.navBg) {
  document.documentElement.style.setProperty('--tenant-nav-bg', data.websiteConfig.navBg);
}
if (data.websiteConfig?.navText) {
  document.documentElement.style.setProperty('--tenant-nav-text', data.websiteConfig.navText);
}
if (data.websiteConfig?.cardBg) {
  document.documentElement.style.setProperty('--tenant-card-bg', data.websiteConfig.cardBg);
}
if (data.websiteConfig?.btnText) {
  document.documentElement.style.setProperty('--tenant-btn-text', data.websiteConfig.btnText);
}

        if (data.businessName) {
          document.title = data.businessName;
        }
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
    <TenantContext.Provider value={{ tenant, labels, isLoading, error, isUnavailable, isSetupIncomplete, isNotFound }}>
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