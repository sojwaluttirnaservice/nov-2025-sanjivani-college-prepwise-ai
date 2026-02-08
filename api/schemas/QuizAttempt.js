const mongoose = require("mongoose");

const QUIZ_TYPES = {
  DIAGNOSTIC: "DIAGNOSTIC",
  ADAPTIVE: "ADAPTIVE",
};

const ATTEMPT_STATUS = {
  IN_PROGRESS: "IN_PROGRESS",
  SUBMITTED: "SUBMITTED",
  COMPLETED: "COMPLETED",
};

const quizAttemptSchema = new mongoose.Schema(
  {
    /**
     * 🔗 Ownership & context
     */
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    unitAttemptId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "UnitAttempt",
      required: true,
      index: true,
    },

    quizId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Quiz",
      required: true,
    },

    quizType: {
      type: String,
      enum: Object.values(QUIZ_TYPES),
      required: true,
    },

    status: {
      type: String,
      enum: Object.values(ATTEMPT_STATUS),
      default: ATTEMPT_STATUS.IN_PROGRESS,
    },

    /**
     * 📝 Answers given by student
     */
    answers: [
      {
        questionId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Question",
          required: true,
        },
        selectedOption: {
          type: String, // "A", "B", "C", "D"
          required: true,
        },
        isCorrect: {
          type: Boolean,
          required: true,
        },
      },
    ],

    /**
     * 📊 Result
     */
    score: {
      type: Number,
      default: 0,
      min: 0,
    },

    totalQuestions: {
      type: Number,
      required: true,
    },

    percentage: {
      type: Number,
      min: 0,
      max: 100,
    },

    /**
     * ⏱️ Timing
     */
    startedAt: {
      type: Date,
      required: true,
    },

    completedAt: {
      type: Date,
    },

    timeSpent: {
      type: Number, // Seconds
      default: 0,
    },

    aiAnalysis: {
      type: String, // or Object if structured
      default: null,
    },

    analysisAttempts: {
      type: Number,
      default: 0,
    },

    analysisLog: [
      {
        date: { type: Date, default: Date.now },
        version: { type: Number }, // 1, 2
        analysisText: { type: String }, // Store content
      },
    ],
  },
  { timestamps: true },
);

/**
 * 📌 Helpful indexes
 */
quizAttemptSchema.index({ userId: 1, quizId: 1 });
// Index is already defined in schema options for unitAttemptId
// quizAttemptSchema.index({ unitAttemptId: 1 });

const QuizAttempt =
  mongoose.models.QuizAttempt ||
  mongoose.model("QuizAttempt", quizAttemptSchema);

module.exports = {
  QuizAttempt,
  QUIZ_TYPES,
  ATTEMPT_STATUS,
};
