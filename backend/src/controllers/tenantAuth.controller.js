const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const { validationResult } = require('express-validator');
const Tenant = require('../models/Tenant');
const TrialBlacklist = require('../models/TrialBlacklist');
const { generateAccessToken, generateRefreshToken } = require('../utils/jwtUtils');
const { sendWelcomeEmail, sendPasswordResetEmail } = require('../utils/emailUtils');

// ─── Helpers ──────────────────────────────────────────────────────────────────

const RESERVED_SLUGS = ['www', 'api', 'admin', 'app', 'mail', 'static', 'assets', 'superadmin', 's'];

const PLAN_DURATIONS = {
  trial: 7,
  '1m': 30,
  '3m': 90,
  '6m': 180,
  '12m': 365,
};

const calcExpiry = (plan) => {
  const days = PLAN_DURATIONS[plan] ?? 30;
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date;
};

const setRefreshCookie = (res, token) => {
  res.cookie('refreshToken', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
};

// ─── GET /api/tenantauth/check-slug ──────────────────────────────────────────

const checkSlug = async (req, res) => {
  const { slug } = req.query;

  if (!slug || typeof slug !== 'string') {
    return res.status(400).json({ success: false, message: 'Slug is required' });
  }

  const normalized = slug.toLowerCase().trim();

  if (RESERVED_SLUGS.includes(normalized)) {
    return res.json({ available: false, reason: 'reserved' });
  }

  if (!/^[a-z0-9-]+$/.test(normalized) || normalized.length < 3 || normalized.length > 30) {
    return res.json({ available: false, reason: 'invalid' });
  }

  const existing = await Tenant.findOne({ slug: normalized });
  if (existing) {
    return res.json({ available: false, reason: 'taken' });
  }

  return res.json({ available: true });
};

// ─── POST /api/tenantauth/signup ──────────────────────────────────────────────

const signup = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array(),
    });
  }

  const { businessName, slug, businessType, ownerName, email, mobile, password, plan } = req.body;
  const normalizedSlug = slug.toLowerCase().trim();
  const normalizedEmail = email.toLowerCase().trim();

  if (RESERVED_SLUGS.includes(normalizedSlug)) {
    return res.status(400).json({ success: false, message: 'This shop URL is reserved and cannot be used.' });
  }

  const slugTaken = await Tenant.findOne({ slug: normalizedSlug });
  if (slugTaken) {
    return res.status(400).json({ success: false, message: 'This shop URL is already taken. Please choose another.' });
  }

  const emailTaken = await Tenant.findOne({ email: normalizedEmail });
  if (emailTaken) {
    return res.status(400).json({ success: false, message: 'An account with this email already exists.' });
  }

  if (plan === 'trial') {
    const blacklisted = await TrialBlacklist.findOne({ mobile: mobile.trim() });
    if (blacklisted) {
      return res.status(400).json({
        success: false,
        message: 'This mobile number has already been used for a free trial. Please choose a paid plan.',
      });
    }

    const { trialSignupLimiter } = require('../middleware/rateLimiter');
    const limitReached = await new Promise((resolve) => {
      trialSignupLimiter(req, res, (err) => {
        resolve(err ? true : false);
      });
    });
    if (limitReached) return;
  }

  const now = new Date();
  const planExpiryDate = calcExpiry(plan);

  // Pass raw password — model pre-save hook hashes it
  const tenant = await Tenant.create({
    slug: normalizedSlug,
    businessName: businessName.trim(),
    businessType,
    ownerName: ownerName.trim(),
    email: normalizedEmail,
    mobile: mobile.trim(),
    passwordHash: password,
    status: 'active',
    plan,
    planStartDate: now,
    planExpiryDate,
    trialMobileUsed: plan === 'trial',
  });

  if (plan === 'trial') {
    await TrialBlacklist.create({ mobile: mobile.trim() });
  }

  try {
    await sendWelcomeEmail({
      to: normalizedEmail,
      ownerName: ownerName.trim(),
      businessName: businessName.trim(),
      slug: normalizedSlug,
      isPaid: plan !== 'trial',
    });
  } catch (emailErr) {
    console.error('⚠️  Welcome email failed (signup still succeeded):', emailErr.message);
  }

  const tokenPayload = {
    id: tenant._id,
    role: 'tenant_admin',
    tenantId: tenant._id.toString(),
    slug: normalizedSlug,
  };
  const accessToken = generateAccessToken(tokenPayload);
  const refreshToken = generateRefreshToken(tokenPayload);

  tenant.refreshTokenHash = await bcrypt.hash(refreshToken, 12);
  await tenant.save();

  setRefreshCookie(res, refreshToken);

  return res.status(201).json({
    success: true,
    accessToken,
    user: {
      id: tenant._id,
      slug: normalizedSlug,
      businessName: tenant.businessName,
      businessType: tenant.businessType,
      role: 'tenant_admin',
    },
  });
};

// ─── POST /api/tenantauth/login ───────────────────────────────────────────────

const login = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array(),
    });
  }

  const { email, password } = req.body;

  const tenant = await Tenant.findOne({ email: email.toLowerCase().trim() })
    .select('+passwordHash +refreshTokenHash');

  if (!tenant) {
    return res.status(401).json({ success: false, message: 'Invalid email or password' });
  }

  const isPasswordValid = await bcrypt.compare(password, tenant.passwordHash);
  if (!isPasswordValid) {
    return res.status(401).json({ success: false, message: 'Invalid email or password' });
  }

  if (tenant.status === 'inactive') {
    return res.status(403).json({
      success: false,
      message: 'Your account has been deactivated. Please contact support.',
      code: 'ACCOUNT_INACTIVE',
    });
  }

  if (tenant.status === 'pending_manual') {
    return res.status(403).json({
      success: false,
      message: 'Your account is pending activation. Please contact support.',
      code: 'PENDING_MANUAL',
    });
  }

  let statusCode = null;
  if (tenant.status === 'expired') statusCode = 'SUBSCRIPTION_EXPIRED';
  if (tenant.status === 'paused') statusCode = 'ACCOUNT_PAUSED';

  const tokenPayload = {
    id: tenant._id,
    role: 'tenant_admin',
    tenantId: tenant._id.toString(),
    slug: tenant.slug,
  };
  const accessToken = generateAccessToken(tokenPayload);
  const refreshToken = generateRefreshToken(tokenPayload);

  tenant.refreshTokenHash = await bcrypt.hash(refreshToken, 12);
  await tenant.save();

  setRefreshCookie(res, refreshToken);

  return res.json({
    success: true,
    accessToken,
    user: {
      id: tenant._id,
      slug: tenant.slug,
      businessName: tenant.businessName,
      businessType: tenant.businessType,
      role: 'tenant_admin',
    },
    ...(statusCode && { statusCode }),
  });
};

// ─── POST /api/tenantauth/logout ──────────────────────────────────────────────

const logout = async (req, res) => {
  const refreshToken = req.cookies?.refreshToken;

  if (refreshToken) {
    try {
      const { verifyRefreshToken } = require('../utils/jwtUtils');
      const decoded = verifyRefreshToken(refreshToken);
      if (decoded.role === 'tenant_admin') {
        await Tenant.findByIdAndUpdate(decoded.id, { $unset: { refreshTokenHash: '' } });
      }
    } catch {
      // Token already invalid — still clear the cookie
    }
  }

  res.clearCookie('refreshToken', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
  });

  return res.json({ success: true, message: 'Logged out successfully' });
};

// ─── POST /api/tenantauth/forgot-password ─────────────────────────────────────

const forgotPassword = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, message: 'Validation failed', errors: errors.array() });
  }

  const SAFE_RESPONSE = {
    success: true,
    message: 'If an account with that email exists, a reset link has been sent.',
  };

  const tenant = await Tenant.findOne({ email: req.body.email.toLowerCase().trim() });
  if (!tenant) return res.json(SAFE_RESPONSE);

  const rawToken = crypto.randomBytes(32).toString('hex');
  const tokenHash = await bcrypt.hash(rawToken, 10);

  tenant.passwordResetToken = tokenHash;
  tenant.passwordResetExpires = new Date(Date.now() + 60 * 60 * 1000);
  await tenant.save();

  const resetUrl = `${process.env.FRONTEND_URL}/s/${tenant.slug}/admin/reset-password?token=${rawToken}&id=${tenant._id}`;

  // DEV ONLY — remove before deployment
  console.log('🔑 DEV reset URL:', resetUrl);

  try {
    await sendPasswordResetEmail({
      to: tenant.email,
      ownerName: tenant.ownerName,
      resetUrl,
    });
  } catch (emailErr) {
    console.error('⚠️  Password reset email failed:', emailErr.message);
  }

  return res.json(SAFE_RESPONSE);
};

// ─── POST /api/tenantauth/reset-password ──────────────────────────────────────

const resetPassword = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, message: 'Validation failed', errors: errors.array() });
  }

  const { token, id, password } = req.body;

  const tenant = await Tenant.findById(id)
    .select('+passwordResetToken +passwordResetExpires +refreshTokenHash');

  if (!tenant || !tenant.passwordResetToken || !tenant.passwordResetExpires) {
    return res.status(400).json({ success: false, message: 'Invalid or expired reset link.' });
  }

  if (new Date(tenant.passwordResetExpires) < new Date()) {
    return res.status(400).json({ success: false, message: 'This reset link has expired. Please request a new one.' });
  }

  const isTokenValid = await bcrypt.compare(token, tenant.passwordResetToken);
  if (!isTokenValid) {
    return res.status(400).json({ success: false, message: 'Invalid or expired reset link.' });
  }

  // Set raw password — pre-save hook hashes it
  tenant.passwordHash = password;

  tenant.passwordResetToken = undefined;
  tenant.passwordResetExpires = undefined;

  // Invalidate all refresh tokens — logs out all devices
  tenant.refreshTokenHash = undefined;

  await tenant.save();

  return res.json({ success: true, message: 'Password reset successfully. Please log in.' });
};

module.exports = { checkSlug, signup, login, logout, forgotPassword, resetPassword };