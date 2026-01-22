const mongoose = require("mongoose");

const QUIZ_TYPES = {
  DIAGNOSTIC: "DIAGNOSTIC",
  ADAPTIVE: "ADAPTIVE",
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
      required: true,
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
      required: true,
    },
  },
  { timestamps: true },
);

/**
 * 📌 Helpful indexes
 */
quizAttemptSchema.index({ userId: 1, quizId: 1 });
quizAttemptSchema.index({ unitAttemptId: 1 });

const QuizAttempt =
  mongoose.models.QuizAttempt ||
  mongoose.model("QuizAttempt", quizAttemptSchema);

module.exports = {
  QuizAttempt,
  QUIZ_TYPES,
};
