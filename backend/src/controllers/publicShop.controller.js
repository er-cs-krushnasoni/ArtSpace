const Tenant = require('../models/Tenant');
const Product = require('../models/Product');
const Slider = require('../models/Slider');
const Category = require('../models/Category');

// Helper — strip sensitive fields from tenant before sending
const sanitizeTenant = (tenant) => ({
  businessName: tenant.businessName,
  businessType: tenant.businessType,
  slug: tenant.slug,
  websiteConfig: {
    logo: tenant.websiteConfig?.logo || null,
    primaryColor: tenant.websiteConfig?.primaryColor || '#8b5cf6',
    accentColor: tenant.websiteConfig?.accentColor || '#ec4899',
    address: tenant.websiteConfig?.address || '',
    whatsapp: tenant.websiteConfig?.whatsapp || null,
    instagram: tenant.websiteConfig?.instagram || null,
    sliderEnabled: tenant.websiteConfig?.sliderEnabled || false,
    quizEnabled: tenant.websiteConfig?.quizEnabled || false,
    blogEnabled: tenant.websiteConfig?.blogEnabled || false,
    deliveryEnabled: tenant.websiteConfig?.deliveryEnabled ?? true,
    appointmentEnabled: tenant.websiteConfig?.appointmentEnabled ?? true,
    tutorialVideoUrl: tenant.websiteConfig?.tutorialVideoUrl || null,
    shopVisible: tenant.websiteConfig?.shopVisible !== false
  },
  status: tenant.status,
});

// GET /api/public/:slug/config
const getPublicConfig = async (req, res) => {
  const { slug } = req.params;

  const tenant = await Tenant.findOne({ slug: slug.toLowerCase() });

  if (!tenant || tenant.status === 'inactive') {
    return res.status(404).json({ success: false, message: 'Shop not found' });
  }

  const data = sanitizeTenant(tenant);

  if (tenant.status === 'expired' || tenant.status === 'paused') {
    return res.json({ success: true, data: { ...data, unavailable: true } });
  }

  // Shop manually hidden by admin
  if (tenant.websiteConfig?.shopVisible === false) {
    return res.json({ success: true, data: { ...data, unavailable: true } });
  }

  return res.json({ success: true, data });
};

// GET /api/public/:slug/products
const getPublicProducts = async (req, res) => {
  const { slug } = req.params;

  const tenant = await Tenant.findOne({ slug: slug.toLowerCase() });

  if (!tenant || tenant.status === 'inactive') {
    return res.status(404).json({ success: false, message: 'Shop not found' });
  }

  // Expired or paused → return empty array (shop is down)
  if (tenant.status === 'expired' || tenant.status === 'paused') {
    return res.json({ success: true, data: [] });
  }

  const products = await Product.find({ tenantId: tenant._id, isActive: true })
    .populate({ path: 'categories', model: 'Category', select: 'groupName values' })
    .sort({ createdAt: -1 })
    .lean();

  return res.json({ success: true, data: products });
};

// GET /api/public/:slug/sliders
const getPublicSliders = async (req, res) => {
  const { slug } = req.params;

  const tenant = await Tenant.findOne({ slug: slug.toLowerCase() });

  if (!tenant || tenant.status === 'inactive') {
    return res.status(404).json({ success: false, message: 'Shop not found' });
  }

  if (tenant.status === 'expired' || tenant.status === 'paused') {
    return res.json({ success: true, data: [] });
  }

  if (!tenant.websiteConfig?.sliderEnabled) {
    return res.json({ success: true, data: [] });
  }

  const sliders = await Slider.find({ tenantId: tenant._id })
    .sort({ order: 1 })
    .lean();

  return res.json({ success: true, data: sliders });
};

module.exports = { getPublicConfig, getPublicProducts, getPublicSliders };