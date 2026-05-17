const Razorpay = require('razorpay');
const crypto = require('crypto');
const Tenant = require('../models/Tenant');
const PaymentRecord = require('../models/PaymentRecord');
const SubscriptionPricing = require('../models/SubscriptionPricing');
const AuditLog = require('../models/AuditLog');

// Plan duration map (in days)
const PLAN_DURATION = {
  '1m': 30,
  '3m': 90,
  '6m': 180,
  '12m': 365,
};

// Default prices if DB has no entry yet
const DEFAULT_PRICES = {
  '1m': 499,
  '3m': 1299,
  '6m': 2499,
  '12m': 4499,
  custom_daily: 20,
};

// ─── Super Admin: Get all plan prices ────────────────────────────────────────
const getPricing = async (req, res) => {
  const records = await SubscriptionPricing.find({});

  // Merge DB records with defaults so all plans always appear
  const pricing = { ...DEFAULT_PRICES };
  records.forEach((r) => {
    pricing[r.plan] = r.price;
  });

  res.json({ success: true, pricing });
};

// ─── Super Admin: Update a plan price ────────────────────────────────────────
const updatePricing = async (req, res) => {
  const { plan, price } = req.body;

  const validPlans = ['1m', '3m', '6m', '12m', 'custom_daily'];
  if (!validPlans.includes(plan)) {
    return res.status(400).json({ success: false, message: 'Invalid plan identifier.' });
  }
  if (!Number.isInteger(Number(price)) || Number(price) < 0) {
    return res.status(400).json({ success: false, message: 'Price must be a non-negative integer.' });
  }

  const PLAN_LABELS = {
    '1m': '1 Month',
    '3m': '3 Months',
    '6m': '6 Months',
    '12m': '12 Months',
    custom_daily: 'Custom (per day)',
  };

  const record = await SubscriptionPricing.findOneAndUpdate(
    { plan },
    {
      plan,
      price: Number(price),
      label: PLAN_LABELS[plan],
      durationDays: PLAN_DURATION[plan] || null,
      updatedAt: new Date(),
    },
    { upsert: true, new: true }
  );

  res.json({ success: true, message: 'Price updated successfully.', record });
};

// ─── Tenant: Create Razorpay order ───────────────────────────────────────────
const createOrder = async (req, res) => {
  const { plan, customDays } = req.body;
  const tenantId = req.user.tenantId;

  const validPlans = ['1m', '3m', '6m', '12m', 'custom'];
  if (!validPlans.includes(plan)) {
    return res.status(400).json({ success: false, message: 'Invalid plan selected.' });
  }

  // Custom Days validation
  if (plan === 'custom') {
    const days = parseInt(customDays, 10);
    if (!days || days < 1) {
      return res.status(400).json({ success: false, message: 'Custom plan requires at least 1 day.' });
    }

    // Server-side price calculation — never trust frontend amount
    const dailyPricing = await SubscriptionPricing.findOne({ plan: 'custom_daily' });
    const dailyRate = dailyPricing ? dailyPricing.price : DEFAULT_PRICES['custom_daily'];

    const totalAmount = days * dailyRate;

    const razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });

    const rpOrder = await razorpay.orders.create({
      amount: totalAmount * 100, // paise
      currency: 'INR',
      receipt: tenantId.toString(),
    });

    await PaymentRecord.create({
      tenantId,
      razorpayOrderId: rpOrder.id,
      amount: totalAmount * 100,
      currency: 'INR',
      plan: 'custom',
      daysCount: days,
      status: 'pending',
    });

    return res.json({
      success: true,
      razorpayOrderId: rpOrder.id,
      amount: totalAmount * 100,
      currency: 'INR',
      keyId: process.env.RAZORPAY_KEY_ID,
      daysCount: days,
      totalAmount,
    });
  }

  // Standard plans
  const pricingRecord = await SubscriptionPricing.findOne({ plan });
  const price = pricingRecord ? pricingRecord.price : DEFAULT_PRICES[plan];

  if (price === undefined || price === null) {
    return res.status(400).json({ success: false, message: 'Plan pricing not configured yet.' });
  }

  const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
  });

  const rpOrder = await razorpay.orders.create({
    amount: price * 100,
    currency: 'INR',
    receipt: tenantId.toString(),
  });

  await PaymentRecord.create({
    tenantId,
    razorpayOrderId: rpOrder.id,
    amount: price * 100,
    currency: 'INR',
    plan,
    status: 'pending',
  });

  res.json({
    success: true,
    razorpayOrderId: rpOrder.id,
    amount: price * 100,
    currency: 'INR',
    keyId: process.env.RAZORPAY_KEY_ID,
  });
};

// ─── Tenant: Verify payment + activate subscription ──────────────────────────
const verifyPayment = async (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature, plan } = req.body;
  const tenantId = req.user.tenantId;

  // 1. Replay attack prevention — reject duplicate payment IDs
  const duplicate = await PaymentRecord.findOne({ razorpayPaymentId: razorpay_payment_id });
  if (duplicate) {
    return res.status(400).json({
      success: false,
      message: 'Payment already processed. Contact support if this is an error.',
    });
  }

  // 2. Verify HMAC-SHA256 signature
  const expectedSignature = crypto
    .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
    .update(`${razorpay_order_id}|${razorpay_payment_id}`)
    .digest('hex');

  if (expectedSignature !== razorpay_signature) {
    // Mark payment record as failed
    await PaymentRecord.findOneAndUpdate(
      { razorpayOrderId: razorpay_order_id },
      { status: 'failed', failureReason: 'Signature mismatch' }
    );
    return res.status(400).json({
      success: false,
      message: 'Payment verification failed. Please contact support.',
    });
  }

  // 3. Signature valid — activate subscription
  const tenant = await Tenant.findById(tenantId);
  if (!tenant) {
    return res.status(404).json({ success: false, message: 'Tenant not found.' });
  }

  // For custom plan, get daysCount from the PaymentRecord (server-stored, not from frontend)
  const paymentRecord = await PaymentRecord.findOne({ razorpayOrderId: razorpay_order_id });
  const durationDays = plan === 'custom'
    ? (paymentRecord?.daysCount || 0)
    : PLAN_DURATION[plan];

  if (!durationDays || durationDays < 1) {
    return res.status(400).json({ success: false, message: 'Invalid plan duration.' });
  }

  const now = new Date();

  // Calculate new expiry: extend if active, start fresh if expired
  let newExpiry;
  if (
    tenant.status === 'active' &&
    tenant.planExpiryDate &&
    new Date(tenant.planExpiryDate) > now
  ) {
    // Stack on top of existing expiry
    newExpiry = new Date(tenant.planExpiryDate);
    newExpiry.setDate(newExpiry.getDate() + durationDays);
  } else {
    // Start fresh from now
    newExpiry = new Date(now);
    newExpiry.setDate(newExpiry.getDate() + durationDays);
  }

  // Fetch price for history record
  const pricingRecord = await SubscriptionPricing.findOne({ plan });
  const paidAmount = pricingRecord ? pricingRecord.price : DEFAULT_PRICES[plan];

  // Update tenant
  tenant.plan = plan;
  tenant.planStartDate = now;
  tenant.planExpiryDate = newExpiry;
  tenant.status = 'active';
  tenant.subscriptionHistory.push({
    plan,
    startDate: now,
    expiryDate: newExpiry,
    paidAmount,
    paymentMethod: 'razorpay',
    razorpayOrderId: razorpay_order_id,
    note: plan === 'custom' ? `Custom plan: ${durationDays} days` : null,
  });
  await tenant.save();

  // Update payment record
  await PaymentRecord.findOneAndUpdate(
    { razorpayOrderId: razorpay_order_id },
    {
      status: 'verified',
      razorpayPaymentId: razorpay_payment_id,
      razorpaySignature: razorpay_signature,
      verifiedAt: now,
    }
  );

  res.json({
    success: true,
    message: 'Payment verified. Subscription activated.',
    plan,
    expiryDate: newExpiry,
    daysRemaining: Math.ceil((newExpiry - now) / (1000 * 60 * 60 * 24)),
  });
};

// ─── Tenant: Get subscription status ─────────────────────────────────────────
const getSubscriptionStatus = async (req, res) => {
  const tenant = await Tenant.findById(req.user.tenantId);
  if (!tenant) {
    return res.status(404).json({ success: false, message: 'Tenant not found.' });
  }

  const now = new Date();
  const daysRemaining = tenant.planExpiryDate
    ? Math.max(0, Math.ceil((new Date(tenant.planExpiryDate) - now) / (1000 * 60 * 60 * 24)))
    : 0;

  // Total days for the current plan (for progress bar)
  const totalDays = PLAN_DURATION[tenant.plan] || 7; // trial = 7

  res.json({
    success: true,
    plan: tenant.plan,
    status: tenant.status,
    planStartDate: tenant.planStartDate,
    planExpiryDate: tenant.planExpiryDate,
    daysRemaining,
    totalDays,
    trialMobileUsed: tenant.trialMobileUsed || false,
  });
};

// ─── Super Admin: Pause tenant ────────────────────────────────────────────────
const pauseTenant = async (req, res) => {
  const { tenantId } = req.params;
  const { reason } = req.body;

  const tenant = await Tenant.findById(tenantId);
  if (!tenant) return res.status(404).json({ success: false, message: 'Tenant not found.' });

  if (tenant.status === 'paused') {
    return res.status(400).json({ success: false, message: 'Tenant is already paused.' });
  }

  tenant.status = 'paused';
  tenant.pausedAt = new Date();
  // Invalidate all refresh tokens immediately
  tenant.refreshTokenHash = undefined;
  await tenant.save();

  // Audit log
  await AuditLog.create({
    actionType: 'TENANT_PAUSED',
    superAdminId: req.user.id,
    tenantId: tenant._id,
    targetField: 'status',
    oldValue: 'active',
    newValue: 'paused',
    reason: reason || null,
    timestamp: new Date(),
  });

  res.json({ success: true, message: 'Tenant paused successfully.', tenant });
};

// ─── Super Admin: Unpause tenant ──────────────────────────────────────────────
const unpauseTenant = async (req, res) => {
  const { tenantId } = req.params;

  const tenant = await Tenant.findById(tenantId);
  if (!tenant) return res.status(404).json({ success: false, message: 'Tenant not found.' });

  if (tenant.status !== 'paused') {
    return res.status(400).json({ success: false, message: 'Tenant is not paused.' });
  }

  const pausedAt = tenant.pausedAt ? new Date(tenant.pausedAt) : new Date();
  const now = new Date();

  // Precise ms — no rounding up to full days
  const pausedDurationMs = now - pausedAt;
  const pausedMinutes = Math.round(pausedDurationMs / (1000 * 60));

  // Credit exact pause duration back to expiry
  const currentExpiry = new Date(tenant.planExpiryDate || now);
  const newExpiry = new Date(currentExpiry.getTime() + pausedDurationMs);

  // If expiry is still in the past after crediting → restore as expired
  const restoredStatus = newExpiry > now ? 'active' : 'expired';

  tenant.status = restoredStatus;
  tenant.planExpiryDate = newExpiry;
  tenant.pausedDays = (tenant.pausedDays || 0) + pausedDurationMs / (1000 * 60 * 60 * 24);
  tenant.pausedAt = undefined;
  await tenant.save();

  await AuditLog.create({
    actionType: 'TENANT_UNPAUSED',
    superAdminId: req.user.id,
    tenantId: tenant._id,
    targetField: 'status',
    oldValue: 'paused',
    newValue: restoredStatus,
    reason: `Paused for ~${pausedMinutes} minute(s). Exact duration credited back. Restored as ${restoredStatus}.`,
    timestamp: new Date(),
  });

  res.json({
    success: true,
    message: `Tenant unpaused. ~${pausedMinutes} minute(s) credited back. Status: ${restoredStatus}.`,
    tenant,
  });
};

module.exports = {
  getPricing,
  updatePricing,
  createOrder,
  verifyPayment,
  getSubscriptionStatus,
  pauseTenant,
  unpauseTenant,
};