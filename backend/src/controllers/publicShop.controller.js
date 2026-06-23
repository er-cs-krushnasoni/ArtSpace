// backend/src/controllers/publicShop.controller.js
const Tenant = require('../models/Tenant');
const Product = require('../models/Product');
const Slider = require('../models/Slider');

const sanitizeTenant = (tenant) => ({
  businessName: tenant.businessName,
  businessType: tenant.businessType,
  slug: tenant.slug,
  websiteConfig: {
    logo: tenant.websiteConfig?.logo || null,
    primaryColor: tenant.websiteConfig?.primaryColor || '#7c3aed',
    accentColor: tenant.websiteConfig?.accentColor || '#f59e0b',
    bgColor: tenant.websiteConfig?.bgColor || '#fafaf9',
    navBg: tenant.websiteConfig?.navBg || null,
    navText: tenant.websiteConfig?.navText || null,
    cardBg: tenant.websiteConfig?.cardBg || null,
    btnText: tenant.websiteConfig?.btnText || null,
    publicTheme: tenant.websiteConfig?.publicTheme || 'light',
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
    faqEnabled: tenant.websiteConfig?.faqEnabled || false,
    productSalesEnabled: tenant.websiteConfig?.productSalesEnabled !== false,
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
    .populate({ path: 'categories.categoryId', model: 'Category', select: 'groupName values' })
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
    const themeColor = tenant.websiteConfig?.primaryColor || '#7c3aed';
    const logoUrl = tenant.websiteConfig?.logo || null;
    const FALLBACK_ICON = 'https://placehold.co/512x512/7c3aed/ffffff?text=A';

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
      id: `/s/${slug}/admin`,
      name: `${businessName} Admin`,
      short_name: shortName,
      description: `Admin dashboard for ${businessName}`,
      start_url: `/s/${slug}/admin/dashboard`,
      scope: `/s/${slug}/admin/`,
      display: 'standalone',
      background_color: '#ffffff',
      theme_color: themeColor,
      orientation: 'portrait',
      icons: [
        { src: icon192, sizes: '192x192', type: 'image/png', purpose: 'any maskable' },
        { src: icon512, sizes: '512x512', type: 'image/png', purpose: 'any maskable' },
      ],
    };

    res.setHeader('Content-Type', 'application/manifest+json');
    res.setHeader('Cache-Control', 'public, max-age=3600');
    return res.json(manifest);
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to generate manifest' });
  }
};

const getShopOGPage = async (req, res) => {
  try {
    const { slug } = req.params;
    const tenant = await Tenant.findOne({ slug: slug.toLowerCase() });
    if (!tenant || tenant.status === 'inactive') {
      return res.status(404).send('Shop not found');
    }

    const businessName = tenant.businessName || 'Shop';
    const logo         = tenant.websiteConfig?.logo || '';
    const address      = tenant.websiteConfig?.address || '';
    const shopUrl      = `${process.env.FRONTEND_URL || 'https://artspace-online.netlify.app'}/s/${slug}`;
    const desc         = address
      ? `${businessName} — ${address}`
      : `Visit ${businessName}'s online shop on ArtSpace.`;

    const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8" />
  <title>${businessName}</title>
  <meta name="description" content="${desc}" />

  <!-- Open Graph (WhatsApp, Facebook, Instagram DM) -->
  <meta property="og:type"        content="website" />
  <meta property="og:url"         content="${shopUrl}" />
  <meta property="og:title"       content="${businessName}" />
  <meta property="og:description" content="${desc}" />
  ${logo ? `<meta property="og:image" content="${logo}" />` : ''}
  <meta property="og:image:width"  content="512" />
  <meta property="og:image:height" content="512" />

  <!-- Twitter card -->
  <meta name="twitter:card"        content="summary" />
  <meta name="twitter:title"       content="${businessName}" />
  <meta name="twitter:description" content="${desc}" />
  ${logo ? `<meta name="twitter:image" content="${logo}" />` : ''}

  <!-- Instant redirect — real humans land on the actual shop -->
  <meta http-equiv="refresh" content="0;url=${shopUrl}" />
  <script>window.location.replace("${shopUrl}");</script>
</head>
<body>
  <p>Redirecting to <a href="${shopUrl}">${businessName}</a>…</p>
</body>
</html>`;

    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.setHeader('Cache-Control', 'public, max-age=300'); // 5 min cache
    return res.send(html);
  } catch (err) {
    return res.status(500).send('Error generating page');
  }
};

module.exports = { getPublicConfig, getPublicProducts, getPublicSliders, getTenantPWAManifest, getShopOGPage };