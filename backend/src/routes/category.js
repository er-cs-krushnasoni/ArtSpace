const express = require('express');
const router = express.Router();
const { authenticateTenantAdmin } = require('../middleware/auth');
const requireActiveSubscription = require('../middleware/requireActiveSubscription');
const { getCategories, createCategory, updateCategory, deleteCategory } = require('../controllers/category.controller');

router.use(authenticateTenantAdmin, requireActiveSubscription);

router.get('/', getCategories);
router.post('/', createCategory);
router.put('/:categoryId', updateCategory);
router.delete('/:categoryId', deleteCategory);

module.exports = router;