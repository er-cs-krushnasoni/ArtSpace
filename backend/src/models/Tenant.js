// backend/src/models/Tenant.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const { BUSINESS_TYPES } = require('../config/businessTypes');

const subscriptionHistorySchema = new mongoose.Schema({
  plan: { type: String },
  startDate: { type: Date },
  expiryDate: { type: Date },
  paidAmount: { type: Number },
  paymentMethod: { type: String },
  razorpayOrderId: { type: String },
  note: { type: String },
  createdAt: { type: Date, default: Date.now },
});

const websiteConfigSchema = new mongoose.Schema({
  logo: { type: String, default: null },
  logoPublicId: { type: String, default: null },
  primaryColor: { type: String, default: '#7c3aed' },
  accentColor: { type: String, default: '#f59e0b' },
  bgColor: { type: String, default: '#fafaf9' },
  navBg: { type: String, default: null },
  navText: { type: String, default: null },
  textColor: { type: String, default: null },
  cardBg: { type: String, default: null },
  btnText: { type: String, default: null },
  publicTheme: { type: String, enum: ['light', 'dark'], default: 'light' },
  whatsapp: { type: String, default: null },
  instagram: { type: String, default: null },
  address: { type: String, default: '' },
  sliderEnabled: { type: Boolean, default: false },
  quizEnabled: { type: Boolean, default: false },
  blogEnabled: { type: Boolean, default: false },
  deliveryEnabled: { type: Boolean, default: false },
  appointmentEnabled: { type: Boolean, default: true },
  appointmentAtHome: { type: Boolean, default: true },
  shopVisible: { type: Boolean, default: true },
  faqEnabled: { type: Boolean, default: false },
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
      enum: BUSINESS_TYPES,
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
    passwordResetToken: { type: String, select: false },
    passwordResetExpires: { type: Date, select: false },
    refreshTokenHash: { type: String, select: false },
    websiteConfig: { type: websiteConfigSchema, default: () => ({}) },
    subscriptionHistory: [subscriptionHistorySchema],
  },
  { timestamps: true }
);

tenantSchema.pre('save', async function () {
  if (!this.isModified('passwordHash')) return;
  if (this.passwordHash.startsWith('$2')) return;
  this.passwordHash = await bcrypt.hash(this.passwordHash, 12);
});

tenantSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.passwordHash);
};

tenantSchema.methods.isSubscriptionActive = function () {
  return (
    this.status === 'active' &&
    this.planExpiryDate &&
    new Date(this.planExpiryDate) > new Date()
  );
};

tenantSchema.virtual('daysRemaining').get(function () {
  if (!this.planExpiryDate) return 0;
  const diff = new Date(this.planExpiryDate) - new Date();
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
});

tenantSchema.set('toJSON', { virtuals: true });

const Tenant = mongoose.model('Tenant', tenantSchema);
module.exports = Tenant;