const mongoose = require('mongoose');
const analyticsSnapshotSchema = new mongoose.Schema(
  {
    tenantId:  { type: mongoose.Schema.Types.ObjectId, ref: 'Tenant',  required: true, index: true },
    // 'query' = submitted query (permanent, never deleted)
    // 'task'  = confirmed order (deleted on cancel/manual delete)
    type: { type: String, enum: ['query', 'task'], required: true },
    // For type='query'
    queryId:     { type: mongoose.Schema.Types.ObjectId },
    submittedAt: { type: Date },
    isConfirmed: { type: Boolean, default: false }, // true once confirmed → task created
    // For type='task'
    taskId:      { type: mongoose.Schema.Types.ObjectId },
    confirmedAt: { type: Date },
    // Shared fields
    queryType: { type: String, enum: ['SHOP_ORDER', 'CUSTOM_ORDER', 'APPOINTMENT'] },
    orderType: { type: String, enum: ['delivery', 'pickup', 'at_home', 'at_shop'] },
    productId:   { type: mongoose.Schema.Types.ObjectId },
    productName: { type: String, default: '' },
    // When true: task is cancelled — excluded from analytics but not deleted
    // Allows restoration if task moves back to non-cancelled state
    isExcluded: { type: Boolean, default: false },
    // Payment fields (only meaningful for type='task')
    totalPaid:     { type: Number, default: 0 },
    finalPrice:    { type: Number, default: null },
    paymentStatus: { type: String, enum: ['none', 'partial', 'full'], default: 'none' },
    amountPending: { type: Number, default: 0 },
    paymentEntries: [
      {
        amount: { type: Number },
        date:   { type: Date },
      }
    ],
  },
  { timestamps: false }
);
analyticsSnapshotSchema.index({ tenantId: 1, type: 1 });
analyticsSnapshotSchema.index({ tenantId: 1, submittedAt: -1 });
analyticsSnapshotSchema.index({ tenantId: 1, confirmedAt: -1 });
analyticsSnapshotSchema.index({ taskId: 1 }, { sparse: true });   // sparse = allows multiple nulls
analyticsSnapshotSchema.index({ queryId: 1 }, { sparse: true });  // sparse = allows multiple nulls
module.exports = mongoose.model('AnalyticsSnapshot', analyticsSnapshotSchema);