/**
 * Extracts tenant slug from URL path.
 * /s/glamournails → 'glamournails'
 * /s/glamournails/shop → 'glamournails'
 * /superadmin/... → null
 * / → null
 */
export const getTenantSlug = (pathname) => {
  const path = pathname ?? window.location.pathname;
  const parts = path.split('/').filter(Boolean);
  if (parts[0] === 's' && parts[1]) return parts[1];
  return null;
};

/**
 * Returns true if current path is under /superadmin
 */
export const isSuperAdminPath = (pathname) => {
  const path = pathname ?? window.location.pathname;
  return path.startsWith('/superadmin');
};

/**
 * Builds a tenant shop URL.
 * Dev:  http://localhost:5173/s/glamournails
 * Prod: https://artspace.netlify.app/s/glamournails
 */
export const buildTenantUrl = (slug) => {
  const { protocol, host } = window.location;
  return `${protocol}//${host}/s/${slug}`;
};