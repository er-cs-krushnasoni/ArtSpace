const mongoose = require('mongoose');

const subscriptionPricingSchema = new mongoose.Schema(
  {
    plan: {
      type: String,
      enum: ['1m', '3m', '6m', '12m', 'custom_daily'],
      required: true,
      unique: true,
    },
    price: {
      type: Number,
      required: [true, 'Price is required'],
      min: [0, 'Price cannot be negative'],
    },
    label: { type: String }, // e.g. "1 Month", "3 Months"
    durationDays: { type: Number }, // for standard plans
    isEnabled: { type: Boolean, default: true },
    updatedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

const SubscriptionPricing = mongoose.model('SubscriptionPricing', subscriptionPricingSchema);
module.exports = SubscriptionPricing;
