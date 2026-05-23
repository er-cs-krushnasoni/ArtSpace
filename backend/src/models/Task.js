const mongoose = require('mongoose');

const paymentEntrySchema = new mongoose.Schema(
  {
    amount: { type: Number, required: true },
    date:   { type: Date,   required: true },
    note:   { type: String, default: '' },
  },
  { _id: true, timestamps: false }
);

const taskSchema = new mongoose.Schema(
  {
    tenantId:     { type: mongoose.Schema.Types.ObjectId, ref: 'Tenant',  required: true, index: true },
    queryId:      { type: mongoose.Schema.Types.ObjectId, ref: 'Query' },
    customerName: { type: String, required: true },
    mobile:       { type: String },
    countryCode:  { type: String, default: '+91' },
    instagram:    { type: String },
    productId:    { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
    type:         { type: String, enum: ['delivery', 'appointment'] },
    orderType:    { type: String },
    address:      { type: String, default: '' },

    // Copied from Query at confirmation time
    referenceImages:   [{ type: String }],
    descriptionImages: [{ type: String }],
    descriptionText:   { type: String, default: '' },

    // Admin notes (separate from customer description)
    adminNotes: { type: String, default: '' },

    // Payment
    finalPrice:     { type: Number, default: null },
    paymentEntries: [paymentEntrySchema],
    totalPaid:      { type: Number, default: 0 },
    amountPending:  { type: Number, default: 0 },
    paymentStatus:  { type: String, enum: ['none', 'partial', 'full'], default: 'none' },

    taskStatus: {
      type: String,
      enum: ['pending', 'processing', 'ready', 'completed', 'cancelled'],
      default: 'pending',
    },

    scheduledDate: { type: Date },
    scheduledTime: { type: String },

    // Cron timer — only set when completed + full payment
    cancelledAt:        { type: Date, default: null },
    completedAt:        { type: Date, default: null },
    // Display only — set the moment task is marked completed regardless of payment
    completedTimestamp: { type: Date, default: null },
  },
  { timestamps: true }
);

taskSchema.index({ tenantId: 1, taskStatus: 1 });
taskSchema.index({ cancelledAt: 1 });
taskSchema.index({ completedAt: 1 });

const Task = mongoose.model('Task', taskSchema);
module.exports = Task;