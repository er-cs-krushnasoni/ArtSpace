const express = require('express');
const router  = express.Router();
const { authenticateTenantAdmin }  = require('../middleware/auth');
const requireActiveSubscription    = require('../middleware/requireActiveSubscription');
const { getAnalytics }             = require('../controllers/analytics.controller');

router.use(authenticateTenantAdmin, requireActiveSubscription);
router.get('/', getAnalytics);

module.exports = router;