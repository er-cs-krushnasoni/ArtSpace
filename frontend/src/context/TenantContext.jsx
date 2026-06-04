import { createContext, useContext, useState, useEffect } from 'react';
import { getLabels } from '../config/businessTypeLabels';
import { getTenantSlug } from '../utils/subdomainUtils';

const TenantContext = createContext(null);
const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const TenantProvider = ({ children }) => {
  const [tenant, setTenant]                 = useState(null);
  const [labels, setLabels]                 = useState(getLabels('generic'));
  const [isLoading, setIsLoading]           = useState(true);
  const [error, setError]                   = useState(null);
  const [isUnavailable, setIsUnavailable]   = useState(false);
  const [isSetupIncomplete, setIsSetupIncomplete] = useState(false);
  const [isNotFound, setIsNotFound]         = useState(false);

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

        // ── CSS variables ────────────────────────────────────────────
        const cssVars = {
          '--tenant-primary':  data.websiteConfig?.primaryColor,
          '--tenant-accent':   data.websiteConfig?.accentColor,
          '--tenant-bg':       data.websiteConfig?.bgColor,
          '--tenant-nav-bg':   data.websiteConfig?.navBg,
          '--tenant-nav-text': data.websiteConfig?.navText,
          '--tenant-card-bg':  data.websiteConfig?.cardBg,
          '--tenant-btn-text': data.websiteConfig?.btnText,
        };
        Object.entries(cssVars).forEach(([key, val]) => {
          if (val) document.documentElement.style.setProperty(key, val);
        });

        // ── Page title ───────────────────────────────────────────────
        if (data.businessName) {
          document.title = data.businessName;
        }

        // ── Favicon ──────────────────────────────────────────────────
        const faviconHref = data.websiteConfig?.logo
          ? data.websiteConfig.logo
          : `/artspace-logo.png?v=${Date.now()}`;

        let faviconLink = document.querySelector("link[rel~='icon']");
        if (!faviconLink) {
          faviconLink = document.createElement('link');
          faviconLink.rel = 'icon';
          document.head.appendChild(faviconLink);
        }
        faviconLink.type = 'image/png';
        faviconLink.href = faviconHref;

        // ── Dynamic PWA manifest (admin paths only) ──────────────────
        if (window.location.pathname.includes('/admin/')) {
          const origin = window.location.origin;

          // Proxy Cloudinary URLs through backend so Chrome accepts
          // them as PWA icons (cross-origin icons are blocked otherwise)
          const proxyIcon = (url, size) => {
  if (!url) return null;
  if (url.startsWith(origin)) return url;
  // Use Cloudinary's transformation to force exact square size
  // This fixes "actual size does not match specified size" warning
  if (url.includes('cloudinary.com')) {
    return url.replace(
      '/upload/',
      `/upload/w_${size},h_${size},c_fill,f_png/`
    );
  }
  // Fallback: proxy through backend
  return `${API_BASE}/proxy-icon?url=${encodeURIComponent(url)}`;
};

const rawLogo = data.websiteConfig?.logo;
const shopIcons = rawLogo
  ? [
      { src: proxyIcon(rawLogo, 192), sizes: '192x192', type: 'image/png' },
      { src: proxyIcon(rawLogo, 512), sizes: '512x512', type: 'image/png' },
    ]
  : [
      { src: `${origin}/artspace-logo.png`, sizes: '192x192', type: 'image/png' },
      { src: `${origin}/artspace-logo.png`, sizes: '512x512', type: 'image/png' },
    ];

          const dynamicManifest = {
            name:             `${data.businessName || 'Shop'} Admin`,
            short_name:       data.businessName || 'Admin',
            description:      `${data.businessName || 'Shop'} admin dashboard`,
            theme_color:      data.websiteConfig?.primaryColor || '#8b5cf6',
            background_color: '#ffffff',
            display:          'standalone',
            scope:            `${origin}/s/${slug}/admin/`,
            start_url:        `${origin}/s/${slug}/admin/dashboard`,
            icons:            shopIcons,
          };

          const blob = new Blob(
            [JSON.stringify(dynamicManifest)],
            { type: 'application/json' }
          );
          const manifestUrl = URL.createObjectURL(blob);

          let manifestLink = document.querySelector("link[rel='manifest']");
          if (!manifestLink) {
            manifestLink = document.createElement('link');
            manifestLink.rel = 'manifest';
            document.head.appendChild(manifestLink);
          }
          // Revoke previous blob URL to avoid memory leak
          if (manifestLink.href?.startsWith('blob:')) {
            URL.revokeObjectURL(manifestLink.href);
          }
          manifestLink.href = manifestUrl;
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
    <TenantContext.Provider value={{
      tenant,
      labels,
      isLoading,
      error,
      isUnavailable,
      isSetupIncomplete,
      isNotFound,
    }}>
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