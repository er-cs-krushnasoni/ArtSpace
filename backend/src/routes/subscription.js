const express = require('express');
const { body } = require('express-validator');
const router = express.Router();
const {
  getPricing,
  createOrder,
  verifyPayment,
  getSubscriptionStatus,
} = require('../controllers/subscription.controller');
const { authenticateTenantAdmin, authenticateToken } = require('../middleware/auth');
const Tenant = require('../models/Tenant');

// Middleware: allows expired tenants (they need to pay to get back in)
const authenticateTenantForPayment = async (req, res, next) => {
  authenticateToken(req, res, async () => {
    if (req.user.role !== 'tenant_admin') {
      return res.status(403).json({ success: false, message: 'Tenant admin access required.' });
    }
    try {
      const tenant = await Tenant.findById(req.user.tenantId);
      if (!tenant) {
        return res.status(404).json({ success: false, message: 'Tenant not found.' });
      }
      if (tenant.status === 'inactive') {
        return res.status(403).json({
          success: false,
          message: 'Account deactivated. Contact support.',
          code: 'ACCOUNT_INACTIVE',
        });
      }
      if (tenant.status === 'pending_manual') {
        return res.status(403).json({
          success: false,
          message: 'Account pending activation.',
          code: 'PENDING_MANUAL',
        });
      }
      if (tenant.status === 'paused') {
        return res.status(403).json({
          success: false,
          message: 'Account is paused. Contact support.',
          code: 'ACCOUNT_PAUSED',
        });
      }
      // active OR expired — both allowed to pay
      req.tenant = tenant;
      next();
    } catch (error) {
      next(error);
    }
  });
};

// GET /api/subscription/status — active + expired tenants allowed (expired need to see their status)
router.get('/status', authenticateTenantForPayment, getSubscriptionStatus);

// GET /api/subscription/pricing — no auth needed
router.get('/pricing', getPricing);

// POST /api/subscription/create-order — active + expired tenants allowed
router.post(
  '/create-order',
  authenticateTenantForPayment,
  [
    body('plan')
      .isIn(['1m', '3m', '6m', '12m', 'custom'])
      .withMessage('Plan must be one of: 1m, 3m, 6m, 12m, custom'),
    body('customDays')
      .if(body('plan').equals('custom'))
      .isInt({ min: 1 })
      .withMessage('Custom plan requires at least 1 day'),
  ],
  createOrder
);

// POST /api/subscription/verify-payment — active + expired tenants allowed
router.post(
  '/verify-payment',
  authenticateTenantForPayment,
  [
    body('razorpay_order_id').notEmpty().withMessage('Order ID required'),
    body('razorpay_payment_id').notEmpty().withMessage('Payment ID required'),
    body('razorpay_signature').notEmpty().withMessage('Signature required'),
    body('plan')
      .isIn(['1m', '3m', '6m', '12m', 'custom'])
      .withMessage('Invalid plan'),
    body('customDays')
      .if(body('plan').equals('custom'))
      .isInt({ min: 1 })
      .withMessage('Custom plan requires at least 1 day'),
  ],
  verifyPayment
);

module.exports = router;