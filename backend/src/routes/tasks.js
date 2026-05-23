const express = require('express');
const router  = express.Router();
const { authenticateTenantAdmin }   = require('../middleware/auth');
const requireActiveSubscription     = require('../middleware/requireActiveSubscription');
const {
  getTasks,
  updateTaskStatus,
  updateFinalPrice,
  addPaymentEntry,
  updatePaymentEntry,
  deletePaymentEntry,
  updateAdminNotes,
  rescheduleTask,
  deleteTask,
} = require('../controllers/task.controller');

router.use(authenticateTenantAdmin, requireActiveSubscription);

router.get   ('/',                                        getTasks);
router.patch ('/:taskId/status',                          updateTaskStatus);
router.patch ('/:taskId/final-price',                     updateFinalPrice);
router.post  ('/:taskId/payment-entries',                 addPaymentEntry);
router.patch ('/:taskId/payment-entries/:entryId',        updatePaymentEntry);
router.delete('/:taskId/payment-entries/:entryId',        deletePaymentEntry);
router.patch ('/:taskId/notes',                           updateAdminNotes);
router.patch ('/:taskId/reschedule',                      rescheduleTask);
router.delete('/:taskId',                                 deleteTask);

module.exports = router;