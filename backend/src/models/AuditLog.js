const mongoose = require('mongoose');

/**
 * AuditLog — append-only collection.
 * Records every super admin action that affects a tenant.
 *
 * CRITICAL: No update or delete routes must ever exist for this collection.
 * Only INSERT operations are permitted — enforced at controller level.
 */
const auditLogSchema = new mongoose.Schema(
  {
    actionType: {
      type: String,
      required: true,
      enum: [
  'PAYMENT_BYPASS',
  'PLAN_CHANGE',
  'EXPIRY_CHANGE',
  'STATUS_CHANGE',
  'SLUG_CHANGE',
  'TENANT_CREATED',
  'TENANT_DEACTIVATED',
  'TENANT_ACTIVATED',
  'TENANT_PAUSED',
  'TENANT_UNPAUSED',
  'TENANT_DELETED',
  'PASSWORD_RESET_BY_ADMIN',
  'CREDENTIALS_CHANGE',
],
    },
    superAdminId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'SuperAdmin',
      required: true,
    },
    tenantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Tenant',
      required: true,
    },
    targetField: { type: String, default: null },
    oldValue: { type: String, default: null },
    newValue: { type: String, default: null },
    // Mandatory for PAYMENT_BYPASS — optional for others
    reason: { type: String, default: null },
    timestamp: { type: Date, default: Date.now, immutable: true },
  },
  {
    // Disable Mongoose auto timestamps — we control timestamp manually
    timestamps: false,
    // Prevent accidental updates at schema level
    strict: true,
  }
);

// Index for fast lookup by tenant
auditLogSchema.index({ tenantId: 1, timestamp: -1 });
auditLogSchema.index({ superAdminId: 1, timestamp: -1 });

const AuditLog = mongoose.model('AuditLog', auditLogSchema);
module.exports = AuditLog;