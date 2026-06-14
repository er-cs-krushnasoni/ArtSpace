// backend/src/models/FAQ.js
const mongoose = require('mongoose');

const faqSchema = new mongoose.Schema(
  {
    tenantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Tenant',
      required: true,
      index: true,
    },
    question: {
      type: String,
      required: [true, 'Question is required'],
      trim: true,
      maxlength: [300, 'Question cannot exceed 300 characters'],
    },
    answer: {
      type: String,
      required: [true, 'Answer is required'],
      trim: true,
      maxlength: [2000, 'Answer cannot exceed 2000 characters'],
    },
    order: {
      type: Number,
      default: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

const FAQ = mongoose.model('FAQ', faqSchema);
module.exports = FAQ;