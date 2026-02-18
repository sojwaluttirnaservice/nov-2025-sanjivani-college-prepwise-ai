const mongoose = require("mongoose");

const studyNoteSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    index: true,
  },
  attemptId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "QuizAttempt",
    required: false,
  },
  quizId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Quiz",
    required: false,
  },
  unitId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Unit",
    required: false,
  },
  subjectId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Subject",
    required: false,
  },
  topics: [
    {
      type: String,
      required: true,
    },
  ],
  summary: {
    type: String,
    required: true,
  },
  keyPoints: [
    {
      type: String,
      required: true,
    },
  ],
  detailedContent: {
    type: String,
    required: true,
  },
  version: {
    type: Number,
    required: true,
    enum: [1, 2],
  },
  generatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Ensure a user can only have versions 1 and 2
// Ensure efficient querying but relax strict unique constraint to avoid legacy data conflicts
// Application logic handles the limit check
studyNoteSchema.index({ userId: 1, attemptId: 1 });

const StudyNote =
  mongoose.models.StudyNote || mongoose.model("StudyNote", studyNoteSchema);

module.exports = StudyNote;
