const BlogPost = require('../models/BlogPost');
const { body, param, validationResult } = require('express-validator');

// ── Helpers ────────────────────────────────────────────────────────────────

const generateSlug = (title) =>
  title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 80);

const handleValidationErrors = (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ success: false, message: errors.array()[0].msg });
    return true;
  }
  return false;
};

// ── Tenant Admin — CRUD ────────────────────────────────────────────────────

/**
 * GET /api/tenant/blog
 * Returns all posts (drafts + published) for the authenticated tenant.
 */
const listPosts = async (req, res) => {
  const tenantId = req.user.tenantId;
  const posts = await BlogPost.find({ tenantId })
    .sort({ createdAt: -1 })
    .select('title isPublished publishDate seo.slug createdAt updatedAt')
    .lean();
  res.json({ success: true, data: posts });
};

/**
 * POST /api/tenant/blog
 * Create a new blog post.
 */
const createPostValidation = [
  body('title').trim().notEmpty().withMessage('Title is required'),
  body('content').notEmpty().withMessage('Content is required'),
  body('isPublished').optional().isBoolean(),
  body('publishDate').optional().isISO8601().withMessage('Invalid publish date'),
  body('seo.metaTitle').optional().trim(),
  body('seo.metaDescription').optional().trim(),
  body('seo.slug').optional().trim(),
];

const createPost = async (req, res) => {
  if (handleValidationErrors(req, res)) return;
  const tenantId = req.user.tenantId;
  const { title, content, isPublished, publishDate, seo = {} } = req.body;

  // Generate slug from title if not provided
  let slug = seo.slug ? seo.slug.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') : generateSlug(title);

  // Enforce uniqueness per tenant
  const existing = await BlogPost.findOne({ tenantId, 'seo.slug': slug });
  if (existing) {
    // Append timestamp to make unique
    slug = `${slug}-${Date.now()}`;
  }

  const post = await BlogPost.create({
    tenantId,
    title,
    content,
    isPublished: isPublished ?? false,
    publishDate: publishDate ? new Date(publishDate) : new Date(),
    seo: {
      metaTitle: seo.metaTitle || title,
      metaDescription: seo.metaDescription || '',
      slug,
    },
  });

  res.status(201).json({ success: true, data: post });
};

/**
 * PUT /api/tenant/blog/:postId
 * Update an existing post.
 */
const updatePostValidation = [
  param('postId').isMongoId().withMessage('Invalid post ID'),
  body('title').optional().trim().notEmpty().withMessage('Title cannot be empty'),
  body('content').optional().notEmpty().withMessage('Content cannot be empty'),
  body('isPublished').optional().isBoolean(),
  body('publishDate').optional().isISO8601().withMessage('Invalid publish date'),
  body('seo.slug').optional().trim(),
];

const updatePost = async (req, res) => {
  if (handleValidationErrors(req, res)) return;
  const tenantId = req.user.tenantId;
  const { postId } = req.params;

  const post = await BlogPost.findOne({ _id: postId, tenantId });
  if (!post) return res.status(404).json({ success: false, message: 'Post not found' });

  const { title, content, isPublished, publishDate, seo = {} } = req.body;

  // Handle slug change — check uniqueness if slug is being updated
  if (seo.slug && seo.slug !== post.seo.slug) {
    const newSlug = seo.slug.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    const conflict = await BlogPost.findOne({ tenantId, 'seo.slug': newSlug, _id: { $ne: postId } });
    if (conflict) {
      return res.status(409).json({ success: false, message: 'This URL slug is already in use. Please choose a different one.' });
    }
    post.seo.slug = newSlug;
  }

  if (title !== undefined) post.title = title;
  if (content !== undefined) post.content = content;
  if (isPublished !== undefined) post.isPublished = isPublished;
  if (publishDate !== undefined) post.publishDate = new Date(publishDate);
  if (seo.metaTitle !== undefined) post.seo.metaTitle = seo.metaTitle;
  if (seo.metaDescription !== undefined) post.seo.metaDescription = seo.metaDescription;

  await post.save();
  res.json({ success: true, data: post });
};

/**
 * DELETE /api/tenant/blog/:postId
 */
const deletePost = async (req, res) => {
  if (handleValidationErrors(req, res)) return;
  const tenantId = req.user.tenantId;
  const { postId } = req.params;

  const post = await BlogPost.findOneAndDelete({ _id: postId, tenantId });
  if (!post) return res.status(404).json({ success: false, message: 'Post not found' });

  res.json({ success: true, message: 'Post deleted' });
};

// ── Public ────────────────────────────────────────────────────────────────────

/**
 * GET /api/public/:slug/blog
 * Returns published posts only (if blogEnabled).
 */
const getPublicBlogList = async (req, res) => {
  const Tenant = require('../models/Tenant');
  const { slug } = req.params;

  const tenant = await Tenant.findOne({ slug: slug.toLowerCase() });
  if (!tenant || tenant.status === 'inactive') {
    return res.status(404).json({ success: false, message: 'Shop not found' });
  }
  if (!tenant.websiteConfig?.blogEnabled) {
    return res.json({ success: true, data: [] });
  }

  const posts = await BlogPost.find({ tenantId: tenant._id, isPublished: true })
    .sort({ publishDate: -1 })
    .select('title publishDate seo content')
    .lean();

  // Generate excerpt — first 150 chars of plain text (strip HTML/JSON artifacts)
  const withExcerpt = posts.map((p) => {
    let plain = '';
    try {
      // content is stored as Tiptap JSON string
      const parsed = JSON.parse(p.content);
      plain = extractPlainText(parsed);
    } catch {
      // fallback — strip HTML tags if content is plain text/HTML
      plain = p.content.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
    }
    return {
      _id: p._id,
      title: p.title,
      publishDate: p.publishDate,
      excerpt: plain.slice(0, 150),
      slug: p.seo?.slug,
    };
  });

  res.json({ success: true, data: withExcerpt });
};

/**
 * GET /api/public/:slug/blog/:postSlug
 */
const getPublicBlogPost = async (req, res) => {
  const Tenant = require('../models/Tenant');
  const { slug, postSlug } = req.params;

  const tenant = await Tenant.findOne({ slug: slug.toLowerCase() });
  if (!tenant || tenant.status === 'inactive') {
    return res.status(404).json({ success: false, message: 'Shop not found' });
  }
  if (!tenant.websiteConfig?.blogEnabled) {
    return res.status(404).json({ success: false, message: 'Blog not available' });
  }

  const post = await BlogPost.findOne({
    tenantId: tenant._id,
    'seo.slug': postSlug,
    isPublished: true,
  }).lean();

  if (!post) return res.status(404).json({ success: false, message: 'Post not found' });

  res.json({ success: true, data: post });
};

// ── Plain text extractor for Tiptap JSON ─────────────────────────────────────
function extractPlainText(node) {
  if (!node) return '';
  if (node.type === 'text') return node.text || '';
  if (Array.isArray(node.content)) {
    return node.content.map(extractPlainText).join(' ');
  }
  return '';
}

const getSinglePost = async (req, res) => {
  const tenantId = req.user.tenantId;
  const { postId } = req.params;
  const post = await BlogPost.findOne({ _id: postId, tenantId }).lean();
  if (!post) return res.status(404).json({ success: false, message: 'Post not found' });
  res.json({ success: true, data: post });
};

module.exports = {
  listPosts,
  createPost,
  createPostValidation,
  updatePost,
  updatePostValidation,
  deletePost,
  getPublicBlogList,
  getPublicBlogPost,
  getSinglePost
};