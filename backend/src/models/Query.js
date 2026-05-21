const mongoose = require('mongoose');

const querySchema = new mongoose.Schema(
  {
    tenantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Tenant', required: true, index: true },
    type: {
      type: String,
      enum: ['SHOP_ORDER', 'CUSTOM_ORDER', 'APPOINTMENT'],
      required: true,
    },
    customerName: { type: String, required: true },
    mobile: { type: String, required: true },
    countryCode: { type: String, default: '+91' },
    address: { type: String },
    instagram: { type: String },
    preferredDate: { type: Date },
    preferredTime: { type: String, default: null }, // e.g. "14:30" — stored as HH:mm string
    orderType: { type: String, enum: ['delivery', 'pickup', 'at_home', 'at_shop', null] },
    createdBy: { type: String, enum: ['customer', 'admin'], default: 'customer' },
    productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
    lockedDeliveryPrice: { type: Number },
    lockedAppointmentPrice: { type: Number },
    customPrice: { type: Number },
    referenceImages: [{ type: String }],
    descriptionImages: [{ type: String }],
    descriptionText: { type: String },
    status: {
      type: String,
      enum: ['unread', 'reply_later', 'seen'],
      default: 'unread',
    },
    seenAt: { type: Date, default: null },
  },
  { timestamps: true }
);

querySchema.index({ tenantId: 1, status: 1 });
querySchema.index({ seenAt: 1 });

const Query = mongoose.model('Query', querySchema);
module.exports = Query;