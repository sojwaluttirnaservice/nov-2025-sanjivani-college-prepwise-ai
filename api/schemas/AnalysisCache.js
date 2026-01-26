/**
 * @module AnalysisCacheSchema
 * @description
 * Caches AI-generated performance analysis to avoid redundant LLM calls.
 *
 * WHY THIS EXISTS:
 * - Analysis generation costs quota
 * - Same score + same weak topics = virtually identical analysis
 * - Students with similar performance get similar feedback
 *
 * IMPACT:
 * - Reduces analysis LLM calls by 20-30%
 * - Instant feedback for common score patterns
 *
 * CACHE KEY STRATEGY:
 * - Key = `score_weakTopics` (e.g., "7_Data Structures,Algorithms")
 * - TTL = 7 days (analysis quality doesn't degrade quickly)
 * - Per unit (different units = different advice)
 */

const mongoose = require("mongoose");

const analysisCacheSchema = new mongoose.Schema(
  {
    /**
     * Reference to the unit this analysis belongs to
     * Different units need different feedback even for same score
     */
    unitId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Unit",
      required: true,
      index: true,
    },

    /**
     * Cache key derived from performance signature
     * Format: "{score}_{sortedWeakTopics}"
     * Example: "7_Algorithms,Data Structures"
     *
     * WHY SORTED: "A,B" and "B,A" should match same cache entry
     */
    cacheKey: {
      type: String,
      required: true,
      index: true,
    },

    /**
     * The actual AI-generated analysis text
     * This is what we serve to avoid regeneration
     */
    analysisText: {
      type: String,
      required: true,
    },

    /**
     * Metadata for monitoring and debugging
     */
    hitCount: {
      type: Number,
      default: 0,
      description: "How many times this cache entry has been served",
    },

    /**
     * Auto-delete after 7 days
     * Analysis advice doesn't change much, but curriculum might evolve
     */
    expiresAt: {
      type: Date,
      default: () => new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      index: true,
    },
  },
  {
    timestamps: true, // Track creation/update times
  },
);

// Compound index for fast lookups
analysisCacheSchema.index({ unitId: 1, cacheKey: 1 }, { unique: true });

// TTL index to auto-delete expired entries
analysisCacheSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

const AnalysisCache =
  mongoose.models.AnalysisCache ||
  mongoose.model("AnalysisCache", analysisCacheSchema);

module.exports = { AnalysisCache };
