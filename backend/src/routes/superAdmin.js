const express = require('express');
const { body, param } = require('express-validator');
const router = express.Router();

const { login, logout, getMe, getStats } = require('../controllers/superAdminAuth.controller');
const {
  getPricing,
  updatePricing,
  pauseTenant,
  unpauseTenant,
} = require('../controllers/subscription.controller');
const { authenticateSuperAdmin } = require('../middleware/auth');
const { authLimiter } = require('../middleware/rateLimiter');

// POST /api/superadmin/auth/login
router.post(
  '/auth/login',
  authLimiter,
  [
    body('email').trim().notEmpty().withMessage('Email is required').isEmail().withMessage('Valid email is required'),
    body('password').notEmpty().withMessage('Password is required').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  ],
  login
);

// POST /api/superadmin/auth/logout
router.post('/auth/logout', logout);

// GET /api/superadmin/auth/me
router.get('/auth/me', authenticateSuperAdmin, getMe);

// GET /api/superadmin/stats
router.get('/stats', authenticateSuperAdmin, getStats);

// GET /api/superadmin/pricing
router.get('/pricing', authenticateSuperAdmin, getPricing);

// PUT /api/superadmin/pricing
router.put(
  '/pricing',
  authenticateSuperAdmin,
  [
    body('plan').isIn(['1m', '3m', '6m', '12m', 'custom_daily']).withMessage('Invalid plan'),
    body('price').isInt({ min: 0 }).withMessage('Price must be a non-negative integer'),
  ],
  updatePricing
);

// POST /api/superadmin/tenants/:tenantId/pause
router.post(
  '/tenants/:tenantId/pause',
  authenticateSuperAdmin,
  [param('tenantId').isMongoId().withMessage('Invalid tenant ID')],
  pauseTenant
);

// POST /api/superadmin/tenants/:tenantId/unpause
router.post(
  '/tenants/:tenantId/unpause',
  authenticateSuperAdmin,
  [param('tenantId').isMongoId().withMessage('Invalid tenant ID')],
  unpauseTenant
);

module.exports = router;