const { body, validationResult } = require('express-validator');
const mongoose = require('mongoose');
const { cloudinary } = require('../config/cloudinary');
const Tenant = require('../models/Tenant');
const Product = require('../models/Product');
const Query = require('../models/Query');
const AnalyticsSnapshot = require('../models/AnalyticsSnapshot');

// ─── Helpers ──────────────────────────────────────────────────────────────────

const CLOUDINARY_PREFIX = 'https://res.cloudinary.com';

const isCloudinaryUrl = (url) =>
  typeof url === 'string' && url.startsWith(CLOUDINARY_PREFIX);

const getTenantBySlug = async (slug) => {
  return Tenant.findOne({ slug: slug.toLowerCase() });
};

const findDuplicate = async (tenantId, type, mobile, productId) => {
  const filter = {
    tenantId,
    type,
    mobile,
    status: { $in: ['unread', 'reply_later'] },
  };
  if (type === 'SHOP_ORDER' && productId) {
    filter.productId = productId;
  }
  return Query.findOne(filter);
};

// ─── Validation rule sets ─────────────────────────────────────────────────────

const baseRules = [
  body('customerName').trim().isLength({ min: 2 }).withMessage('Name must be at least 2 characters'),
  body('mobile')
    .trim()
    .customSanitizer((v) => v.replace(/\s+/g, ''))
    .isLength({ min: 7 })
    .matches(/^\d+$/)
    .withMessage('Mobile must be at least 7 digits'),
  body('countryCode')
    .trim()
    .matches(/^\+/)
    .withMessage('Country code must start with +'),
  body('type')
    .isIn(['SHOP_ORDER', 'CUSTOM_ORDER', 'APPOINTMENT'])
    .withMessage('Invalid query type'),
  body('instagram').optional({ nullable: true }).trim(),
  body('preferredDate').optional({ nullable: true }),
  body('preferredTime')
    .optional({ nullable: true })
    .trim()
    .matches(/^([01]\d|2[0-3]):[0-5]\d$/)
    .withMessage('Time must be in HH:mm format'),
  body('descriptionText').optional({ nullable: true }).trim().isLength({ max: 500 }),
  body('descriptionImages').optional({ nullable: true }).isArray(),
  body('referenceImages').optional({ nullable: true }).isArray(),
  body('address').optional({ nullable: true }).trim(),
];

const validateOrderType = body('orderType').custom((value, { req }) => {
  const type = req.body.type;
  if (type === 'APPOINTMENT') {
    if (!['at_home', 'at_shop'].includes(value)) {
      throw new Error('Appointment orderType must be at_home or at_shop');
    }
  } else if (type === 'SHOP_ORDER') {
    if (!['delivery', 'pickup', 'at_home', 'at_shop'].includes(value)) {
      throw new Error('orderType must be delivery, pickup, at_home, or at_shop');
    }
  } else {
    // CUSTOM_ORDER
    if (!['delivery', 'pickup'].includes(value)) {
      throw new Error('orderType must be delivery or pickup');
    }
  }
  return true;
});

const validateAddress = body('address').custom((value, { req }) => {
  const { orderType } = req.body;
  if ((orderType === 'delivery' || orderType === 'at_home') && (!value || !value.trim())) {
    throw new Error('Address is required for delivery/at-home orders');
  }
  return true;
});

const validateProductId = body('productId').custom((value, { req }) => {
  if (req.body.type === 'SHOP_ORDER' && !value) {
    throw new Error('productId is required for shop orders');
  }
  return true;
});

const validateReferenceImages = body('referenceImages').custom((value, { req }) => {
  if (req.body.type === 'CUSTOM_ORDER' || req.body.type === 'APPOINTMENT') {
    if (!Array.isArray(value) || value.length < 1) {
      throw new Error('At least one reference image is required');
    }
    if (value.some((url) => !isCloudinaryUrl(url))) {
      throw new Error('All reference images must be Cloudinary URLs');
    }
  }
  return true;
});

const validateImageUrls = (req) => {
  const ref = req.body.referenceImages || [];
  const desc = req.body.descriptionImages || [];
  const allImages = [...ref, ...desc];
  if (allImages.some((url) => !isCloudinaryUrl(url))) {
    return 'All images must be valid Cloudinary URLs';
  }
  return null;
};

const createQueryValidation = [
  ...baseRules,
  validateOrderType,
  validateAddress,
  validateProductId,
  validateReferenceImages,
];

// ─── Locked price builder ─────────────────────────────────────────────────────

const getLockedPrices = async (type, productId, orderType) => {
  if (type !== 'SHOP_ORDER') {
    return { lockedDeliveryPrice: null, lockedAppointmentPrice: null };
  }
  if (!mongoose.Types.ObjectId.isValid(productId)) {
    return { lockedDeliveryPrice: null, lockedAppointmentPrice: null };
  }
  const product = await Product.findById(productId).lean();
  if (!product) return { lockedDeliveryPrice: null, lockedAppointmentPrice: null };

  const lockedDeliveryPrice =
    product.deliveryEnabled && product.deliveryPrice != null
      ? product.deliveryPrice
      : 0;
  const lockedAppointmentPrice =
    product.appointmentEnabled && product.appointmentPrice != null
      ? product.appointmentPrice
      : 0;

  return { lockedDeliveryPrice, lockedAppointmentPrice };
};

// ─── Shared query builder ─────────────────────────────────────────────────────

const buildQueryData = async (body, tenantId, createdBy) => {
  const {
    type, customerName, mobile, countryCode, instagram,
    preferredDate, preferredTime, orderType, address, productId,
    descriptionText, descriptionImages, referenceImages,
  } = body;

  const { lockedDeliveryPrice, lockedAppointmentPrice } =
    await getLockedPrices(type, productId, orderType);

  const storedAddress =
    orderType === 'delivery' || orderType === 'at_home'
      ? (address || '').trim()
      : '';

  return {
    tenantId,
    type,
    customerName: customerName.trim(),
    mobile: mobile.replace(/\s+/g, ''),
    countryCode: countryCode.trim(),
    instagram: instagram?.trim() || '',
    preferredDate: preferredDate || null,
    preferredTime: preferredTime?.trim() || null,
    orderType,
    address: storedAddress,
    productId: type === 'SHOP_ORDER' ? productId : undefined,
    lockedDeliveryPrice,
    lockedAppointmentPrice,
    referenceImages: referenceImages || [],
    descriptionImages: descriptionImages || [],
    descriptionText: descriptionText?.trim() || '',
    createdBy,
    status: 'unread',
  };
};

// ─── Public: POST /api/public/:slug/queries ───────────────────────────────────

const createPublicQuery = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }
    const imgError = validateImageUrls(req);
    if (imgError) return res.status(400).json({ success: false, message: imgError });

    const { slug } = req.params;
    const tenant = await getTenantBySlug(slug);
    if (!tenant || tenant.status === 'inactive') {
      return res.status(404).json({ success: false, message: 'Shop not found' });
    }
    if (tenant.status === 'expired' || tenant.status === 'paused') {
      return res.status(403).json({ success: false, message: 'This shop is currently unavailable' });
    }

    const duplicate = await findDuplicate(
      tenant._id,
      req.body.type,
      req.body.mobile.replace(/\s+/g, ''),
      req.body.productId
    );
    if (duplicate) {
      return res.status(409).json({
        success: false,
        code: 'DUPLICATE_QUERY',
        message: 'You already have a pending request',
        existingQueryId: duplicate._id,
      });
    }

    const data = await buildQueryData(req.body, tenant._id, 'customer');
    const query = await Query.create(data);

    // ── Write query snapshot (permanent) ─────────────────────────────────
    try {
      await AnalyticsSnapshot.create({
        tenantId:    tenant._id,
        type:        'query',
        queryId:     query._id,
        submittedAt: query.createdAt,
        isConfirmed: false,
        queryType:   query.type,
        orderType:   query.orderType,
        productId:   query.productId || undefined,
      });
    } catch (snapErr) {
      console.error('[createPublicQuery] snapshot error:', snapErr.message);
    }

    return res.status(201).json({ success: true, data: { _id: query._id } });
  } catch (err) {
    console.error('[createPublicQuery]', err);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// ─── Public: POST /api/public/:slug/queries/:queryId/update ──────────────────

const updatePublicQuery = async (req, res) => {
  try {
    const { slug, queryId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(queryId)) {
      return res.status(404).json({ success: false, message: 'Query not found' });
    }

    const tenant = await getTenantBySlug(slug);
    if (!tenant || tenant.status === 'inactive') {
      return res.status(404).json({ success: false, message: 'Shop not found' });
    }

    const query = await Query.findOne({ _id: queryId, tenantId: tenant._id });
    if (!query) {
      return res.status(404).json({ success: false, message: 'Query not found' });
    }

    const {
      descriptionText, descriptionImages, referenceImages,
      preferredDate, preferredTime, address, orderType,
    } = req.body;

    if (descriptionText !== undefined) query.descriptionText = descriptionText?.trim() || '';
    if (descriptionImages !== undefined) query.descriptionImages = descriptionImages || [];
    if (referenceImages !== undefined) query.referenceImages = referenceImages || [];
    if (preferredDate !== undefined) query.preferredDate = preferredDate || null;
    if (preferredTime !== undefined) query.preferredTime = preferredTime?.trim() || null;
    if (orderType !== undefined) {
      query.orderType = orderType;
      if (orderType === 'delivery' || orderType === 'at_home') {
        query.address = (address || '').trim();
      } else {
        query.address = '';
      }
    } else if (address !== undefined && (query.orderType === 'delivery' || query.orderType === 'at_home')) {
      query.address = (address || '').trim();
    }

    await query.save();
    return res.json({ success: true, message: 'Request updated' });
  } catch (err) {
    console.error('[updatePublicQuery]', err);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// ─── Public: POST /api/public/:slug/upload-signature ─────────────────────────

const getPublicUploadSignature = async (req, res) => {
  try {
    const { slug } = req.params;
    const tenant = await getTenantBySlug(slug);
    if (!tenant || tenant.status === 'inactive') {
      return res.status(404).json({ success: false, message: 'Shop not found' });
    }

    const folder = `artspace/tenants/${slug}/query_images`;
    const timestamp = Math.round(Date.now() / 1000);

    const signature = cloudinary.utils.api_sign_request(
      { timestamp, folder },
      process.env.CLOUDINARY_API_SECRET
    );

    return res.json({
      success: true,
      data: {
        signature,
        timestamp,
        folder,
        cloudName: process.env.CLOUDINARY_CLOUD_NAME,
        apiKey: process.env.CLOUDINARY_API_KEY,
      },
    });
  } catch (err) {
    console.error('[getPublicUploadSignature]', err);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// ─── Tenant Admin: POST /api/tenant/queries ───────────────────────────────────

const createAdminQuery = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }
    const imgError = validateImageUrls(req);
    if (imgError) return res.status(400).json({ success: false, message: imgError });

    const tenantId = req.user.tenantId;

    const duplicate = await findDuplicate(
      tenantId,
      req.body.type,
      req.body.mobile.replace(/\s+/g, ''),
      req.body.productId
    );
    if (duplicate) {
      return res.status(409).json({
        success: false,
        code: 'DUPLICATE_QUERY',
        message: 'A pending request already exists for this customer',
        existingQueryId: duplicate._id,
      });
    }

    const data = await buildQueryData(req.body, tenantId, 'admin');
    const query = await Query.create(data);

    // ── Write query snapshot (permanent) ─────────────────────────────────
    try {
      await AnalyticsSnapshot.create({
        tenantId:    tenantId,
        type:        'query',
        queryId:     query._id,
        submittedAt: query.createdAt,
        isConfirmed: false,
        queryType:   query.type,
        orderType:   query.orderType,
        productId:   query.productId || undefined,
      });
    } catch (snapErr) {
      console.error('[createAdminQuery] snapshot error:', snapErr.message);
    }

    return res.status(201).json({ success: true, data: query });
  } catch (err) {
    console.error('[createAdminQuery]', err);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// ─── Tenant Admin: POST /api/tenant/queries/:queryId/update ──────────────────

const updateAdminQuery = async (req, res) => {
  try {
    const tenantId = req.user.tenantId;
    const { queryId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(queryId)) {
      return res.status(404).json({ success: false, message: 'Query not found' });
    }

    const query = await Query.findOne({ _id: queryId, tenantId });
    if (!query) {
      return res.status(404).json({ success: false, message: 'Query not found' });
    }

    const {
      descriptionText, descriptionImages, referenceImages,
      preferredDate, preferredTime, address, orderType,
    } = req.body;

    if (descriptionText !== undefined) query.descriptionText = descriptionText?.trim() || '';
    if (descriptionImages !== undefined) query.descriptionImages = descriptionImages || [];
    if (referenceImages !== undefined) query.referenceImages = referenceImages || [];
    if (preferredDate !== undefined) query.preferredDate = preferredDate || null;
    if (preferredTime !== undefined) query.preferredTime = preferredTime?.trim() || null;
    if (orderType !== undefined) {
      query.orderType = orderType;
      if (orderType === 'delivery' || orderType === 'at_home') {
        query.address = (address || '').trim();
      } else {
        query.address = '';
      }
    } else if (address !== undefined && (query.orderType === 'delivery' || query.orderType === 'at_home')) {
      query.address = (address || '').trim();
    }

    await query.save();
    return res.json({ success: true, message: 'Query updated' });
  } catch (err) {
    console.error('[updateAdminQuery]', err);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// ─── Exports ──────────────────────────────────────────────────────────────────

module.exports = {
  createPublicQuery,
  updatePublicQuery,
  getPublicUploadSignature,
  createAdminQuery,
  updateAdminQuery,
  createQueryValidation,
};