const mongoose = require("mongoose");

const branchSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true, // e.g. "Computer Engineering"
    },
  },
  { timestamps: true },
);

const Branch = mongoose.models.Branch || mongoose.model("Branch", branchSchema);

module.exports = Branch;
