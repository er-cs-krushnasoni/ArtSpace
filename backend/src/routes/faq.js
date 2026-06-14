// backend/src/routes/faq.js
const express = require('express');
const router  = express.Router();
const { authenticate } = require('../middleware/auth');
const { requireActiveSubscription } = require('../middleware/requireActiveSubscription');
const {
  getFAQs,
  createFAQ,
  updateFAQ,
  deleteFAQ,
  reorderFAQs,
} = require('../controllers/faq.controller');

// All routes require auth + active subscription
router.use(authenticate, requireActiveSubscription);

router.get('/',                 getFAQs);
router.post('/',                createFAQ);
router.put('/reorder',          reorderFAQs);   // must be before /:faqId
router.put('/:faqId',           updateFAQ);
router.delete('/:faqId',        deleteFAQ);

module.exports = router;