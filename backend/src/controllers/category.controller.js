const Category = require('../models/Category');
const Product = require('../models/Product');

// ─── GET /api/tenant/categories ──────────────────────────────────────────────
const getCategories = async (req, res) => {
  const categories = await Category.find({ tenantId: req.user.tenantId })
    .sort({ createdAt: 1 })
    .lean();
  res.json({ success: true, data: categories });
};

// ─── POST /api/tenant/categories ─────────────────────────────────────────────
const createCategory = async (req, res) => {
  const { groupName, values } = req.body;
  if (!groupName || !groupName.trim()) {
    return res.status(400).json({ success: false, message: 'Group name is required' });
  }
  const trimmed = groupName.trim();
  // Case-insensitive uniqueness check per tenant
  const existing = await Category.findOne({
    tenantId: req.user.tenantId,
    groupName: { $regex: `^${trimmed}$`, $options: 'i' },
  }).lean();
  if (existing) {
    return res.status(400).json({ success: false, message: 'A category with this name already exists' });
  }
  const cleanValues = Array.isArray(values)
    ? values.map((v) => v.trim()).filter(Boolean)
    : [];
  const category = await Category.create({
    tenantId: req.user.tenantId,
    groupName: trimmed,
    values: cleanValues,
  });
  res.status(201).json({ success: true, message: 'Category created', data: category });
};

// ─── PUT /api/tenant/categories/:categoryId ───────────────────────────────────
const updateCategory = async (req, res) => {
  const { categoryId } = req.params;
  const { groupName, values } = req.body;
  const category = await Category.findOne({ _id: categoryId, tenantId: req.user.tenantId });
  if (!category) {
    return res.status(404).json({ success: false, message: 'Category not found' });
  }
  if (groupName !== undefined) {
    const trimmed = groupName.trim();
    if (!trimmed) {
      return res.status(400).json({ success: false, message: 'Group name cannot be empty' });
    }
    // Uniqueness check excluding self
    const existing = await Category.findOne({
      tenantId: req.user.tenantId,
      groupName: { $regex: `^${trimmed}$`, $options: 'i' },
      _id: { $ne: categoryId },
    }).lean();
    if (existing) {
      return res.status(400).json({ success: false, message: 'A category with this name already exists' });
    }
    category.groupName = trimmed;
  }
  if (values !== undefined) {
    category.values = Array.isArray(values)
      ? values.map((v) => v.trim()).filter(Boolean)
      : [];
  }
  await category.save();
  res.json({ success: true, message: 'Category updated', data: category });
};

// ─── DELETE /api/tenant/categories/:categoryId ────────────────────────────────
const deleteCategory = async (req, res) => {
  const { categoryId } = req.params;
  const category = await Category.findOne({ _id: categoryId, tenantId: req.user.tenantId });
  if (!category) {
    return res.status(404).json({ success: false, message: 'Category not found' });
  }

  // Remove from products
  await Product.updateMany(
    { tenantId: req.user.tenantId },
    { $pull: { categories: { categoryId: category._id } } }
  );

  // Remove orphaned categoryLinks from quiz questions
  const QuizQuestion = require('../models/QuizQuestion');
  const questions = await QuizQuestion.find({ tenantId: req.user.tenantId });
  for (const q of questions) {
    let modified = false;
    q.options = q.options.map((opt) => {
      const before = opt.categoryLinks?.length || 0;
      opt.categoryLinks = (opt.categoryLinks || []).filter(
        (cl) => String(cl.categoryId) !== String(category._id)
      );
      opt.categoryIds = (opt.categoryIds || []).filter(
        (cid) => String(cid) !== String(category._id)
      );
      if (opt.categoryLinks.length !== before) modified = true;
      return opt;
    });
    if (modified) await q.save();
  }

  await category.deleteOne();
  res.json({ success: true, message: 'Category deleted' });
};

module.exports = { getCategories, createCategory, updateCategory, deleteCategory };