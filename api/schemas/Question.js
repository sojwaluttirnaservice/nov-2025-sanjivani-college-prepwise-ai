const mongoose = require("mongoose");

const QUESTION_DIFFICULTY = {
  EASY: "EASY",
  MEDIUM: "MEDIUM",
  HARD: "HARD",
};

const QUESTION_SOURCE = {
  AI: "AI",
  MANUAL: "MANUAL",
};

const questionSchema = new mongoose.Schema(
  {
    /**
     * 🔗 Academic context
     */
    unitId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Unit",
      required: true,
      index: true,
    },

    topicId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Topic",
      required: true,
      index: true,
    },

    /**
     * ❓ Question content
     */
    questionText: {
      type: String,
      required: true,
      trim: true,
    },

    options: [
      {
        key: {
          type: String, // "A", "B", "C", "D"
          required: true,
        },
        text: {
          type: String,
          required: true,
        },
      },
    ],

    correctOption: {
      type: String, // "A", "B", "C", "D"
      required: true,
    },

    /**
     * 🧠 Learning metadata
     */
    difficulty: {
      type: String,
      enum: Object.values(QUESTION_DIFFICULTY),
      default: QUESTION_DIFFICULTY.MEDIUM,
    },

    explanation: {
      type: String,
    },

    source: {
      type: String,
      enum: Object.values(QUESTION_SOURCE),
      default: QUESTION_SOURCE.AI,
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true },
);

/**
 * 📌 Helpful indexes
 */
questionSchema.index({ unitId: 1, topicId: 1 });
questionSchema.index({ difficulty: 1 });

const Question =
  mongoose.models.Question || mongoose.model("Question", questionSchema);

module.exports = {
  Question,
  QUESTION_DIFFICULTY,
  QUESTION_SOURCE,
};
