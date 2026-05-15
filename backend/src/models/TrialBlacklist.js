const mongoose = require('mongoose');

/**
 * TrialBlacklist — permanently stores mobile numbers that have used a free trial.
 *
 * CRITICAL RULES:
 * - Never deleted, even after a trial tenant's data is fully purged
 * - Checked on every trial signup attempt
 * - A blacklisted mobile can still purchase paid subscriptions — only trial is blocked
 */
const trialBlacklistSchema = new mongoose.Schema(
  {
    mobile: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      index: true,
    },
    // For audit — when this mobile's trial was originally created
    usedAt: {
      type: Date,
      default: Date.now,
      immutable: true,
    },
  },
  {
    timestamps: false,
  }
);

const TrialBlacklist = mongoose.model('TrialBlacklist', trialBlacklistSchema);
module.exports = TrialBlacklist;