const express = require('express');
const router = express.Router({ mergeParams: true });
const { getPublicConfig, getPublicProducts, getPublicSliders, getTenantPWAManifest } = require('../controllers/publicShop.controller');
const rateLimit = require('express-rate-limit');

const publicLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many requests. Please slow down.' },
});

router.use(publicLimiter);

router.get('/:slug/config', getPublicConfig);
router.get('/:slug/products', getPublicProducts);
router.get('/:slug/sliders', getPublicSliders);
router.get('/:slug/pwa-manifest.json', getTenantPWAManifest);

module.exports = router;