const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const {
  checkSlug,
  signup,
  login,
  logout,
  forgotPassword,
  resetPassword,
} = require('../controllers/tenantAuth.controller');
const { authLimiter, signupLimiter, forgotPasswordLimiter } = require('../middleware/rateLimiter');

const RESERVED_SLUGS = ['www', 'api', 'admin', 'app', 'mail', 'static', 'assets', 'superadmin', 's'];
const VALID_BUSINESS_TYPES = ['nail_art', 'mehendi', 'jewellery', 'cake_shop', 'generic'];
const VALID_PLANS = ['trial', '1m', '3m', '6m', '12m'];

// GET /api/tenantauth/check-slug?slug=xxx — public, no rate limit (debounced on frontend)
router.get('/check-slug', checkSlug);

// POST /api/tenantauth/signup
router.post(
  '/signup',
  signupLimiter,
  [
    body('businessName').trim().isLength({ min: 2, max: 100 }).withMessage('Business name must be 2–100 characters'),
    body('slug')
      .trim()
      .toLowerCase()
      .isLength({ min: 3, max: 30 }).withMessage('Shop URL must be 3–30 characters')
      .matches(/^[a-z0-9-]+$/).withMessage('Shop URL can only contain lowercase letters, numbers, and hyphens')
      .custom((val) => {
        if (RESERVED_SLUGS.includes(val)) throw new Error('This shop URL is reserved');
        return true;
      }),
    body('businessType').isIn(VALID_BUSINESS_TYPES).withMessage('Invalid business type'),
    body('ownerName').trim().isLength({ min: 2, max: 60 }).withMessage('Owner name must be 2–60 characters'),
    body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
    body('mobile').matches(/^\d{10,15}$/).withMessage('Mobile must be 10–15 digits'),
    body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
    body('plan').isIn(VALID_PLANS).withMessage('Invalid plan selected'),
  ],
  signup
);

// POST /api/tenantauth/login
router.post(
  '/login',
  authLimiter,
  [
    body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
    body('password').notEmpty().withMessage('Password is required'),
  ],
  login
);

// POST /api/tenantauth/logout
router.post('/logout', logout);

// POST /api/tenantauth/forgot-password
router.post(
  '/forgot-password',
  forgotPasswordLimiter,
  [
    body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  ],
  forgotPassword
);

// POST /api/tenantauth/reset-password
router.post(
  '/reset-password',
  [
    body('token').notEmpty().withMessage('Reset token is required'),
    body('id').notEmpty().withMessage('ID is required'),
    body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
  ],
  resetPassword
);

module.exports = router;