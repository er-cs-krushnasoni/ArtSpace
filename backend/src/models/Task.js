const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema(
  {
    tenantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Tenant', required: true, index: true },
    queryId: { type: mongoose.Schema.Types.ObjectId, ref: 'Query' },
    customerName: { type: String, required: true },
    mobile: { type: String },
    countryCode: { type: String, default: '+91' },
    instagram: { type: String },
    productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
    type: { type: String, enum: ['delivery', 'appointment'] },
    orderType: { type: String },
    finalPrice: { type: Number },
    paymentStatus: {
      type: String,
      enum: ['none', 'partial', 'full'],
      default: 'none',
    },
    partialAmountPaid: { type: Number, default: 0 },
    taskStatus: {
      type: String,
      enum: ['confirmed', 'in_process', 'completed', 'rescheduled', 'cancelled', 'no_show'],
      default: 'confirmed',
    },
    scheduledDate: { type: Date },
    scheduledTime: { type: String }, // "HH:MM" in IST
    // Delivery specific
    deliveryStatus: { type: String, enum: ['ready', 'delivered', null], default: null },
    keepUntilDate: { type: Date },
    // History
    movedToHistoryAt: { type: Date, default: null },
  },
  { timestamps: true }
);

taskSchema.index({ tenantId: 1, taskStatus: 1 });
taskSchema.index({ movedToHistoryAt: 1 });

const Task = mongoose.model('Task', taskSchema);
module.exports = Task;
