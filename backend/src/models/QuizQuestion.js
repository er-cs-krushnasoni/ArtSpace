const mongoose = require('mongoose');

const quizQuestionSchema = new mongoose.Schema(
  {
    tenantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Tenant',
      required: true,
      index: true,
    },
    questionText: { type: String, required: [true, 'Question text is required'] },
    order: { type: Number, default: 0 },
    options: [
  {
    text: { type: String, required: true },
    // legacy flat category mapping (kept for backwards compat)
    categoryIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Category' }],
    // new: per-value mapping
    categoryLinks: [
      {
        categoryId: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
        values: [{ type: String, trim: true }],
      },
    ],
  },
],
  },
  { timestamps: true }
);

quizQuestionSchema.index({ tenantId: 1, order: 1 });

const QuizQuestion = mongoose.model('QuizQuestion', quizQuestionSchema);
module.exports = QuizQuestion;
