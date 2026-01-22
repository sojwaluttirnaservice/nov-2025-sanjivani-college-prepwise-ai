const mongoose = require("mongoose");

const subjectSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true, // e.g. "Programming in C"
    },

    branchId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Branch",
      required: true,
      index: true,
    },

    semester: {
      type: Number,
      required: true, // 1–8
      min: 1,
      max: 8,
    },
  },
  { timestamps: true },
);

subjectSchema.index({ branchId: 1, semester: 1 });

const Subject =
  mongoose.models.Subject || mongoose.model("Subject", subjectSchema);

module.exports = Subject;
