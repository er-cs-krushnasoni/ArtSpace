const Tenant = require('../models/Tenant');
const Product = require('../models/Product');
const Slider = require('../models/Slider');

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
    appointmentAtHome: tenant.websiteConfig?.appointmentAtHome ?? true,
    shopVisible: tenant.websiteConfig?.shopVisible !== false,
    tutorialVideoUrl: tenant.websiteConfig?.tutorialVideoUrl || null,
  },
  status: tenant.status,
});

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
  if (tenant.websiteConfig?.shopVisible === false) {
    return res.json({ success: true, data: { ...data, unavailable: true } });
  }
  return res.json({ success: true, data });
};

const getPublicProducts = async (req, res) => {
  const { slug } = req.params;
  const tenant = await Tenant.findOne({ slug: slug.toLowerCase() });
  if (!tenant || tenant.status === 'inactive') {
    return res.status(404).json({ success: false, message: 'Shop not found' });
  }
  if (tenant.status === 'expired' || tenant.status === 'paused') {
    return res.json({ success: true, data: [] });
  }
  const products = await Product.find({ tenantId: tenant._id, isActive: true })
    .populate({ path: 'categories', model: 'Category', select: 'groupName values' })
    .sort({ createdAt: -1 })
    .lean();
  return res.json({ success: true, data: products });
};

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

const getTenantPWAManifest = async (req, res) => {
  try {
    const { slug } = req.params;
    const tenant = await Tenant.findOne({ slug: slug.toLowerCase() });

    if (!tenant || tenant.status === 'inactive') {
      return res.status(404).json({ success: false, message: 'Shop not found' });
    }

    const businessName = tenant.businessName || 'Shop';
    const shortName = businessName.length > 12 ? businessName.slice(0, 12) : businessName;
    const themeColor = tenant.websiteConfig?.primaryColor || '#8b5cf6';
    const logoUrl = tenant.websiteConfig?.logo || null;

    const FALLBACK_ICON = 'https://placehold.co/512x512/8b5cf6/ffffff?text=A';

    // Helper: inject Cloudinary resize transformations into the URL
    // Cloudinary URLs look like: https://res.cloudinary.com/<cloud>/image/upload/<public_id>
    // We insert /w_<size>,h_<size>,c_fill,f_png/ before the public_id
    const resizeCloudinaryUrl = (url, size) => {
      if (!url || !url.includes('res.cloudinary.com')) return url;
      return url.replace(
        '/image/upload/',
        `/image/upload/w_${size},h_${size},c_fill,f_png/`
      );
    };

    const icon192 = logoUrl ? resizeCloudinaryUrl(logoUrl, 192) : FALLBACK_ICON;
    const icon512 = logoUrl ? resizeCloudinaryUrl(logoUrl, 512) : FALLBACK_ICON;

    const manifest = {
      name: `${businessName} Admin`,
      short_name: shortName,
      description: `Admin dashboard for ${businessName}`,
      start_url: `/s/${slug}/admin/dashboard`,
      display: 'standalone',
      background_color: '#ffffff',
      theme_color: themeColor,
      orientation: 'portrait',
      icons: [
        {
          src: icon192,
          sizes: '192x192',
          type: 'image/png',
          purpose: 'any maskable',
        },
        {
          src: icon512,
          sizes: '512x512',
          type: 'image/png',
          purpose: 'any maskable',
        },
      ],
    };

    res.setHeader('Content-Type', 'application/manifest+json');
    res.setHeader('Cache-Control', 'public, max-age=3600');
    return res.json(manifest);
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to generate manifest' });
  }
};

module.exports = { getPublicConfig, getPublicProducts, getPublicSliders, getTenantPWAManifest };