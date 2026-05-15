const express = require('express');
const { body } = require('express-validator');
const router = express.Router();

const { login, logout, getMe, getStats } = require('../controllers/superAdminAuth.controller');
const { authenticateSuperAdmin } = require('../middleware/auth');
const { authLimiter } = require('../middleware/rateLimiter');

// POST /api/superadmin/auth/login — rate limited
router.post(
  '/auth/login',
  authLimiter,
  [
    body('email')
      .trim()
      .notEmpty().withMessage('Email is required')
      .isEmail().withMessage('Valid email is required'),
    body('password')
      .notEmpty().withMessage('Password is required')
      .isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  ],
  login
);

// POST /api/superadmin/auth/logout — public (cookie cleared regardless)
router.post('/auth/logout', logout);

// GET /api/superadmin/auth/me — protected
router.get('/auth/me', authenticateSuperAdmin, getMe);

// GET /api/superadmin/stats — protected
router.get('/stats', authenticateSuperAdmin, getStats);

module.exports = router;