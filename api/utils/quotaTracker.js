/**
 * @module QuotaTrackerUtility
 * @description
 * Tracks LLM API usage to prevent surprise quota exhaustion.
 *
 * WHY THIS EXISTS:
 * - Gemini free tier: 20 requests/day
 * - No built-in warning when approaching limit
 * - Sudden failures disrupt user experience
 *
 * STRATEGY:
 * - Count every LLM call in MongoDB (no Redis needed)
 * - Warn at 80% usage (16/20 requests)
 * - Gracefully degrade when quota exhausted
 *
 * BENEFITS:
 * - Early warning system
 * - Automatic fallback to cached data
 * - Daily usage analytics
 */

const mongoose = require("mongoose");

/**
 * Schema to track daily quota usage
 * One document per provider per day
 */
const quotaUsageSchema = new mongoose.Schema({
  provider: {
    type: String,
    enum: ["gemini", "openai", "claude"],
    required: true,
  },

  date: {
    type: String, // Format: "YYYY-MM-DD"
    required: true,
  },

  requestCount: {
    type: Number,
    default: 0,
  },

  operations: [
    {
      type: {
        type: String,
        enum: ["question_generation", "analysis"],
      },
      timestamp: Date,
      success: Boolean,
      errorCode: String,
    },
  ],
});

quotaUsageSchema.index({ provider: 1, date: 1 }, { unique: true });

const QuotaUsage =
  mongoose.models.QuotaUsage || mongoose.model("QuotaUsage", quotaUsageSchema);

const QuotaTracker = {
  /**
   * Increment quota count for today
   * Call this BEFORE making LLM request
   *
   * @param {String} provider - 'gemini' | 'openai' | 'claude'
   * @param {String} operation - 'question_generation' | 'analysis'
   * @returns {Promise<Number>} Current count for today
   */
  increment: async (provider = "gemini", operation = "question_generation") => {
    const today = new Date().toISOString().split("T")[0]; // "YYYY-MM-DD"

    // Atomic increment using findOneAndUpdate
    const doc = await QuotaUsage.findOneAndUpdate(
      { provider, date: today },
      {
        $inc: { requestCount: 1 },
        $push: {
          operations: {
            type: operation,
            timestamp: new Date(),
            success: null, // Will be updated later
          },
        },
      },
      { upsert: true, new: true },
    );

    const count = doc.requestCount;
    console.log(
      `[QuotaTracker] ${provider.toUpperCase()}: ${count} requests today`,
    );

    // ⚠️ WARN AT 80% USAGE
    const limit = provider === "gemini" ? 20 : 1000; // Adjust per provider
    const threshold = Math.floor(limit * 0.8);

    if (count >= threshold && count < limit) {
      console.warn(
        `⚠️ [QuotaTracker] ${provider.toUpperCase()} quota at ${Math.round((count / limit) * 100)}% (${count}/${limit})`,
      );
    } else if (count >= limit) {
      console.error(
        `🚨 [QuotaTracker] ${provider.toUpperCase()} quota EXHAUSTED (${count}/${limit})`,
      );
    }

    return count;
  },

  /**
   * Record success/failure of LLM operation
   * Call this AFTER LLM request completes
   *
   * @param {String} provider
   * @param {Boolean} success
   * @param {String} errorCode - Optional error code if failed
   */
  recordResult: async (provider, success, errorCode = null) => {
    const today = new Date().toISOString().split("T")[0];

    await QuotaUsage.updateOne(
      { provider, date: today },
      {
        $set: {
          "operations.$[elem].success": success,
          "operations.$[elem].errorCode": errorCode,
        },
      },
      {
        arrayFilters: [{ "elem.success": null }],
        multi: false,
      },
    );
  },

  /**
   * Check if we can make another request today
   * Returns false if quota exhausted
   *
   * @param {String} provider
   * @returns {Promise<Boolean>}
   */
  canMakeRequest: async (provider = "gemini") => {
    const today = new Date().toISOString().split("T")[0];

    const doc = await QuotaUsage.findOne({ provider, date: today });
    const count = doc ? doc.requestCount : 0;

    const limit = provider === "gemini" ? 20 : 1000;
    const canProceed = count < limit;

    if (!canProceed) {
      console.error(
        `🚫 [QuotaTracker] ${provider.toUpperCase()} quota exhausted (${count}/${limit})`,
      );
    }

    return canProceed;
  },

  /**
   * Get usage statistics for reporting
   *
   * @param {Number} days - How many days to look back
   * @returns {Promise<Array>}
   */
  getUsageStats: async (days = 7) => {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);
    const cutoffStr = cutoffDate.toISOString().split("T")[0];

    const stats = await QuotaUsage.find({
      date: { $gte: cutoffStr },
    }).sort({ date: -1 });

    return stats;
  },
};

module.exports = { QuotaTracker, QuotaUsage };
