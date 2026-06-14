// backend/src/controllers/faq.controller.js
const FAQ = require('../models/FAQ');

const MAX_FAQS = 20;

// ─── GET /api/tenant/faq  (admin — all FAQs including inactive) ───────────────
const getFAQs = async (req, res) => {
  const faqs = await FAQ.find({ tenantId: req.user.tenantId })
    .sort({ order: 1, createdAt: 1 })
    .lean();
  res.json({ success: true, data: faqs });
};

// ─── POST /api/tenant/faq ────────────────────────────────────────────────────
const createFAQ = async (req, res) => {
  const count = await FAQ.countDocuments({ tenantId: req.user.tenantId });
  if (count >= MAX_FAQS) {
    return res.status(400).json({
      success: false,
      message: `Maximum ${MAX_FAQS} FAQs allowed`,
    });
  }

  const { question, answer } = req.body;
  if (!question?.trim()) {
    return res.status(400).json({ success: false, message: 'Question is required' });
  }
  if (!answer?.trim()) {
    return res.status(400).json({ success: false, message: 'Answer is required' });
  }

  const faq = await FAQ.create({
    tenantId: req.user.tenantId,
    question: question.trim(),
    answer: answer.trim(),
    order: count, // append at end
    isActive: true,
  });

  res.status(201).json({ success: true, message: 'FAQ created', data: faq });
};

// ─── PUT /api/tenant/faq/:faqId ──────────────────────────────────────────────
const updateFAQ = async (req, res) => {
  const { faqId } = req.params;
  const { question, answer, isActive } = req.body;

  const faq = await FAQ.findOne({ _id: faqId, tenantId: req.user.tenantId });
  if (!faq) return res.status(404).json({ success: false, message: 'FAQ not found' });

  if (question !== undefined) {
    if (!question.trim()) {
      return res.status(400).json({ success: false, message: 'Question cannot be empty' });
    }
    faq.question = question.trim();
  }
  if (answer !== undefined) {
    if (!answer.trim()) {
      return res.status(400).json({ success: false, message: 'Answer cannot be empty' });
    }
    faq.answer = answer.trim();
  }
  if (typeof isActive === 'boolean') faq.isActive = isActive;

  await faq.save();
  res.json({ success: true, message: 'FAQ updated', data: faq });
};

// ─── DELETE /api/tenant/faq/:faqId ───────────────────────────────────────────
const deleteFAQ = async (req, res) => {
  const { faqId } = req.params;
  const faq = await FAQ.findOne({ _id: faqId, tenantId: req.user.tenantId });
  if (!faq) return res.status(404).json({ success: false, message: 'FAQ not found' });

  await FAQ.findByIdAndDelete(faqId);
  res.json({ success: true, message: 'FAQ deleted' });
};

// ─── PUT /api/tenant/faq/reorder ─────────────────────────────────────────────
const reorderFAQs = async (req, res) => {
  const { orderedIds } = req.body;
  if (!Array.isArray(orderedIds) || orderedIds.length === 0) {
    return res.status(400).json({ success: false, message: 'orderedIds array is required' });
  }

  const faqs = await FAQ.find({
    tenantId: req.user.tenantId,
    _id: { $in: orderedIds },
  }).lean();

  if (faqs.length !== orderedIds.length) {
    return res.status(400).json({ success: false, message: 'Invalid FAQ IDs' });
  }

  await Promise.all(
    orderedIds.map((id, index) => FAQ.findByIdAndUpdate(id, { $set: { order: index } }))
  );

  res.json({ success: true, message: 'FAQs reordered' });
};

// ─── GET /api/public/:slug/faq  (public — active FAQs only) ──────────────────
const getPublicFAQs = async (req, res) => {
  const { tenant } = req;
  if (!tenant) return res.status(404).json({ success: false, message: 'Shop not found' });

  // Respect the faqEnabled toggle
  if (!tenant.websiteConfig?.faqEnabled) {
    return res.json({ success: true, data: [] });
  }

  const faqs = await FAQ.find({ tenantId: tenant._id, isActive: true })
    .sort({ order: 1, createdAt: 1 })
    .select('question answer')
    .lean();

  res.json({ success: true, data: faqs });
};

module.exports = { getFAQs, createFAQ, updateFAQ, deleteFAQ, reorderFAQs, getPublicFAQs };