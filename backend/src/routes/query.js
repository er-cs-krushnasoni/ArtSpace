const express = require('express');
const rateLimit = require('express-rate-limit');
const {
  createPublicQuery,
  updatePublicQuery,
  getPublicUploadSignature,
  createAdminQuery,
  updateAdminQuery,
  createQueryValidation,
} = require('../controllers/query.controller');
const { authenticateTenantAdmin } = require('../middleware/auth');
const requireActiveSubscription = require('../middleware/requireActiveSubscription');

// ─── Rate limiters ────────────────────────────────────────────────────────────
const publicQueryLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many requests. Please slow down.' },
});

const uploadSignatureLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many upload requests. Please slow down.' },
});

// ─── Public routes ────────────────────────────────────────────────────────────
const publicRouter = express.Router({ mergeParams: true });

publicRouter.post(
  '/:slug/queries',
  publicQueryLimiter,
  ...createQueryValidation,   // ← spread the array
  createPublicQuery
);

publicRouter.post(
  '/:slug/queries/:queryId/update',
  publicQueryLimiter,
  updatePublicQuery
);

publicRouter.post(
  '/:slug/upload-signature',
  uploadSignatureLimiter,
  getPublicUploadSignature
);

// ─── Tenant Admin routes ──────────────────────────────────────────────────────
const tenantRouter = express.Router();

tenantRouter.post(
  '/',
  authenticateTenantAdmin,
  requireActiveSubscription,
  ...createQueryValidation,   // ← spread the array
  createAdminQuery
);

tenantRouter.post(
  '/:queryId/update',
  authenticateTenantAdmin,
  requireActiveSubscription,
  updateAdminQuery
);

module.exports = { publicRouter, tenantRouter };