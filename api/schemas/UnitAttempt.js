const mongoose = require("mongoose");

/**
 * Learning states for a unit
 */
const UNIT_STATES = {
  NOT_STARTED: "NOT_STARTED",
  DIAGNOSTIC_COMPLETED: "DIAGNOSTIC_COMPLETED",
  IN_PROGRESS: "IN_PROGRESS",
  MASTERED: "MASTERED",
};

const unitAttemptSchema = new mongoose.Schema(
  {
    /**
     *  References
     */
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    unitId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Unit",
      required: true,
      index: true,
    },

    /**
     *  Current learning state
     */
    state: {
      type: String,
      enum: Object.values(UNIT_STATES),
      default: UNIT_STATES.NOT_STARTED,
    },

    /**
     *  Diagnostic quiz (first quiz of the unit)
     */
    diagnosticQuizId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Quiz",
    },

    diagnosticScore: {
      type: Number,
      min: 0,
      max: 100,
    },

    /**
     *  Topic-wise understanding (from LLM analysis)
     */
    topicAnalysis: {
      weak: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Topic",
        },
      ],
      moderate: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Topic",
        },
      ],
      strong: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Topic",
        },
      ],
    },

    /**
     *  Adaptive learning tracking
     */
    adaptiveQuizCount: {
      type: Number,
      default: 0,
    },

    /**
     *  Mastery tracking
     */
    masteryAchieved: {
      type: Boolean,
      default: false,
    },

    masteredAt: {
      type: Date,
    },
  },
  { timestamps: true },
);

/**
 * One unit attempt per user per unit
 */
unitAttemptSchema.index({ userId: 1, unitId: 1 }, { unique: true });

const UnitAttempt =
  mongoose.models.UnitAttempt ||
  mongoose.model("UnitAttempt", unitAttemptSchema);

module.exports = {
  UnitAttempt,
  UNIT_STATES,
};
