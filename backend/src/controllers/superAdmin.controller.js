const bcrypt = require('bcryptjs');
const { validationResult } = require('express-validator');
const Tenant = require('../models/Tenant');
const AuditLog = require('../models/AuditLog');
const SubscriptionPricing = require('../models/SubscriptionPricing');
const TrialBlacklist = require('../models/TrialBlacklist');
const { sendCredentialsEmail, sendSlugChangedEmail } = require('../utils/emailUtils');

const RESERVED_SLUGS = ['www', 'api', 'admin', 'app', 'mail', 'static', 'assets', 'superadmin', 's'];
const PLAN_DURATION = { trial: 7, '1m': 30, '3m': 90, '6m': 180, '12m': 365 };

// ─── Helper: create audit entry ───────────────────────────────────────────────
const audit = (actionType, superAdminId, tenantId, fields = {}) =>
  AuditLog.create({ actionType, superAdminId, tenantId, ...fields });

// ─── GET /api/superadmin/tenants ──────────────────────────────────────────────
const listTenants = async (req, res) => {
  const { status, plan, search, page = 1, limit = 20 } = req.query;
  const filter = {};
  if (status) filter.status = status;
if (plan) filter.plan = plan;
  const { excludePlan } = req.query;
  if (excludePlan) filter.plan = { $ne: excludePlan };
    if (search) {
    filter.$or = [
      { businessName: { $regex: search, $options: 'i' } },
      { slug: { $regex: search, $options: 'i' } },
    ];
  }
  const skip = (Number(page) - 1) * Number(limit);
  const [tenants, total] = await Promise.all([
    Tenant.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit))
      .select('-passwordHash -refreshTokenHash -passwordResetToken -passwordResetExpires'),
    Tenant.countDocuments(filter),
  ]);
  return res.json({ success: true, tenants, total, page: Number(page), limit: Number(limit) });
};

// ─── GET /api/superadmin/tenants/:tenantId ────────────────────────────────────
const getTenant = async (req, res) => {
  const tenant = await Tenant.findById(req.params.tenantId)
    .select('-passwordHash -refreshTokenHash -passwordResetToken -passwordResetExpires');
  if (!tenant) return res.status(404).json({ success: false, message: 'Tenant not found' });
  return res.json({ success: true, tenant });
};

// ─── PATCH /api/superadmin/tenants/:tenantId/status ──────────────────────────
const updateTenantStatus = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ success: false, errors: errors.array() });

  const { status, reason } = req.body;
  const tenant = await Tenant.findById(req.params.tenantId);
  if (!tenant) return res.status(404).json({ success: false, message: 'Tenant not found' });

  const oldStatus = tenant.status;
  tenant.status = status;
  await tenant.save();

  const actionMap = {
    active: 'TENANT_ACTIVATED',
    inactive: 'TENANT_DEACTIVATED',
  };
  await audit(actionMap[status] || 'STATUS_CHANGE', req.user.id, tenant._id, {
    targetField: 'status', oldValue: oldStatus, newValue: status, reason: reason || null,
  });

  return res.json({ success: true, message: `Tenant ${status} successfully`, tenant });
};

// ─── PATCH /api/superadmin/tenants/:tenantId/slug ────────────────────────────
const updateTenantSlug = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ success: false, errors: errors.array() });

  const { slug, reason } = req.body;
  const newSlug = slug.toLowerCase().trim();

  if (RESERVED_SLUGS.includes(newSlug))
    return res.status(400).json({ success: false, message: 'This slug is reserved and cannot be used' });
  if (!/^[a-z0-9-]+$/.test(newSlug))
    return res.status(400).json({ success: false, message: 'Slug can only contain lowercase letters, numbers, and hyphens' });

  const existing = await Tenant.findOne({ slug: newSlug });
  if (existing && existing._id.toString() !== req.params.tenantId)
    return res.status(409).json({ success: false, message: 'Slug already taken' });

  const tenant = await Tenant.findById(req.params.tenantId);
  if (!tenant) return res.status(404).json({ success: false, message: 'Tenant not found' });

  const oldSlug = tenant.slug;
  tenant.slug = newSlug;
  await tenant.save();

  await audit('SLUG_CHANGE', req.user.id, tenant._id, {
    targetField: 'slug', oldValue: oldSlug, newValue: newSlug, reason: reason || null,
  });

  // Email tenant about slug change
  try {
    await sendSlugChangedEmail({
      to: tenant.email, ownerName: tenant.ownerName,
      businessName: tenant.businessName, newSlug,
    });
  } catch (e) {
    console.error('Slug change email failed:', e.message);
  }

  return res.json({ success: true, message: 'Slug updated', tenant });
};

// ─── PATCH /api/superadmin/tenants/:tenantId/plan ────────────────────────────
const updateTenantPlan = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ success: false, errors: errors.array() });

  const { plan, customDays, reason } = req.body;
  // Block paid → trial downgrade
  if (plan === 'trial') {
    const currentTenant = await Tenant.findById(req.params.tenantId).select('plan');
    if (currentTenant && currentTenant.plan !== 'trial') {
      return res.status(400).json({ success: false, message: 'Cannot downgrade a paid plan to trial' });
    }
  }
  const tenant = await Tenant.findById(req.params.tenantId);
  if (!tenant) return res.status(404).json({ success: false, message: 'Tenant not found' });

  const oldPlan = tenant.plan;
  const oldExpiry = tenant.planExpiryDate;

  let daysToAdd;
  if (plan === 'custom') {
    if (!customDays || customDays < 1)
      return res.status(400).json({ success: false, message: 'Custom days must be at least 1' });
    daysToAdd = Number(customDays);
  } else {
    daysToAdd = PLAN_DURATION[plan];
  }

  // Carry forward remaining days
  const baseDate = tenant.planExpiryDate && new Date(tenant.planExpiryDate) > new Date()
    ? new Date(tenant.planExpiryDate)
    : new Date();
  const newExpiry = new Date(baseDate.getTime() + daysToAdd * 24 * 60 * 60 * 1000);

  tenant.plan = plan;
  tenant.planExpiryDate = newExpiry;
  tenant.planStartDate = new Date();
  if (tenant.status === 'expired') tenant.status = 'active';
  await tenant.save();

  await audit('PLAN_CHANGE', req.user.id, tenant._id, {
    targetField: 'plan',
    oldValue: `${oldPlan} (expires ${oldExpiry ? new Date(oldExpiry).toISOString() : 'never'})`,
    newValue: `${plan} (expires ${newExpiry.toISOString()})`,
    reason: reason || null,
  });

  return res.json({ success: true, message: 'Plan updated', tenant });
};

// ─── PATCH /api/superadmin/tenants/:tenantId/adjust-days ─────────────────────
const adjustDays = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ success: false, errors: errors.array() });

  const { days, reason, confirmExpiry } = req.body;
  const daysNum = Number(days);

  const tenant = await Tenant.findById(req.params.tenantId);
  if (!tenant) return res.status(404).json({ success: false, message: 'Tenant not found' });

  const currentExpiry = tenant.planExpiryDate ? new Date(tenant.planExpiryDate) : new Date();
  const newExpiry = new Date(currentExpiry.getTime() + daysNum * 24 * 60 * 60 * 1000);

  // Over-reduction check: if new expiry is in the past and frontend hasn't confirmed
  if (newExpiry < new Date() && !confirmExpiry) {
    return res.status(409).json({
      success: false,
      code: 'CONFIRM_EXPIRY',
      message: 'This adjustment will immediately expire this tenant. Send confirmExpiry: true to proceed.',
      newExpiry,
    });
  }

  const oldExpiry = tenant.planExpiryDate;
  tenant.planExpiryDate = newExpiry;

  // If new expiry is in the past, expire the tenant
  if (newExpiry < new Date()) {
    tenant.status = 'expired';
  }

  await tenant.save();

  await audit('EXPIRY_CHANGE', req.user.id, tenant._id, {
    targetField: 'planExpiryDate',
    oldValue: oldExpiry ? new Date(oldExpiry).toISOString() : null,
    newValue: newExpiry.toISOString(),
    reason,
  });

  return res.json({ success: true, message: 'Days adjusted', tenant });
};

// ─── PATCH /api/superadmin/tenants/:tenantId/bypass-payment ──────────────────
const bypassPayment = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ success: false, errors: errors.array() });

  const { plan, customDays, amount, reason } = req.body;
  const tenant = await Tenant.findById(req.params.tenantId);
  if (!tenant) return res.status(404).json({ success: false, message: 'Tenant not found' });

  const oldPlan = tenant.plan;
  const oldExpiry = tenant.planExpiryDate;

  let daysToAdd;
  if (plan === 'custom') {
    if (!customDays || customDays < 1)
      return res.status(400).json({ success: false, message: 'Custom days must be at least 1' });
    daysToAdd = Number(customDays);
  } else {
    daysToAdd = PLAN_DURATION[plan];
  }

  const baseDate = tenant.planExpiryDate && new Date(tenant.planExpiryDate) > new Date()
    ? new Date(tenant.planExpiryDate)
    : new Date();
  const newExpiry = new Date(baseDate.getTime() + daysToAdd * 24 * 60 * 60 * 1000);

  tenant.plan = plan;
  tenant.planExpiryDate = newExpiry;
  tenant.planStartDate = new Date();
  tenant.status = 'active';
  tenant.subscriptionHistory.push({
    plan, startDate: new Date(), expiryDate: newExpiry,
    paidAmount: amount || 0, paymentMethod: 'cash_bypass', note: reason,
  });
  await tenant.save();

  await audit('PAYMENT_BYPASS', req.user.id, tenant._id, {
    targetField: 'plan',
    oldValue: `${oldPlan} (expires ${oldExpiry ? new Date(oldExpiry).toISOString() : 'never'})`,
    newValue: `${plan} (expires ${newExpiry.toISOString()})`,
    reason,
  });

  return res.json({ success: true, message: 'Payment bypassed, subscription activated', tenant });
};

// ─── PATCH /api/superadmin/tenants/:tenantId/pause ───────────────────────────
// (kept here for co-location; pause/unpause were in subscription.controller)
const pauseTenantAdmin = async (req, res) => {
  const tenant = await Tenant.findById(req.params.tenantId);
  if (!tenant) return res.status(404).json({ success: false, message: 'Tenant not found' });
  if (tenant.status === 'paused')
    return res.status(400).json({ success: false, message: 'Tenant is already paused' });

  const daysRemaining = tenant.planExpiryDate
    ? Math.max(0, Math.ceil((new Date(tenant.planExpiryDate) - new Date()) / (1000 * 60 * 60 * 24)))
    : 0;

  tenant.status = 'paused';
  tenant.pausedAt = new Date();
  tenant.pausedDays = daysRemaining;
  await tenant.save();

  await audit('TENANT_PAUSED', req.user.id, tenant._id, {
    targetField: 'status', oldValue: 'active', newValue: 'paused',
    reason: req.body.reason || null,
  });

  return res.json({ success: true, message: 'Tenant paused', tenant });
};

// ─── PATCH /api/superadmin/tenants/:tenantId/unpause ─────────────────────────
const unpauseTenantAdmin = async (req, res) => {
  const tenant = await Tenant.findById(req.params.tenantId);
  if (!tenant) return res.status(404).json({ success: false, message: 'Tenant not found' });
  if (tenant.status !== 'paused')
    return res.status(400).json({ success: false, message: 'Tenant is not paused' });

  // Credit back paused days
  const pausedDays = tenant.pausedDays || 0;
  const newExpiry = new Date(Date.now() + pausedDays * 24 * 60 * 60 * 1000);

  tenant.status = 'active';
  tenant.planExpiryDate = newExpiry;
  tenant.pausedAt = null;
  tenant.pausedDays = 0;
  await tenant.save();

  await audit('TENANT_UNPAUSED', req.user.id, tenant._id, {
    targetField: 'status', oldValue: 'paused', newValue: 'active',
    reason: req.body.reason || null,
  });

  return res.json({ success: true, message: 'Tenant unpaused, days credited back', tenant });
};

// ─── POST /api/superadmin/tenants (Create — Option B) ────────────────────────
const createTenant = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ success: false, errors: errors.array() });

  const {
    businessName, slug, businessType, ownerName, email,
    mobile, initialPassword, plan, customDays,
  } = req.body;

  const newSlug = slug.toLowerCase().trim();

  if (RESERVED_SLUGS.includes(newSlug))
    return res.status(400).json({ success: false, message: 'This slug is reserved' });

  const [slugTaken, emailTaken] = await Promise.all([
    Tenant.findOne({ slug: newSlug }),
    Tenant.findOne({ email: email.toLowerCase().trim() }),
  ]);
  if (slugTaken) return res.status(409).json({ success: false, message: 'Slug already taken' });
  if (emailTaken) return res.status(409).json({ success: false, message: 'Email already registered' });

  let daysToAdd;
  if (plan === 'custom') {
    if (!customDays || customDays < 1)
      return res.status(400).json({ success: false, message: 'Custom days must be at least 1' });
    daysToAdd = Number(customDays);
  } else {
    daysToAdd = PLAN_DURATION[plan] ?? 7;
  }

  const planExpiryDate = new Date(Date.now() + daysToAdd * 24 * 60 * 60 * 1000);

  // Hash password manually (bypass pre-save which re-hashes)
  const tenant = await Tenant.create({
    slug: newSlug, businessName, businessType, ownerName,
    email: email.toLowerCase().trim(), mobile,
    passwordHash: initialPassword, // pre-save hook hashes it
    status: 'active', plan, planStartDate: new Date(), planExpiryDate,
  });

  await audit('TENANT_CREATED', req.user.id, tenant._id, {
    targetField: 'status', oldValue: null, newValue: 'active',
    reason: `Created by Super Admin. Plan: ${plan}`,
  });

  // Email credentials to shop owner
  try {
    await sendCredentialsEmail({
      to: email, ownerName, businessName, slug: newSlug, initialPassword,
    });
  } catch (e) {
    console.error('Credentials email failed:', e.message);
  }

  return res.status(201).json({
    success: true,
    message: 'Tenant created and credentials emailed',
    tenant: { _id: tenant._id, businessName, slug: newSlug, plan, planExpiryDate },
  });
};

// ─── GET /api/superadmin/pricing ──────────────────────────────────────────────
const getPricing = async (_req, res) => {
  const pricing = await SubscriptionPricing.find().sort({ plan: 1 });
  return res.json({ success: true, pricing });
};

// ─── PATCH /api/superadmin/pricing ───────────────────────────────────────────
const updatePricing = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ success: false, errors: errors.array() });

  const { plan, price } = req.body;
  const updated = await SubscriptionPricing.findOneAndUpdate(
    { plan },
    { price, updatedAt: new Date() },
    { new: true, upsert: true }
  );
  return res.json({ success: true, message: 'Price updated', pricing: updated });
};

// ─── GET /api/superadmin/audit ────────────────────────────────────────────────
const getAuditLog = async (req, res) => {
  const { tenantId, actionType, from, to, page = 1, limit = 30 } = req.query;
  const filter = {};
  if (tenantId) filter.tenantId = tenantId;
  if (actionType) filter.actionType = actionType;
  if (from || to) {
    filter.timestamp = {};
    if (from) filter.timestamp.$gte = new Date(from);
    if (to) filter.timestamp.$lte = new Date(to);
  }

  const skip = (Number(page) - 1) * Number(limit);
  const [logs, total] = await Promise.all([
    AuditLog.find(filter)
      .sort({ timestamp: -1 })
      .skip(skip)
      .limit(Number(limit))
      .populate('tenantId', 'businessName slug')
      .populate('superAdminId', 'email'),
    AuditLog.countDocuments(filter),
  ]);

  return res.json({ success: true, logs, total, page: Number(page), limit: Number(limit) });
};

// ─── GET /api/superadmin/tenants/check-slug ───────────────────────────────────
const checkSlug = async (req, res) => {
  const { slug, excludeId } = req.query;
  if (!slug) return res.status(400).json({ success: false, message: 'Slug required' });

  const newSlug = slug.toLowerCase().trim();
  if (RESERVED_SLUGS.includes(newSlug))
    return res.json({ success: true, available: false, reason: 'reserved' });
  if (!/^[a-z0-9-]+$/.test(newSlug))
    return res.json({ success: true, available: false, reason: 'invalid_format' });

  const filter = { slug: newSlug };
  if (excludeId) filter._id = { $ne: excludeId };
  const existing = await Tenant.findOne(filter);

  return res.json({ success: true, available: !existing });
};

// ─── DELETE /api/superadmin/tenants/:tenantId ─────────────────────────────────
const deleteTenant = async (req, res) => {
  const tenant = await Tenant.findById(req.params.tenantId);
  if (!tenant) return res.status(404).json({ success: false, message: 'Tenant not found' });

  const tenantId = tenant._id;

  // Import all models needed for cleanup
  const Product = require('../models/Product');
  const Query = require('../models/Query');
  const Task = require('../models/Task');
  const BlogPost = require('../models/BlogPost');
  const Slider = require('../models/Slider');
  const Category = require('../models/Category');
  const QuizQuestion = require('../models/QuizQuestion');
  const PaymentRecord = require('../models/PaymentRecord');
  const { deleteFromCloudinary, extractPublicId } = require('../config/cloudinary');

  // Delete product images from Cloudinary
  const products = await Product.find({ tenantId });
  for (const product of products) {
    for (const photoUrl of product.photos || []) {
      const publicId = extractPublicId(photoUrl);
      if (publicId) await deleteFromCloudinary(publicId).catch(() => {});
    }
  }

  // Delete slider images
  const sliders = await Slider.find({ tenantId });
  for (const slider of sliders) {
    if (slider.imagePublicId) await deleteFromCloudinary(slider.imagePublicId).catch(() => {});
  }

  // Delete logo + pwa icon
  if (tenant.websiteConfig?.logoPublicId)
    await deleteFromCloudinary(tenant.websiteConfig.logoPublicId).catch(() => {});
  if (tenant.websiteConfig?.pwaIconPublicId)
    await deleteFromCloudinary(tenant.websiteConfig.pwaIconPublicId).catch(() => {});

  // Delete query images
  const queries = await Query.find({ tenantId });
  for (const query of queries) {
    const urls = [...(query.referenceImages || []), ...(query.descriptionImages || [])];
    for (const url of urls) {
      const publicId = extractPublicId(url);
      if (publicId) await deleteFromCloudinary(publicId).catch(() => {});
    }
  }

  // Delete all tenant data from DB
  await Promise.all([
    Product.deleteMany({ tenantId }),
    Query.deleteMany({ tenantId }),
    Task.deleteMany({ tenantId }),
    BlogPost.deleteMany({ tenantId }),
    Slider.deleteMany({ tenantId }),
    Category.deleteMany({ tenantId }),
    QuizQuestion.deleteMany({ tenantId }),
    PaymentRecord.deleteMany({ tenantId }),
    AuditLog.deleteMany({ tenantId }),  // delete action logs for this tenant
  ]);

  // NOTE: TrialBlacklist entry for this mobile is intentionally preserved
  await tenant.deleteOne();

  await audit('TENANT_DELETED', req.user.id, tenantId, {
    targetField: 'tenant',
    oldValue: `${tenant.businessName} (/s/${tenant.slug})`,
    newValue: null,
    reason: req.body.reason || 'Deleted by Super Admin',
  });

  return res.json({ success: true, message: 'Tenant and all associated data deleted' });
};

// ─── PATCH /api/superadmin/pricing/toggle ─────────────────────────────────────
const togglePlan = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ success: false, errors: errors.array() });

  const { plan, isEnabled } = req.body;
  const updated = await SubscriptionPricing.findOneAndUpdate(
    { plan },
    { isEnabled, updatedAt: new Date() },
    { new: true, upsert: true }
  );
  return res.json({ success: true, message: `Plan ${isEnabled ? 'enabled' : 'disabled'}`, pricing: updated });
};

// ─── GET /api/superadmin/payments ─────────────────────────────────────────────
const getPayments = async (req, res) => {
  const { tenantId, plan, status, from, to, page = 1, limit = 30 } = req.query;
  const PaymentRecord = require('../models/PaymentRecord');

  const filter = {};
  if (tenantId) filter.tenantId = tenantId;
  if (plan) filter.plan = plan;
  if (status) filter.status = status;
  if (from || to) {
    filter.createdAt = {};
    if (from) filter.createdAt.$gte = new Date(from);
    if (to) filter.createdAt.$lte = new Date(to);
  }

  const skip = (Number(page) - 1) * Number(limit);
  const [payments, total] = await Promise.all([
    PaymentRecord.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit))
      .populate('tenantId', 'businessName slug'),
    PaymentRecord.countDocuments(filter),
  ]);

  return res.json({ success: true, payments, total, page: Number(page), limit: Number(limit) });
};

// ─── PATCH /api/superadmin/tenants/:tenantId/credentials ─────────────────────
const updateTenantCredentials = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ success: false, errors: errors.array() });

  const { newEmail, newPassword, reason } = req.body;
  if (!newEmail && !newPassword)
    return res.status(400).json({ success: false, message: 'Provide at least a new email or new password' });

  const tenant = await Tenant.findById(req.params.tenantId).select('+passwordHash');
  if (!tenant) return res.status(404).json({ success: false, message: 'Tenant not found' });

  const oldEmail = tenant.email;

  if (newEmail) {
    const normalised = newEmail.toLowerCase().trim();
    const taken = await Tenant.findOne({ email: normalised, _id: { $ne: tenant._id } });
    if (taken) return res.status(409).json({ success: false, message: 'Email already in use by another tenant' });
    tenant.email = normalised;
  }

  if (newPassword) {
    // pre-save hook will re-hash
    tenant.passwordHash = newPassword;
  }

  await tenant.save();

  await audit('CREDENTIALS_CHANGE', req.user.id, tenant._id, {
    targetField: newEmail && newPassword ? 'email + password' : newEmail ? 'email' : 'password',
    oldValue: newEmail ? oldEmail : '(password)',
    newValue: newEmail ? tenant.email : '(new password set)',
    reason: reason || null,
  });

  // Notify tenant — send to NEW email if changed, otherwise existing
  try {
    const { sendCredentialsUpdatedEmail } = require('../utils/emailUtils');
    await sendCredentialsUpdatedEmail({
      to: oldEmail,
      ownerName: tenant.ownerName,
      businessName: tenant.businessName,
      slug: tenant.slug,
      newEmail: newEmail ? tenant.email : null,
      newPassword: newPassword || null,
    });
  } catch (e) {
    console.error('Credentials update email failed:', e.message);
  }

  return res.json({ success: true, message: 'Tenant credentials updated', tenant: {
    _id: tenant._id, email: tenant.email, businessName: tenant.businessName,
  }});
};

module.exports = {
  listTenants, getTenant, updateTenantStatus, updateTenantSlug,
  updateTenantPlan, adjustDays, bypassPayment,
  pauseTenantAdmin, unpauseTenantAdmin, createTenant,
  getPricing, updatePricing, getAuditLog, checkSlug,
  deleteTenant, togglePlan, getPayments, updateTenantCredentials,
};