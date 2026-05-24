const express = require('express');
const router = express.Router();
const { authenticateTenantAdmin } = require('../middleware/auth');
const requireActiveSubscription   = require('../middleware/requireActiveSubscription');
const {
  listPosts,
  getSinglePost,
  createPost, createPostValidation,
  updatePost, updatePostValidation,
  deletePost,
} = require('../controllers/blog.controller');

// All blog routes require active subscription
router.use(authenticateTenantAdmin, requireActiveSubscription);

router.get('/',           listPosts);
router.get('/:postId', getSinglePost);
router.post('/',          createPostValidation, createPost);
router.put('/:postId',    updatePostValidation, updatePost);
router.delete('/:postId', deletePost);

module.exports = router;