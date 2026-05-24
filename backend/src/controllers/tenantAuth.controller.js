const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const Razorpay = require('razorpay');
const { validationResult } = require('express-validator');
const mongoose = require('mongoose');
const Tenant = require('../models/Tenant');
const TrialBlacklist = require('../models/TrialBlacklist');
const SubscriptionPricing = require('../models/SubscriptionPricing');
const PaymentRecord = require('../models/PaymentRecord');
const { generateAccessToken, generateRefreshToken } = require('../utils/jwtUtils');
const { sendWelcomeEmail, sendPasswordResetEmail } = require('../utils/emailUtils');

// ─── Constants ────────────────────────────────────────────────────────────────
const RESERVED_SLUGS = ['www', 'api', 'admin', 'app', 'mail', 'static', 'assets', 'superadmin', 's'];
const PLAN_DURATIONS = { trial: 7, '1m': 30, '3m': 90, '6m': 180, '12m': 365 };
const DEFAULT_PRICES = { '1m': 499, '3m': 1299, '6m': 2499, '12m': 4499, custom_daily: 20 };

// ─── Helpers ──────────────────────────────────────────────────────────────────
const calcExpiry = (plan, customDays) => {
  const days = plan === 'custom'
    ? (parseInt(customDays, 10) || 1)
    : (PLAN_DURATIONS[plan] ?? 30);
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

const issueTokensForTenant = async (res, tenant) => {
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
  return accessToken;
};

// ─── GET /api/tenantauth/check-slug ──────────────────────────────────────────
const checkSlug = async (req, res) => {
  const { slug } = req.query;
  if (!slug || typeof slug !== 'string') {
    return res.status(400).json({ success: false, message: 'Slug is required' });
  }
  const normalized = slug.toLowerCase().trim();
  if (RESERVED_SLUGS.includes(normalized))
    return res.json({ available: false, reason: 'reserved' });
  if (!/^[a-z0-9-]+$/.test(normalized) || normalized.length < 3 || normalized.length > 30)
    return res.json({ available: false, reason: 'invalid' });
  const existing = await Tenant.findOne({ slug: normalized });
  return res.json({ available: !existing });
};

// ─── POST /api/tenantauth/signup (trial only) ─────────────────────────────────
const signup = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty())
    return res.status(400).json({ success: false, message: 'Validation failed', errors: errors.array() });

  const { businessName, slug, businessType, ownerName, email, mobile, password } = req.body;
  const normalizedSlug = slug.toLowerCase().trim();
  const normalizedEmail = email.toLowerCase().trim();

  if (RESERVED_SLUGS.includes(normalizedSlug))
    return res.status(400).json({ success: false, message: 'This shop URL is reserved.' });

  const [slugTaken, emailTaken] = await Promise.all([
    Tenant.findOne({ slug: normalizedSlug }),
    Tenant.findOne({ email: normalizedEmail }),
  ]);
  if (slugTaken)
    return res.status(400).json({ success: false, message: 'This shop URL is already taken.' });
  if (emailTaken)
    return res.status(400).json({ success: false, message: 'An account with this email already exists.' });

  // Trial abuse checks
  const blacklisted = await TrialBlacklist.findOne({ mobile: mobile.trim() });
  if (blacklisted)
    return res.status(400).json({
      success: false,
      message: 'This mobile number has already been used for a free trial. Please choose a paid plan.',
    });

  const { trialSignupLimiter } = require('../middleware/rateLimiter');
  const limitReached = await new Promise((resolve) => {
    trialSignupLimiter(req, res, (err) => resolve(err ? true : false));
  });
  if (limitReached) return;

  const now = new Date();
  const planExpiryDate = calcExpiry('trial', null);

  const tenant = await Tenant.create({
    slug: normalizedSlug,
    businessName: businessName.trim(),
    businessType,
    ownerName: ownerName.trim(),
    email: normalizedEmail,
    mobile: mobile.trim(),
    passwordHash: password, // pre-save hook hashes it
    status: 'active',
    plan: 'trial',
    planStartDate: now,
    planExpiryDate,
    trialMobileUsed: true,
  });

  await TrialBlacklist.create({ mobile: mobile.trim() });

  try {
    await sendWelcomeEmail({
      to: normalizedEmail,
      ownerName: ownerName.trim(),
      businessName: businessName.trim(),
      slug: normalizedSlug,
      isPaid: false,
    });
  } catch (e) {
    console.error('Welcome email failed:', e.message);
  }

  const accessToken = await issueTokensForTenant(res, tenant);

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

// ─── POST /api/tenantauth/signup-create-order (paid — step 1) ────────────────
const signupCreateOrder = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty())
    return res.status(400).json({ success: false, message: 'Validation failed', errors: errors.array() });

  const { businessName, slug, businessType, ownerName, email, mobile, password, plan, customDays } = req.body;
  const normalizedSlug = slug.toLowerCase().trim();
  const normalizedEmail = email.toLowerCase().trim();

  if (RESERVED_SLUGS.includes(normalizedSlug))
    return res.status(400).json({ success: false, message: 'This shop URL is reserved.' });

  const [slugTaken, emailTaken] = await Promise.all([
    Tenant.findOne({ slug: normalizedSlug }),
    Tenant.findOne({ email: normalizedEmail }),
  ]);
  if (slugTaken) return res.status(400).json({ success: false, message: 'This shop URL is already taken.' });
  if (emailTaken) return res.status(400).json({ success: false, message: 'An account with this email already exists.' });

  // Check plan is enabled
  const planKey = plan === 'custom' ? 'custom_daily' : plan;
  const pricingCheck = await SubscriptionPricing.findOne({ plan: planKey });
  if (pricingCheck && pricingCheck.isEnabled === false)
    return res.status(403).json({ success: false, message: 'This plan is currently unavailable.' });

  // Calculate amount server-side — never trust frontend
  let daysToAdd, amountInPaise;
  if (plan === 'custom') {
    const days = parseInt(customDays, 10);
    if (!days || days < 1)
      return res.status(400).json({ success: false, message: 'Custom plan requires at least 1 day.' });
    const dailyPricing = await SubscriptionPricing.findOne({ plan: 'custom_daily' });
    const dailyRate = dailyPricing?.price ?? DEFAULT_PRICES.custom_daily;
    daysToAdd = days;
    amountInPaise = days * dailyRate * 100;
  } else {
    const pricingRecord = await SubscriptionPricing.findOne({ plan });
    const price = pricingRecord?.price ?? DEFAULT_PRICES[plan];
    if (price === undefined || price === null)
      return res.status(400).json({ success: false, message: 'Plan pricing not configured.' });
    daysToAdd = PLAN_DURATIONS[plan];
    amountInPaise = price * 100;
  }

  // Create Razorpay order
  const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
  });
  const rpOrder = await razorpay.orders.create({
    amount: amountInPaise,
    currency: 'INR',
    receipt: `signup_${normalizedSlug}`,
  });

  // Store signup data in a short-lived signed token (15 min)
  // Avoids a separate DB collection — self-contained and tamper-proof
  const pendingToken = jwt.sign(
    {
      businessName: businessName.trim(),
      slug: normalizedSlug,
      businessType,
      ownerName: ownerName.trim(),
      email: normalizedEmail,
      mobile: mobile.trim(),
      password, // raw — pre-save hook hashes on account creation
      plan,
      daysToAdd,
      razorpayOrderId: rpOrder.id,
    },
    process.env.JWT_ACCESS_SECRET,
    { expiresIn: '15m' }
  );

  // Store pending PaymentRecord (placeholder tenantId updated after account creation)
  await PaymentRecord.create({
    tenantId: new mongoose.Types.ObjectId(),
    razorpayOrderId: rpOrder.id,
    amount: amountInPaise,
    currency: 'INR',
    plan: plan === 'custom' ? 'custom' : plan,
    daysCount: plan === 'custom' ? daysToAdd : null,
    status: 'pending',
  });

  return res.json({
    success: true,
    razorpayOrderId: rpOrder.id,
    amount: amountInPaise,
    currency: 'INR',
    keyId: process.env.RAZORPAY_KEY_ID,
    pendingToken,
  });
};

// ─── POST /api/tenantauth/signup-verify-payment (paid — step 2) ──────────────
const signupVerifyPayment = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty())
    return res.status(400).json({ success: false, message: 'Validation failed', errors: errors.array() });

  const { razorpay_order_id, razorpay_payment_id, razorpay_signature, pendingToken } = req.body;

  // 1. Verify + decode pending token
  let pending;
  try {
    pending = jwt.verify(pendingToken, process.env.JWT_ACCESS_SECRET);
  } catch {
    return res.status(400).json({ success: false, message: 'Signup session expired. Please start again.' });
  }

  // 2. Replay attack check
  const duplicate = await PaymentRecord.findOne({ razorpayPaymentId: razorpay_payment_id });
  if (duplicate)
    return res.status(400).json({ success: false, message: 'Payment already processed.' });

  // 3. Verify HMAC-SHA256 signature
  const expected = crypto
    .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
    .update(`${razorpay_order_id}|${razorpay_payment_id}`)
    .digest('hex');

  if (expected !== razorpay_signature) {
    await PaymentRecord.findOneAndUpdate(
      { razorpayOrderId: razorpay_order_id },
      { status: 'failed', failureReason: 'Signature mismatch' }
    );
    return res.status(400).json({ success: false, message: 'Payment verification failed. Contact support.' });
  }

  // 4. Race condition guard — re-check slug + email
  const [slugTaken, emailTaken] = await Promise.all([
    Tenant.findOne({ slug: pending.slug }),
    Tenant.findOne({ email: pending.email }),
  ]);
  if (slugTaken || emailTaken)
    return res.status(409).json({
      success: false,
      message: 'Your shop URL or email was taken during payment. Contact support with your payment ID.',
    });

  // 5. Create tenant account
  const now = new Date();
  const planExpiryDate = new Date(now.getTime() + pending.daysToAdd * 24 * 60 * 60 * 1000);

  const tenant = await Tenant.create({
    slug: pending.slug,
    businessName: pending.businessName,
    businessType: pending.businessType,
    ownerName: pending.ownerName,
    email: pending.email,
    mobile: pending.mobile,
    passwordHash: pending.password, // pre-save hook hashes it
    status: 'active',
    plan: pending.plan,
    planStartDate: now,
    planExpiryDate,
    subscriptionHistory: [{
      plan: pending.plan,
      startDate: now,
      expiryDate: planExpiryDate,
      paymentMethod: 'razorpay',
      razorpayOrderId: razorpay_order_id,
    }],
  });

  // 6. Update PaymentRecord with real tenantId + mark verified
  await PaymentRecord.findOneAndUpdate(
    { razorpayOrderId: razorpay_order_id },
    {
      tenantId: tenant._id,
      razorpayPaymentId: razorpay_payment_id,
      razorpaySignature: razorpay_signature,
      status: 'verified',
      verifiedAt: now,
    }
  );

  // 7. Welcome email
  try {
    await sendWelcomeEmail({
      to: pending.email,
      ownerName: pending.ownerName,
      businessName: pending.businessName,
      slug: pending.slug,
      isPaid: true,
    });
  } catch (e) {
    console.error('Welcome email failed:', e.message);
  }

  // 8. Issue JWT and return
  const accessToken = await issueTokensForTenant(res, tenant);

  return res.status(201).json({
    success: true,
    accessToken,
    user: {
      id: tenant._id,
      slug: pending.slug,
      businessName: tenant.businessName,
      businessType: tenant.businessType,
      role: 'tenant_admin',
    },
  });
};

// ─── POST /api/tenantauth/login ───────────────────────────────────────────────
const login = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty())
    return res.status(400).json({ success: false, message: 'Validation failed', errors: errors.array() });

  const { email, password } = req.body;
  const tenant = await Tenant.findOne({ email: email.toLowerCase().trim() })
    .select('+passwordHash +refreshTokenHash');

  if (!tenant)
    return res.status(401).json({ success: false, message: 'Invalid email or password' });

  const isPasswordValid = await bcrypt.compare(password, tenant.passwordHash);
  if (!isPasswordValid)
    return res.status(401).json({ success: false, message: 'Invalid email or password' });

  if (tenant.status === 'inactive')
    return res.status(403).json({ success: false, message: 'Your account has been deactivated. Please contact support.', code: 'ACCOUNT_INACTIVE' });

  if (tenant.status === 'pending_manual')
    return res.status(403).json({ success: false, message: 'Your account is pending activation. Please contact support.', code: 'PENDING_MANUAL' });

  let statusCode = null;
  if (tenant.status === 'expired') statusCode = 'SUBSCRIPTION_EXPIRED';
  if (tenant.status === 'paused') statusCode = 'ACCOUNT_PAUSED';

  const accessToken = await issueTokensForTenant(res, tenant);

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
      if (decoded.role === 'tenant_admin')
        await Tenant.findByIdAndUpdate(decoded.id, { $unset: { refreshTokenHash: '' } });
    } catch {
      // Token already invalid — still clear cookie
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
  if (!errors.isEmpty())
    return res.status(400).json({ success: false, message: 'Validation failed', errors: errors.array() });

  const SAFE_RESPONSE = { success: true, message: 'If an account with that email exists, a reset link has been sent.' };

  const tenant = await Tenant.findOne({ email: req.body.email.toLowerCase().trim() });
  if (!tenant) return res.json(SAFE_RESPONSE);

  const rawToken = crypto.randomBytes(32).toString('hex');
  const tokenHash = await bcrypt.hash(rawToken, 10);
  tenant.passwordResetToken = tokenHash;
  tenant.passwordResetExpires = new Date(Date.now() + 60 * 60 * 1000);
  await tenant.save();

  const resetUrl = `${process.env.FRONTEND_URL}/s/${tenant.slug}/admin/reset-password?token=${rawToken}&id=${tenant._id}`;
  console.log('🔑 DEV reset URL:', resetUrl); // remove before production

  try {
    await sendPasswordResetEmail({ to: tenant.email, ownerName: tenant.ownerName, resetUrl });
  } catch (e) {
    console.error('Password reset email failed:', e.message);
  }

  return res.json(SAFE_RESPONSE);
};

// ─── POST /api/tenantauth/reset-password ──────────────────────────────────────
const resetPassword = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty())
    return res.status(400).json({ success: false, message: 'Validation failed', errors: errors.array() });

  const { token, id, password } = req.body;
  const tenant = await Tenant.findById(id)
    .select('+passwordResetToken +passwordResetExpires +refreshTokenHash');

  if (!tenant || !tenant.passwordResetToken || !tenant.passwordResetExpires)
    return res.status(400).json({ success: false, message: 'Invalid or expired reset link.' });

  if (new Date(tenant.passwordResetExpires) < new Date())
    return res.status(400).json({ success: false, message: 'This reset link has expired. Please request a new one.' });

  const isTokenValid = await bcrypt.compare(token, tenant.passwordResetToken);
  if (!isTokenValid)
    return res.status(400).json({ success: false, message: 'Invalid or expired reset link.' });

  tenant.passwordHash = password; // pre-save hook hashes it
  tenant.passwordResetToken = undefined;
  tenant.passwordResetExpires = undefined;
  tenant.refreshTokenHash = undefined; // invalidate all sessions
  await tenant.save();

  return res.json({ success: true, message: 'Password reset successfully. Please log in.' });
};

module.exports = {
  checkSlug,
  signup,
  signupCreateOrder,
  signupVerifyPayment,
  login,
  logout,
  forgotPassword,
  resetPassword,
};