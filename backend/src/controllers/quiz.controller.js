const QuizQuestion = require('../models/QuizQuestion');

// GET /api/tenant/quiz — Tenant Admin: get their questions
const getTenantQuiz = async (req, res) => {
  const tenantId = req.user.tenantId;
  const questions = await QuizQuestion.find({ tenantId })
    .sort({ order: 1 })
    .lean();
  res.json({ success: true, data: questions });
};

// PUT /api/tenant/quiz — Tenant Admin: replace all questions
const saveTenantQuiz = async (req, res) => {
  const tenantId = req.user.tenantId;
  const { questions } = req.body;

  if (!Array.isArray(questions)) {
    return res.status(400).json({ success: false, message: 'questions must be an array' });
  }
  if (questions.length > 5) {
    return res.status(400).json({ success: false, message: 'Maximum 5 questions allowed' });
  }
  if (questions.length > 0 && questions.length < 3) {
    return res.status(400).json({ success: false, message: 'Minimum 3 questions required (or save 0 to clear)' });
  }

  for (const q of questions) {
    if (!q.questionText || typeof q.questionText !== 'string' || !q.questionText.trim()) {
      return res.status(400).json({ success: false, message: 'Each question must have question text' });
    }
    if (!Array.isArray(q.options) || q.options.length < 2 || q.options.length > 4) {
      return res.status(400).json({ success: false, message: 'Each question must have 2–4 options' });
    }
    for (const opt of q.options) {
      if (!opt.text || typeof opt.text !== 'string' || !opt.text.trim()) {
        return res.status(400).json({ success: false, message: 'Each option must have text' });
      }
    }
  }

  // Replace all questions atomically
  await QuizQuestion.deleteMany({ tenantId });

  if (questions.length > 0) {
    const docs = questions.map((q, idx) => ({
      tenantId,
      questionText: q.questionText.trim(),
      order: idx,
      options: q.options.map((opt) => ({
        text: opt.text.trim(),
        categoryIds: Array.isArray(opt.categoryIds) ? opt.categoryIds : [],
      })),
    }));
    await QuizQuestion.insertMany(docs);
  }

  const saved = await QuizQuestion.find({ tenantId }).sort({ order: 1 }).lean();
  res.json({ success: true, data: saved, message: 'Quiz saved successfully' });
};

// DELETE /api/tenant/quiz — Tenant Admin: delete all questions
const deleteTenantQuiz = async (req, res) => {
  const tenantId = req.user.tenantId;
  await QuizQuestion.deleteMany({ tenantId });
  res.json({ success: true, message: 'Quiz cleared' });
};

// GET /api/public/:slug/quiz — Public: get questions if quiz enabled
const getPublicQuiz = async (req, res) => {
  const Tenant = require('../models/Tenant');
  const { slug } = req.params;

  const tenant = await Tenant.findOne({ slug: slug.toLowerCase() });
  if (!tenant || tenant.status === 'inactive') {
    return res.status(404).json({ success: false, message: 'Shop not found' });
  }
  if (tenant.status === 'expired' || tenant.status === 'paused') {
    return res.status(403).json({ success: false, message: 'Shop unavailable' });
  }
  if (!tenant.websiteConfig?.quizEnabled) {
    return res.status(404).json({ success: false, message: 'Quiz not enabled' });
  }

  const questions = await QuizQuestion.find({ tenantId: tenant._id })
    .sort({ order: 1 })
    .lean();

  res.json({ success: true, data: questions });
};

module.exports = { getTenantQuiz, saveTenantQuiz, deleteTenantQuiz, getPublicQuiz };