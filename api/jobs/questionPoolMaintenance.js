/**
 * @module QuestionPoolMaintenanceJob
 * @description
 * Background cron job that refills question pools during off-peak hours.
 *
 * WHY THIS EXISTS:
 * - Prevents LLM quota usage during peak user hours
 * - Ensures question pools are always stocked
 * - Distributes API usage across the day
 *
 * SCHEDULE:
 * - Runs every night at 2:00 AM (when traffic is lowest)
 * - Processes all active units one by one
 * - Respects rate limits with 5s delays between units
 *
 * IMPACT:
 * - Users NEVER wait for question generation
 * - Quota usage is predictable and controlled
 * - System can handle traffic spikes gracefully
 *
 * USAGE:
 * - Automatically starts with the server (imported in bin/www)
 * - Can be manually triggered for testing
 */

const cron = require("node-cron");
const mongoose = require("mongoose");

const QuestionPoolMaintenanceJob = {
  /**
   * Start the cron job
   * Runs at 2:00 AM every night
   *
   * Cron syntax: "0 2 * * *"
   * - 0 = minute
   * - 2 = hour (2 AM)
   * - * = any day of month
   * - * = any month
   * - * = any day of week
   */
  start: () => {
    console.log("[QuestionPoolJob] Scheduling nightly maintenance for 2:00 AM");

    // Run every night at 2 AM
    cron.schedule("0 2 * * *", async () => {
      console.log(`[QuestionPoolJob] ===== Starting Pool Maintenance =====`);
      await QuestionPoolMaintenanceJob.refillAllPools();
      console.log(`[QuestionPoolJob] ===== Maintenance Complete =====`);
    });

    console.log("✅ [QuestionPoolJob] Cron job scheduled successfully");
  },

  /**
   * Manually trigger pool refill (for testing or emergency use)
   * Can be called via admin API endpoint if needed
   */
  refillAllPools: async () => {
    try {
      const questionPoolModel = require("../models/questionPool.model");
      const Unit = require("../schemas/Unit").Unit;

      // Get all active units
      const units = await Unit.find({ isActive: true }).select("_id name");
      console.log(`[QuestionPoolJob] Found ${units.length} active units`);

      const quizTypes = ["PRACTICE", "EXAM", "MOCK"];

      for (const unit of units) {
        for (const quizType of quizTypes) {
          try {
            console.log(
              `[QuestionPoolJob] Processing ${unit.name} (${quizType})...`,
            );

            // Maintain minimum 50 questions per unit/type combination
            await questionPoolModel.maintainMinimumPool({
              unitId: unit._id,
              quizType: quizType,
              minSize: 50,
            });

            // CRITICAL: Respect rate limits
            // Wait 5 seconds between each unit/type to avoid quota exhaustion
            await new Promise((resolve) => setTimeout(resolve, 5000));
          } catch (unitErr) {
            // Don't let one unit failure stop the entire job
            console.error(
              `❌ [QuestionPoolJob] Failed for ${unit.name} (${quizType}):`,
              unitErr.message,
            );

            // If quota exceeded, stop processing remaining units
            if (
              unitErr.message.includes("quota") ||
              unitErr.message.includes("capacity")
            ) {
              console.error(
                "🚨 [QuestionPoolJob] Quota exhausted, stopping job",
              );
              break;
            }
          }
        }
      }

      console.log("✅ [QuestionPoolJob] All pools processed");
    } catch (err) {
      console.error("❌ [QuestionPoolJob] Fatal error:", err);
    }
  },

  /**
   * Get job status and statistics
   * Useful for monitoring dashboards
   */
  getStatus: async () => {
    const questionPoolModel = require("../models/questionPool.model");
    const stats = await questionPoolModel.getPoolStats();

    return {
      totalPools: stats.length,
      pools: stats,
      nextRun: "2:00 AM daily",
    };
  },
};

module.exports = QuestionPoolMaintenanceJob;
