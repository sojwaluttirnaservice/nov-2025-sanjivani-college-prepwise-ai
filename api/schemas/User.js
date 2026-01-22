const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const APP_ROLES = require("../utils/checks/roles");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },

    password: {
      type: String,
      required: true,
      minlength: 6,
      select: false,
    },

    role: {
      type: String,
      enum: [APP_ROLES.STUDENT, APP_ROLES.ADMIN],
      default: APP_ROLES.STUDENT,
    },

    /**
     * 🎓 Student academic info
     * Required only if role === STUDENT
     */
    branchId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Branch",
    },

    year: {
      type: Number,
      min: 1,
      max: 4,
    },

    semester: {
      type: Number,
      min: 1,
      max: 8,
    },
  },
  { timestamps: true },
);

/**
 * 🔐 Hash password before saving
 */
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  const saltRounds = 10;
  this.password = await bcrypt.hash(this.password, saltRounds);
  next();
});

/**
 * 🎓 Validate student academic fields
 */
userSchema.pre("validate", function (next) {
  if (this.role === APP_ROLES.STUDENT) {
    if (!this.branchId || !this.year || !this.semester) {
      return next(new Error("Student must have branchId, year, and semester"));
    }
  }
  next();
});

/**
 * 🔍 Compare plaintext password with hashed password
 */
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

const User = mongoose.models.User || mongoose.model("User", userSchema);
module.exports = User;
