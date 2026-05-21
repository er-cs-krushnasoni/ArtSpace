const express = require('express');
const router = express.Router();
const { authenticateTenantAdmin } = require('../middleware/auth');
const requireActiveSubscription = require('../middleware/requireActiveSubscription');
const {
  getInbox,
  markAsSeen,
  markAsReplyLater,
  deleteQuery,
  confirmOrder,
} = require('../controllers/inbox.controller');

// All inbox routes require auth + active subscription
router.use(authenticateTenantAdmin, requireActiveSubscription);

router.get('/', getInbox);
router.patch('/:queryId/seen', markAsSeen);
router.patch('/:queryId/reply-later', markAsReplyLater);
router.delete('/:queryId', deleteQuery);
router.post('/:queryId/confirm', confirmOrder);

module.exports = router;