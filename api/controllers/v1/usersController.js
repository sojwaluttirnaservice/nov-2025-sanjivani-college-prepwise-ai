const usersModel = require("../../models/users.model");
const { sendSuccess, sendError } = require("../../utils/responses/ApiResponse");
const STATUS = require("../../utils/status");
const asyncHandler = require("../../utils/asyncHandler");
const AppError = require("../../utils/AppError");
const jwt = require("jsonwebtoken");
const config = require("../../config/config");

const usersController = {
  createUser: asyncHandler(async (req, res) => {
    let userData = req.body;
    const { email } = userData;

    const existingUser = await usersModel.getUserByEmail(email);

    if (existingUser) {
      throw new AppError(
        "User already exists with this email",
        STATUS.CONFLICT,
      );
    }

    const user = await usersModel.createUser(userData);
    return sendSuccess(res, STATUS.CREATED, "User created successfully", {
      user,
    });
  }),

  /**
   * =========================
   * LOGIN
   * =========================
   */
  login: asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
      throw new AppError("Email and password are required", STATUS.BAD_REQUEST);
    }

    // Explicitly fetch password
    const user = await usersModel.getUserByEmail(email, true);
    if (!user) {
      throw new AppError("Invalid email or password", STATUS.UNAUTHORIZED);
    }

    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      throw new AppError("Invalid email or password", STATUS.UNAUTHORIZED);
    }

    // Generate JWT
    const token = jwt.sign(
      {
        userId: user._id,
        role: user.role,
      },
      config.security.jwtSecret,
      { expiresIn: "7d" },
    );

    // Remove password before response
    user.password = undefined;

    return sendSuccess(res, STATUS.OK, "Login successful", {
      token,
      user,
    });
  }),

  /**
   * =========================
   * VERIFY AUTHENTICATED USER
   * =========================
   */
  verifyUser: asyncHandler(async (req, res) => {
    if (!req.user) {
      throw new AppError("Unauthorized", STATUS.UNAUTHORIZED);
    }

    return sendSuccess(res, STATUS.OK, "User verified successfully", req.user);
  }),

  /**
   * =========================
   * GET USER PROFILE
   * =========================
   */
  getProfile: asyncHandler(async (req, res) => {
    if (!req.user) {
      throw new AppError("Unauthorized", STATUS.UNAUTHORIZED);
    }

    // Optional: re-fetch for fresh data
    const userId = req.user.userId || req.user._id;
    const user = await usersModel.getUserById(userId);
    if (!user) {
      throw new AppError("User not found", STATUS.NOT_FOUND);
    }

    return sendSuccess(res, STATUS.OK, "User profile retrieved", user);
  }),

  updateProfile: asyncHandler(async (req, res) => {
    if (!req.user) {
      throw new AppError("Unauthorized", STATUS.UNAUTHORIZED);
    }

    const userId = req.user.userId || req.user._id;

    if (
      Object.prototype.hasOwnProperty.call(req.body, "email") ||
      Object.prototype.hasOwnProperty.call(req.body, "password") ||
      Object.prototype.hasOwnProperty.call(req.body, "role")
    ) {
      throw new AppError(
        "Cannot update email, password, or role via this endpoint",
        STATUS.BAD_REQUEST,
      );
    }

    const existingUser = await usersModel.getUserById(userId);
    if (!existingUser) {
      throw new AppError("User not found", STATUS.NOT_FOUND);
    }

    const updates = {};

    if (typeof req.body?.name === "string") {
      updates.name = req.body.name.trim();
    }

    if (req.body?.branchId) {
      updates.branchId = req.body.branchId;
    }

    if (Object.prototype.hasOwnProperty.call(req.body, "semester")) {
      const semester = Number(req.body.semester);
      if (Number.isNaN(semester)) {
        throw new AppError("Semester must be a number", STATUS.BAD_REQUEST);
      }
      updates.semester = semester;
      updates.year = Math.ceil(semester / 2);
    }

    if (
      !updates.name &&
      !updates.branchId &&
      !Object.prototype.hasOwnProperty.call(updates, "semester")
    ) {
      throw new AppError("No valid fields provided to update", STATUS.BAD_REQUEST);
    }

    const nextBranchId = updates.branchId ?? existingUser.branchId;
    const nextSemester =
      updates.semester ?? existingUser.semester;
    const nextYear = updates.year ?? existingUser.year;

    if (existingUser.role === "STUDENT") {
      if (!nextBranchId || !nextSemester || !nextYear) {
        throw new AppError(
          "Student must have branchId, year, and semester",
          STATUS.BAD_REQUEST,
        );
      }
    }

    const user = await usersModel.updateUserById(userId, updates);
    if (!user) {
      throw new AppError("User not found", STATUS.NOT_FOUND);
    }

    return sendSuccess(res, STATUS.OK, "User profile updated", user);
  }),
};

module.exports = usersController;
