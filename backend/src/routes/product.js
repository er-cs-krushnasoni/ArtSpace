const express = require('express');
const router = express.Router();
const { authenticateTenantAdmin } = require('../middleware/auth');
const requireActiveSubscription = require('../middleware/requireActiveSubscription');
const requireTrialProductLimit = require('../middleware/requireTrialProductLimit');
const { getProducts, createProduct, updateProduct, deleteProduct, applyDiscount, removeDiscount } = require('../controllers/product.controller');

router.use(authenticateTenantAdmin, requireActiveSubscription);

router.get('/', getProducts);
router.post('/', requireTrialProductLimit, createProduct);
router.put('/:productId', updateProduct);
router.delete('/:productId', deleteProduct);
router.post('/:productId/discount', applyDiscount);
router.delete('/:productId/discount', removeDiscount);

module.exports = router;