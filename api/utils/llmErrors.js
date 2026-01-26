/**
 * LLM Error Detection Utilities
 * Provides robust detection for various LLM provider errors
 */

const isGeminiQuotaExceeded = (error) => {
  return (
    error?.message?.includes("Quota exceeded") ||
    error?.message?.includes("generate_content_free_tier_requests") ||
    error?.response?.error?.details?.some(
      (d) => d.quotaMetric && d.quotaMetric.includes("generate_content"),
    )
  );
};

module.exports = { isGeminiQuotaExceeded };
