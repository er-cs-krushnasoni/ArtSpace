// frontend/src/context/TenantContext.jsx
import { createContext, useContext, useState, useEffect } from 'react';
import { getLabels } from '../config/businessTypeLabels';
import { getTenantSlug } from '../utils/subdomainUtils';

const TenantContext = createContext(null);
const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const TenantProvider = ({ children }) => {
  const [tenant, setTenant]                       = useState(null);
  const [labels, setLabels]                       = useState(getLabels('generic'));
  const [isLoading, setIsLoading]                 = useState(true);
  const [error, setError]                         = useState(null);
  const [isUnavailable, setIsUnavailable]         = useState(false);
  const [isSetupIncomplete, setIsSetupIncomplete] = useState(false);
  const [isNotFound, setIsNotFound]               = useState(false);

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

        // ── CSS variables + dark/light theme ────────────────────────
        const wc = data.websiteConfig || {};
        const isDarkTheme = (wc.publicTheme || 'light') === 'dark';

        const defaults = {
          '--tenant-primary':  '#7c3aed',
          '--tenant-accent':   '#f59e0b',
          '--tenant-bg':       isDarkTheme ? '#18181b' : '#fafaf9',
          '--tenant-card-bg':  isDarkTheme ? '#27272a' : '#ffffff',
          '--tenant-nav-bg':   isDarkTheme ? '#18181b' : null,
          '--tenant-nav-text': isDarkTheme ? '#f4f4f5' : null,
          '--tenant-btn-text': '#ffffff',
        };

        // Theme-sensitive variables — if tenant hasn't set a custom value,
// REMOVE the inline style so [data-theme="dark"] CSS rule can take over
const themeSensitive = new Set([
  '--tenant-bg', '--tenant-card-bg', '--tenant-nav-bg', '--tenant-nav-text'
]);

const vars = {
  '--tenant-primary':  wc.primaryColor || defaults['--tenant-primary'],
  '--tenant-accent':   wc.accentColor  || defaults['--tenant-accent'],
  '--tenant-bg':       (wc.bgColor && wc.bgColor !== '#fafaf9' && wc.bgColor !== '#ffffff') ? wc.bgColor : null,
'--tenant-card-bg':  (wc.cardBg && wc.cardBg !== '#ffffff') ? wc.cardBg : null,
  '--tenant-nav-bg':   wc.navBg        || null,
  '--tenant-nav-text': wc.navText      || null,
  '--tenant-text':     wc.textColor    || null,
  '--tenant-btn-text': wc.btnText      || defaults['--tenant-btn-text'],
};

Object.entries(vars).forEach(([key, val]) => {
  if (val) {
    document.documentElement.style.setProperty(key, val);
  } else {
    // Remove inline style — lets CSS [data-theme="dark"] rule win
    document.documentElement.style.removeProperty(key);
  }
});

        // Apply data-theme attribute for Tailwind dark: class support
        document.documentElement.setAttribute('data-theme', wc.publicTheme || 'light');

        // ── Page title ───────────────────────────────────────────────
        if (data.businessName) {
          document.title = data.businessName;
        }

        // ── Favicon ──────────────────────────────────────────────────
        const faviconHref = wc.logo
          ? wc.logo
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

          const proxyIcon = (url, size) => {
            if (!url) return null;
            if (url.startsWith(origin)) return url;
            if (url.includes('cloudinary.com')) {
              return url.replace('/upload/', `/upload/w_${size},h_${size},c_fill,f_png/`);
            }
            return `${API_BASE}/proxy-icon?url=${encodeURIComponent(url)}`;
          };

          const rawLogo = wc.logo;
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
            theme_color:      wc.primaryColor || '#7c3aed',
            background_color: '#ffffff',
            display:          'standalone',
            scope:            `${origin}/s/${slug}/admin/`,
            start_url:        `${origin}/s/${slug}/admin/dashboard`,
            icons:            shopIcons,
          };

          const blob = new Blob([JSON.stringify(dynamicManifest)], { type: 'application/json' });
          const manifestUrl = URL.createObjectURL(blob);

          let manifestLink = document.querySelector("link[rel='manifest']");
          if (!manifestLink) {
            manifestLink = document.createElement('link');
            manifestLink.rel = 'manifest';
            document.head.appendChild(manifestLink);
          }
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