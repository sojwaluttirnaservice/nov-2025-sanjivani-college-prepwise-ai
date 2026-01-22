const mongoose = require("mongoose");

const unitSchema = new mongoose.Schema(
  {
    /**
     * 🔗 Academic context
     */
    subjectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Subject",
      required: true,
      index: true,
    },

    /**
     * 📘 Unit identity
     */
    name: {
      type: String,
      required: true, // e.g. "Unit 1: Introduction to C"
      trim: true,
    },

    unitNumber: {
      type: Number,
      required: true, // 1, 2, 3...
    },

    /**
     * 🧩 Topics covered in this unit
     * (Used by LLM for question generation)
     */
    topics: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Topic",
      },
    ],

    /**
     * 🧠 Metadata
     */
    description: {
      type: String,
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true },
);

/**
 * 📌 Prevent duplicate unit numbers per subject
 */
unitSchema.index({ subjectId: 1, unitNumber: 1 }, { unique: true });

const Unit = mongoose.models.Unit || mongoose.model("Unit", unitSchema);

module.exports = Unit;
