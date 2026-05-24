const express = require('express');
const router = express.Router();
const { getTenantQuiz, saveTenantQuiz, deleteTenantQuiz } = require('../controllers/quiz.controller');
const { authenticateTenantAdmin } = require('../middleware/auth');
const requireActiveSubscription = require('../middleware/requireActiveSubscription');

router.use(authenticateTenantAdmin);
router.use(requireActiveSubscription);

router.get('/',    getTenantQuiz);
router.put('/',    saveTenantQuiz);
router.delete('/', deleteTenantQuiz);

module.exports = router;