const express = require('express');
const router = express.Router();
const { tenantResolver } = require('../middleware/tenantResolver');

/**
 * GET /api/tenant/config
 * Public endpoint — returns tenant's public configuration.
 * Used by TenantContext on the frontend to bootstrap the public site.
 */
router.get('/config', tenantResolver, async (req, res) => {
  const tenant = req.tenant;

  if (!tenant) {
    return res.status(404).json({
      success: false,
      message: 'Tenant not found',
    });
  }

  // Fully blocked — treat as non-existent
  if (tenant.status === 'inactive') {
    return res.status(404).json({
      success: false,
      message: 'Store not found',
    });
  }

  // Pending manual approval — not yet live
  if (tenant.status === 'pending_manual') {
    return res.status(404).json({
      success: false,
      message: 'Store not found',
    });
  }

  // Expired — show unavailable page with minimal info
  if (tenant.status === 'expired') {
    return res.json({
      success: true,
      unavailable: true,
      paused: false,
      businessName: tenant.businessName,
      logo: tenant.websiteConfig?.logo || null,
    });
  }

  // Paused — show unavailable page with minimal info
  if (tenant.status === 'paused') {
    return res.json({
      success: true,
      unavailable: true,
      paused: true,
      businessName: tenant.businessName,
      logo: tenant.websiteConfig?.logo || null,
    });
  }

  // Active — return full public config
  const cfg = tenant.websiteConfig || {};
  res.json({
    success: true,
    unavailable: false,
    businessName: tenant.businessName,
    businessType: tenant.businessType,
    logo: cfg.logo || null,
    primaryColor: cfg.primaryColor || '#8b5cf6',
    accentColor: cfg.accentColor || '#ec4899',
    whatsapp: cfg.whatsapp || null,
    instagram: cfg.instagram || null,
    address: cfg.address || '',
    sliderEnabled: cfg.sliderEnabled || false,
    quizEnabled: cfg.quizEnabled || false,
    blogEnabled: cfg.blogEnabled || false,
    deliveryEnabled: cfg.deliveryEnabled !== false,
    appointmentEnabled: cfg.appointmentEnabled !== false,
    appName: cfg.appName || tenant.businessName,
    pwaIcon: cfg.pwaIcon || cfg.logo || null,
  });
});

module.exports = router;