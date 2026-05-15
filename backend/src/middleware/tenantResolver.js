const Tenant = require('../models/Tenant');

/**
 * Extracts the tenant slug from the Host header and attaches
 * req.tenantSlug and req.tenant to the request object.
 *
 * Dev:  glamournails.localhost:5000  → slug = 'glamournails'
 * Prod: glamournails.yourdomain.com → slug = 'glamournails'
 *
 * Skip for super admin routes (host starts with 'superadmin.')
 */
const tenantResolver = async (req, res, next) => {
  const slug = req.headers['x-tenant-slug'] || req.params.slug;
  
  if (!slug) return next();

  req.tenantSlug = slug;
  const tenant = await Tenant.findOne({ slug })
    .select('-passwordHash -passwordResetToken -passwordResetExpires -refreshTokenHash');

  if (!tenant) {
    return res.status(404).json({
      success: false,
      message: 'Store not found',
      tenantNotFound: true,
    });
  }

  req.tenant = tenant;
  next();
};

/**
 * For public routes only: block access if tenant is expired or paused.
 * Returns specific flags so the frontend can show the right page.
 */
const requireActiveTenant = (req, res, next) => {
  const tenant = req.tenant;
  if (!tenant) return next();

  if (tenant.status === 'expired' || tenant.status === 'inactive') {
    return res.status(403).json({
      success: false,
      tenantUnavailable: true,
      businessName: tenant.businessName,
      logo: tenant.websiteConfig?.logo,
    });
  }

  if (tenant.status === 'paused') {
    return res.status(403).json({
      success: false,
      tenantPaused: true,
      businessName: tenant.businessName,
      logo: tenant.websiteConfig?.logo,
    });
  }

  next();
};

module.exports = { tenantResolver, requireActiveTenant };
