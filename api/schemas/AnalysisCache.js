/**
 * @module AnalysisCacheSchema
 * @description
 * Caches AI-generated performance analysis to avoid redundant LLM calls.
 *
 * CACHE ISOLATION STRATEGY:
 * - Each attempt gets its own isolated cache entries
 * - Each analysis version (1, 2) is cached independently
 * - Cache is APPEND-ONLY (no overwrites)
 * - Cache key: analysis:{attemptId}:v{version}
 *
 * WHY VERSION-SPECIFIC:
 * - Version 1 cache must not be destroyed when Version 2 is generated
 * - Students can view historical analysis versions
 * - Re-analysis can hit cache if already generated
 *
 * TTL: 30 days (immutable entries, long-lived)
 */

const mongoose = require("mongoose");

const analysisCacheSchema = new mongoose.Schema(
  {
    /**
     * The specific quiz attempt this analysis belongs to
     * CRITICAL: Ensures cache isolation per student
     */
    attemptId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "QuizAttempt",
      required: true,
      index: true,
    },

    /**
     * Analysis version number (1 = initial, 2 = re-analysis)
     * CRITICAL: Enables immutable, append-only cache
     */
    analysisVersion: {
      type: Number,
      required: true,
      min: 1,
      max: 2, // Based on current limit
    },

    /**
     * Unit reference for filtering/cleanup
     * (Not part of cache key, but useful for queries)
     */
    unitId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Unit",
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
     * When this cache entry was created
     * (Replaces hitCount - cache is now immutable)
     */
    generatedAt: {
      type: Date,
      default: Date.now,
    },

    /**
     * Auto-delete after 30 days
     * Longer TTL because cache is versioned and immutable
     */
    expiresAt: {
      type: Date,
      default: () => new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      index: true,
    },
  },
  {
    timestamps: true,
  },
);

// CRITICAL: Unique index ensures one cache entry per (attempt, version) pair
analysisCacheSchema.index(
  { attemptId: 1, analysisVersion: 1 },
  { unique: true },
);

// TTL index to auto-delete expired entries
analysisCacheSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

const AnalysisCache =
  mongoose.models.AnalysisCache ||
  mongoose.model("AnalysisCache", analysisCacheSchema);

module.exports = { AnalysisCache };
