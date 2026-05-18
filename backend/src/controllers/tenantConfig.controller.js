const crypto = require('crypto');
const { body, validationResult } = require('express-validator');
const Tenant = require('../models/Tenant');
const Slider = require('../models/Slider');
const { deleteFromCloudinary, cloudinary } = require('../config/cloudinary');
const { sendSlugChangedEmail } = require('../utils/emailUtils');


// ─── Helpers ──────────────────────────────────────────────────────────────────

const RESERVED_SLUGS = ['www', 'api', 'admin', 'app', 'mail', 'static', 'assets', 'superadmin', 's'];

const isValidHex = (color) => /^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/.test(color);

const handleValidationErrors = (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, message: errors.array()[0].msg });
  }
  return null;
};

// ─── GET /api/tenant/settings ─────────────────────────────────────────────────

const getSettings = async (req, res) => {
  const tenant = await Tenant.findById(req.user.tenantId).lean();
  if (!tenant) return res.status(404).json({ success: false, message: 'Tenant not found' });

  res.json({
    success: true,
    data: {
      businessName: tenant.businessName,
      ownerName: tenant.ownerName,
      email: tenant.email,
      mobile: tenant.mobile,
      slug: tenant.slug,
      plan: tenant.plan,
      planExpiryDate: tenant.planExpiryDate,
      websiteConfig: tenant.websiteConfig || {},
    },
  });
};

// ─── PUT /api/tenant/settings/general ────────────────────────────────────────

const updateGeneral = async (req, res) => {
  const err = handleValidationErrors(req, res);
  if (err) return;

  const { businessName, address, whatsapp, instagram, primaryColor, accentColor } = req.body;

  if (primaryColor && !isValidHex(primaryColor)) {
    return res.status(400).json({ success: false, message: 'Invalid primary color hex code' });
  }
  if (accentColor && !isValidHex(accentColor)) {
    return res.status(400).json({ success: false, message: 'Invalid accent color hex code' });
  }

  const update = {};
  if (businessName !== undefined) update.businessName = businessName.trim();
  if (address !== undefined) update['websiteConfig.address'] = address.trim();
  if (whatsapp !== undefined) update['websiteConfig.whatsapp'] = whatsapp.trim() || null;
  if (instagram !== undefined) update['websiteConfig.instagram'] = instagram.trim().replace(/^@/, '') || null;
  if (primaryColor !== undefined) update['websiteConfig.primaryColor'] = primaryColor;
  if (accentColor !== undefined) update['websiteConfig.accentColor'] = accentColor;

  await Tenant.findByIdAndUpdate(req.user.tenantId, { $set: update });
  res.json({ success: true, message: 'Settings updated successfully' });
};

// ─── PUT /api/tenant/settings/toggles ────────────────────────────────────────

const updateToggles = async (req, res) => {
  const { sliderEnabled, quizEnabled, blogEnabled, deliveryEnabled, appointmentEnabled } = req.body;

  const update = {};
  if (typeof sliderEnabled === 'boolean') update['websiteConfig.sliderEnabled'] = sliderEnabled;
  if (typeof quizEnabled === 'boolean') update['websiteConfig.quizEnabled'] = quizEnabled;
  if (typeof blogEnabled === 'boolean') update['websiteConfig.blogEnabled'] = blogEnabled;
  if (typeof deliveryEnabled === 'boolean') update['websiteConfig.deliveryEnabled'] = deliveryEnabled;
  if (typeof appointmentEnabled === 'boolean') update['websiteConfig.appointmentEnabled'] = appointmentEnabled;

  await Tenant.findByIdAndUpdate(req.user.tenantId, { $set: update });
  res.json({ success: true, message: 'Toggles updated' });
};

// ─── POST /api/tenant/settings/upload-signature ───────────────────────────────

const ALLOWED_UPLOAD_TYPES = ['logo', 'pwa_icon', 'slider_image', 'tutorial_video', 'product_photo'];
const getUploadSignature = async (req, res) => {
  const { uploadType } = req.body;

  if (!ALLOWED_UPLOAD_TYPES.includes(uploadType)) {
    return res.status(400).json({ success: false, message: 'Invalid upload type' });
  }

  const tenant = await Tenant.findById(req.user.tenantId).select('slug').lean();
  if (!tenant) return res.status(404).json({ success: false, message: 'Tenant not found' });

  const folder = `artspace/tenants/${tenant.slug}/${uploadType}`;
  const timestamp = Math.round(Date.now() / 1000);

  // Build params string for signature
  const paramsToSign = `folder=${folder}&timestamp=${timestamp}`;
  const signature = crypto
    .createHash('sha1')
    .update(paramsToSign + process.env.CLOUDINARY_API_SECRET)
    .digest('hex');

  res.json({
    success: true,
    data: {
      signature,
      timestamp,
      folder,
      cloudName: process.env.CLOUDINARY_CLOUD_NAME,
      apiKey: process.env.CLOUDINARY_API_KEY,
    },
  });
};

// ─── PUT /api/tenant/settings/logo ────────────────────────────────────────────

const updateLogo = async (req, res) => {
  const { logoUrl, logoPublicId } = req.body;
  if (!logoUrl || !logoPublicId) {
    return res.status(400).json({ success: false, message: 'logoUrl and logoPublicId are required' });
  }

  const tenant = await Tenant.findById(req.user.tenantId).select('websiteConfig').lean();
  if (!tenant) return res.status(404).json({ success: false, message: 'Tenant not found' });

  // Delete old logo from Cloudinary
  if (tenant.websiteConfig?.logoPublicId) {
    await deleteFromCloudinary(tenant.websiteConfig.logoPublicId, 'image');
  }

  // Logo also serves as PWA icon — no separate upload needed
  await Tenant.findByIdAndUpdate(req.user.tenantId, {
    $set: {
      'websiteConfig.logo': logoUrl,
      'websiteConfig.logoPublicId': logoPublicId,
      'websiteConfig.pwaIcon': logoUrl,
      'websiteConfig.pwaIconPublicId': logoPublicId,
    },
  });

  res.json({ success: true, message: 'Logo updated successfully', data: { logoUrl } });
};


// ─── PUT /api/tenant/settings/tutorial-video ──────────────────────────────────

const updateTutorialVideo = async (req, res) => {
  const { tutorialVideoUrl, tutorialVideoPublicId, remove } = req.body;

  const tenant = await Tenant.findById(req.user.tenantId).select('websiteConfig').lean();
  if (!tenant) return res.status(404).json({ success: false, message: 'Tenant not found' });

  // Delete old video if exists
  if (tenant.websiteConfig?.tutorialVideoPublicId) {
    await deleteFromCloudinary(tenant.websiteConfig.tutorialVideoPublicId, 'video');
  }

  if (remove) {
    await Tenant.findByIdAndUpdate(req.user.tenantId, {
      $set: {
        'websiteConfig.tutorialVideoUrl': null,
        'websiteConfig.tutorialVideoPublicId': null,
      },
    });
    return res.json({ success: true, message: 'Tutorial video removed' });
  }

  if (!tutorialVideoUrl || !tutorialVideoPublicId) {
    return res.status(400).json({ success: false, message: 'tutorialVideoUrl and tutorialVideoPublicId are required' });
  }

  await Tenant.findByIdAndUpdate(req.user.tenantId, {
    $set: {
      'websiteConfig.tutorialVideoUrl': tutorialVideoUrl,
      'websiteConfig.tutorialVideoPublicId': tutorialVideoPublicId,
    },
  });

  res.json({ success: true, message: 'Tutorial video updated successfully' });
};

// ─── PUT /api/tenant/settings/slug ────────────────────────────────────────────

// ─── PUT /api/tenant/settings/slug ────────────────────────────────────────────
const updateSlug = async (req, res) => {
  const { newSlug } = req.body;

  if (!newSlug) return res.status(400).json({ success: false, message: 'New slug is required' });

  const slugLower = newSlug.toLowerCase().trim();

  if (!/^[a-z0-9-]+$/.test(slugLower)) {
    return res.status(400).json({ success: false, message: 'Slug can only contain lowercase letters, numbers, and hyphens' });
  }
  if (slugLower.length < 3 || slugLower.length > 50) {
    return res.status(400).json({ success: false, message: 'Slug must be between 3 and 50 characters' });
  }
  if (RESERVED_SLUGS.includes(slugLower)) {
    return res.status(400).json({ success: false, message: 'This slug is reserved and cannot be used' });
  }

  const existing = await Tenant.findOne({ slug: slugLower, _id: { $ne: req.user.tenantId } }).lean();
  if (existing) {
    return res.status(400).json({ success: false, message: 'This slug is already taken' });
  }

  // Fetch tenant before update so we have their email + name for the notification
  const tenant = await Tenant.findById(req.user.tenantId).select('email ownerName businessName').lean();
  if (!tenant) return res.status(404).json({ success: false, message: 'Tenant not found' });

  await Tenant.findByIdAndUpdate(req.user.tenantId, { $set: { slug: slugLower } });

  // Send notification email — fire and forget (don't block the response)
  sendSlugChangedEmail({
    to: tenant.email,
    ownerName: tenant.ownerName,
    businessName: tenant.businessName,
    newSlug: slugLower,
  }).catch((err) => console.error('⚠️  Slug change email failed (non-blocking):', err.message));

  res.json({ success: true, message: 'Shop URL updated successfully', data: { newSlug: slugLower } });
};

// ─── GET /api/tenant/settings/slug/check ─────────────────────────────────────

const checkSlugAvailability = async (req, res) => {
  const { slug } = req.query;

  if (!slug) return res.status(400).json({ success: false, message: 'Slug is required' });

  const slugLower = slug.toLowerCase().trim();

  if (!/^[a-z0-9-]+$/.test(slugLower)) {
    return res.json({ success: true, available: false, reason: 'invalid_format' });
  }
  if (slugLower.length < 3 || slugLower.length > 50) {
    return res.json({ success: true, available: false, reason: 'invalid_length' });
  }
  if (RESERVED_SLUGS.includes(slugLower)) {
    return res.json({ success: true, available: false, reason: 'reserved' });
  }

  const existing = await Tenant.findOne({ slug: slugLower, _id: { $ne: req.user.tenantId } }).lean();
  res.json({ success: true, available: !existing });
};

// ─── GET /api/tenant/settings/sliders ─────────────────────────────────────────

const getSliders = async (req, res) => {
  const sliders = await Slider.find({ tenantId: req.user.tenantId }).sort({ order: 1 }).lean();
  res.json({ success: true, data: sliders });
};

// ─── POST /api/tenant/settings/sliders ────────────────────────────────────────

const createSlider = async (req, res) => {
  const count = await Slider.countDocuments({ tenantId: req.user.tenantId });
  if (count >= 5) {
    return res.status(400).json({ success: false, message: 'Maximum 5 slides allowed' });
  }

  const { imageUrl, imagePublicId, title, linkType, linkId } = req.body;

  if (!imageUrl || !imagePublicId) {
    return res.status(400).json({ success: false, message: 'Image is required' });
  }

  const validLinkTypes = ['none', 'product', 'category'];
  if (linkType && !validLinkTypes.includes(linkType)) {
    return res.status(400).json({ success: false, message: 'Invalid link type' });
  }

  const slider = await Slider.create({
    tenantId: req.user.tenantId,
    imageUrl,
    imagePublicId,
    title: title?.trim() || '',
    linkType: linkType || 'none',
    linkId: linkType && linkType !== 'none' ? linkId : null,
    order: count, // next position
  });

  res.status(201).json({ success: true, message: 'Slide created', data: slider });
};

// ─── PUT /api/tenant/settings/sliders/reorder ────────────────────────────────

const reorderSliders = async (req, res) => {
  const { orderedIds } = req.body;

  if (!Array.isArray(orderedIds) || orderedIds.length === 0) {
    return res.status(400).json({ success: false, message: 'orderedIds array is required' });
  }

  // Verify all belong to this tenant
  const sliders = await Slider.find({ tenantId: req.user.tenantId, _id: { $in: orderedIds } }).lean();
  if (sliders.length !== orderedIds.length) {
    return res.status(400).json({ success: false, message: 'Invalid slider IDs' });
  }

  await Promise.all(
    orderedIds.map((id, index) =>
      Slider.findByIdAndUpdate(id, { $set: { order: index } })
    )
  );

  res.json({ success: true, message: 'Slides reordered' });
};

// ─── PUT /api/tenant/settings/sliders/:sliderId ───────────────────────────────

const updateSlider = async (req, res) => {
  const { sliderId } = req.params;
  const { title, linkType, linkId } = req.body;

  const slider = await Slider.findOne({ _id: sliderId, tenantId: req.user.tenantId });
  if (!slider) return res.status(404).json({ success: false, message: 'Slide not found' });

  const validLinkTypes = ['none', 'product', 'category'];
  if (linkType && !validLinkTypes.includes(linkType)) {
    return res.status(400).json({ success: false, message: 'Invalid link type' });
  }

  if (title !== undefined) slider.title = title.trim();
  if (linkType !== undefined) slider.linkType = linkType;
  slider.linkId = linkType && linkType !== 'none' ? linkId : null;

  await slider.save();
  res.json({ success: true, message: 'Slide updated', data: slider });
};

// ─── DELETE /api/tenant/settings/sliders/:sliderId ────────────────────────────

const deleteSlider = async (req, res) => {
  const { sliderId } = req.params;

  const slider = await Slider.findOne({ _id: sliderId, tenantId: req.user.tenantId });
  if (!slider) return res.status(404).json({ success: false, message: 'Slide not found' });

  // Delete Cloudinary asset first
  if (slider.imagePublicId) {
    await deleteFromCloudinary(slider.imagePublicId, 'image');
  }

  await Slider.findByIdAndDelete(sliderId);
  res.json({ success: true, message: 'Slide deleted' });
};

module.exports = {
  getSettings,
  updateGeneral,
  updateToggles,
  getUploadSignature,
  updateLogo,
  updateTutorialVideo,
  updateSlug,
  checkSlugAvailability,
  getSliders,
  createSlider,
  reorderSliders,
  updateSlider,
  deleteSlider,
};