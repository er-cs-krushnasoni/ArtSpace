const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const subscriptionHistorySchema = new mongoose.Schema({
  plan: { type: String },
  startDate: { type: Date },
  expiryDate: { type: Date },
  paidAmount: { type: Number },
  paymentMethod: { type: String }, // 'razorpay' | 'manual'
  razorpayOrderId: { type: String },
  note: { type: String },
  createdAt: { type: Date, default: Date.now },
});

const websiteConfigSchema = new mongoose.Schema({
  logo: { type: String, default: null },
  logoPublicId: { type: String, default: null },
  primaryColor: { type: String, default: '#8b5cf6' },
  accentColor: { type: String, default: '#ec4899' },
  whatsapp: { type: String, default: null },
  instagram: { type: String, default: null },
  address: { type: String, default: '' },
  sliderEnabled: { type: Boolean, default: false },
  quizEnabled: { type: Boolean, default: false },
  blogEnabled: { type: Boolean, default: false },
  deliveryEnabled: { type: Boolean, default: true },
  appointmentEnabled: { type: Boolean, default: true },
  shopVisible: { type: Boolean, default: true },
  tutorialVideoUrl: { type: String, default: null },
  tutorialVideoPublicId: { type: String, default: null },
  appName: { type: String, default: '' },
  pwaIcon: { type: String, default: null },
  pwaIconPublicId: { type: String, default: null },
});

const tenantSchema = new mongoose.Schema(
  {
    slug: {
      type: String,
      required: [true, 'Shop URL slug is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^[a-z0-9-]+$/,
        'Slug can only contain lowercase letters, numbers, and hyphens',
      ],
    },
    businessName: {
      type: String,
      required: [true, 'Business name is required'],
      trim: true,
    },
    businessType: {
      type: String,
      required: true,
      enum: ['nail_art', 'mehendi', 'jewellery', 'cake', 'generic'],
      default: 'generic',
    },
    ownerName: {
      type: String,
      required: [true, 'Owner name is required'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
    },
    mobile: {
      type: String,
      required: [true, 'Mobile number is required'],
      trim: true,
    },
    passwordHash: {
      type: String,
      required: true,
      select: false,
    },

    // Status — no 'pending' (all signups auto-approved)
    // 'pending_manual' only for super admin cash bypass Option A flow
    status: {
      type: String,
      enum: ['active', 'inactive', 'paused', 'expired', 'pending_manual'],
      default: 'active',
    },

    plan: {
      type: String,
      enum: ['trial', '1m', '3m', '6m', '12m', 'custom'],
      default: 'trial',
    },
    planStartDate: { type: Date },
    planExpiryDate: { type: Date },
    pausedAt: { type: Date },
    pausedDays: { type: Number, default: 0 },

    // Password reset
    passwordResetToken: { type: String, select: false },
    passwordResetExpires: { type: Date, select: false },

    // Refresh token stored as bcrypt hash — raw token only in httpOnly cookie
    refreshTokenHash: { type: String, select: false },

    // Website config
    websiteConfig: { type: websiteConfigSchema, default: () => ({}) },

    // Subscription history
    subscriptionHistory: [subscriptionHistorySchema],
  },
  { timestamps: true }
);

// Hash password before saving
tenantSchema.pre('save', async function () {
  if (!this.isModified('passwordHash')) return;
  this.passwordHash = await bcrypt.hash(this.passwordHash, 12);
});

// Compare plain password against stored hash
tenantSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.passwordHash);
};

// Check if subscription is currently active
tenantSchema.methods.isSubscriptionActive = function () {
  return (
    this.status === 'active' &&
    this.planExpiryDate &&
    new Date(this.planExpiryDate) > new Date()
  );
};

// Virtual: days remaining on subscription
tenantSchema.virtual('daysRemaining').get(function () {
  if (!this.planExpiryDate) return 0;
  const diff = new Date(this.planExpiryDate) - new Date();
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
});

tenantSchema.set('toJSON', { virtuals: true });

const Tenant = mongoose.model('Tenant', tenantSchema);
module.exports = Tenant;