const mongoose = require('mongoose');

/**
 * PaymentRecord — stores every Razorpay payment attempt and result.
 *
 * razorpayPaymentId has a unique index — prevents replay attacks where
 * the same payment_id is submitted twice to activate a subscription twice.
 */
const paymentRecordSchema = new mongoose.Schema(
  {
    tenantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Tenant',
      required: true,
      index: true,
    },
    razorpayOrderId: {
      type: String,
      required: true,
      index: true,
    },
    // Unique — prevents replay attacks
    razorpayPaymentId: {
      type: String,
      sparse: true, // null for pending/failed records
      unique: true,
    },
    razorpaySignature: {
      type: String,
      select: false, // never returned in API responses
    },
    amount: {
      type: Number,
      required: true, // in paise (Razorpay uses smallest currency unit)
    },
    currency: {
      type: String,
      default: 'INR',
    },
    plan: {
      type: String,
      required: true,
      enum: ['1m', '3m', '6m', '12m', 'custom'],
    },
    status: {
      type: String,
      enum: ['pending', 'verified', 'failed'],
      default: 'pending',
    },
    verifiedAt: { type: Date, default: null },
    failureReason: { type: String, default: null },
  },
  { timestamps: true }
);

const PaymentRecord = mongoose.model('PaymentRecord', paymentRecordSchema);
module.exports = PaymentRecord;