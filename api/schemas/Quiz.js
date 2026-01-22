const mongoose = require("mongoose");

const QUIZ_TYPES = {
  DIAGNOSTIC: "DIAGNOSTIC",
  ADAPTIVE: "ADAPTIVE",
};

const quizSchema = new mongoose.Schema(
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

    /**
     * 🧪 Quiz type
     */
    type: {
      type: String,
      enum: Object.values(QUIZ_TYPES),
      required: true,
    },

    /**
     * ❓ Questions snapshot
     */
    questionIds: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Question",
        required: true,
      },
    ],

    totalQuestions: {
      type: Number,
      required: true,
    },

    /**
     * 🤖 Generation metadata
     */
    generatedBy: {
      type: String,
      enum: ["SYSTEM", "ADMIN"],
      default: "SYSTEM",
    },

    generationContext: {
      type: String, // e.g. "Initial diagnostic for Unit 1"
    },

    /**
     * 🧠 AI metadata (optional but useful)
     */
    aiModel: {
      type: String, // e.g. "gpt-4"
    },
  },
  { timestamps: true },
);

const Quiz = mongoose.models.Quiz || mongoose.model("Quiz", quizSchema);

module.exports = {
  Quiz,
  QUIZ_TYPES,
};
