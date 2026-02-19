const mongoose = require("mongoose");

const subjectSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true, // e.g. "Programming in C"
    },

    code: {
      type: String,
      required: true,
      trim: true,
      uppercase: true, // e.g. "22CS101"
    },

    branches: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Branch",
        required: true,
        index: true,
      },
    ],

    semester: {
      type: Number,
      required: true, // 1–8
      min: 1,
      max: 8,
    },

    credits: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  { timestamps: true },
);

subjectSchema.index({ branches: 1, semester: 1 });

const Subject =
  mongoose.models.Subject || mongoose.model("Subject", subjectSchema);

module.exports = Subject;
