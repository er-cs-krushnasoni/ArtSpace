const express = require('express');
const { body, param, query } = require('express-validator');
const router = express.Router();

const { login, logout, getMe, getStats } = require('../controllers/superAdminAuth.controller');
const {
  listTenants, getTenant, updateTenantStatus, updateTenantSlug,
  updateTenantPlan, adjustDays, bypassPayment,
  pauseTenantAdmin, unpauseTenantAdmin, createTenant,
  getPricing, updatePricing, getAuditLog, checkSlug,
  deleteTenant, togglePlan, getPayments,
} = require('../controllers/superAdmin.controller');
const { authenticateSuperAdmin } = require('../middleware/auth');
const { authLimiter } = require('../middleware/rateLimiter');

// ─── Auth ─────────────────────────────────────────────────────────────────────
router.post('/auth/login', authLimiter, [
  body('email').trim().notEmpty().isEmail(),
  body('password').notEmpty().isLength({ min: 6 }),
], login);
router.post('/auth/logout', logout);
router.get('/auth/me', authenticateSuperAdmin, getMe);

// ─── Dashboard stats ──────────────────────────────────────────────────────────
router.get('/stats', authenticateSuperAdmin, getStats);

// ─── Slug availability check ──────────────────────────────────────────────────
router.get('/tenants/check-slug', authenticateSuperAdmin, checkSlug);

// ─── Tenant list + create ─────────────────────────────────────────────────────
router.get('/tenants', authenticateSuperAdmin, listTenants);

router.post('/tenants', authenticateSuperAdmin, [
  body('businessName').trim().notEmpty().withMessage('Business name is required'),
  body('slug').trim().notEmpty().matches(/^[a-z0-9-]+$/).withMessage('Invalid slug format'),
  body('businessType').isIn(['nail_art', 'mehendi', 'jewellery', 'cake', 'generic']),
  body('ownerName').trim().notEmpty().withMessage('Owner name is required'),
  body('email').trim().isEmail().withMessage('Valid email required'),
  body('mobile').trim().notEmpty().withMessage('Mobile is required'),
  body('initialPassword').notEmpty().isLength({ min: 6 }).withMessage('Password must be at least 6 chars'),
  body('plan').isIn(['trial', '1m', '3m', '6m', '12m', 'custom']).withMessage('Invalid plan'),
  body('customDays').optional({ nullable: true, checkFalsy: true }).isInt({ min: 1 }),
], createTenant);

// ─── Single tenant ────────────────────────────────────────────────────────────
router.get('/tenants/:tenantId', authenticateSuperAdmin, [
  param('tenantId').isMongoId(),
], getTenant);

// ─── Status (activate / deactivate) ──────────────────────────────────────────
router.patch('/tenants/:tenantId/status', authenticateSuperAdmin, [
  param('tenantId').isMongoId(),
  body('status').isIn(['active', 'inactive']).withMessage('Status must be active or inactive'),
], updateTenantStatus);

// ─── Pause / Unpause ──────────────────────────────────────────────────────────
router.patch('/tenants/:tenantId/pause', authenticateSuperAdmin, [
  param('tenantId').isMongoId(),
], pauseTenantAdmin);

router.patch('/tenants/:tenantId/unpause', authenticateSuperAdmin, [
  param('tenantId').isMongoId(),
], unpauseTenantAdmin);

// ─── Slug change ──────────────────────────────────────────────────────────────
router.patch('/tenants/:tenantId/slug', authenticateSuperAdmin, [
  param('tenantId').isMongoId(),
  body('slug').trim().notEmpty().matches(/^[a-z0-9-]+$/).withMessage('Invalid slug format'),
], updateTenantSlug);

// ─── Plan change ──────────────────────────────────────────────────────────────
router.patch('/tenants/:tenantId/plan', authenticateSuperAdmin, [
  param('tenantId').isMongoId(),
  body('plan').isIn(['trial', '1m', '3m', '6m', '12m', 'custom']),
  body('reason').notEmpty().withMessage('Reason is required'),
  body('customDays').optional({ nullable: true, checkFalsy: true }).isInt({ min: 1 }),
], updateTenantPlan);

// ─── Adjust days (extend / reduce) ───────────────────────────────────────────
router.patch('/tenants/:tenantId/adjust-days', authenticateSuperAdmin, [
  param('tenantId').isMongoId(),
  body('days').isInt().withMessage('Days must be an integer (positive or negative)'),
  body('reason').notEmpty().withMessage('Reason is mandatory for day adjustments'),
], adjustDays);

// ─── Bypass payment ───────────────────────────────────────────────────────────
router.patch('/tenants/:tenantId/bypass-payment', authenticateSuperAdmin, [
  param('tenantId').isMongoId(),
  body('plan').isIn(['trial', '1m', '3m', '6m', '12m', 'custom']),
  body('reason').notEmpty().withMessage('Reason is mandatory for payment bypass'),
  body('customDays').optional({ nullable: true, checkFalsy: true }).isInt({ min: 1 }),
], bypassPayment);

// ─── Pricing ──────────────────────────────────────────────────────────────────
router.get('/pricing', authenticateSuperAdmin, getPricing);
router.patch('/pricing', authenticateSuperAdmin, [
  body('plan').isIn(['1m', '3m', '6m', '12m', 'custom_daily']),
  body('price').isInt({ min: 0 }),
], updatePricing);

// ─── Audit log ────────────────────────────────────────────────────────────────
router.get('/audit', authenticateSuperAdmin, getAuditLog);

// ─── Delete tenant ────────────────────────────────────────────────────────────
router.delete('/tenants/:tenantId', authenticateSuperAdmin, [
  param('tenantId').isMongoId(),
  body('reason').optional().isString(),
], deleteTenant);

// ─── Plan toggle (enable/disable) ─────────────────────────────────────────────
router.patch('/pricing/toggle', authenticateSuperAdmin, [
  body('plan').isIn(['1m', '3m', '6m', '12m', 'custom_daily']),
  body('isEnabled').isBoolean(),
], togglePlan);

// ─── Payment records ──────────────────────────────────────────────────────────
router.get('/payments', authenticateSuperAdmin, getPayments);

module.exports = router;