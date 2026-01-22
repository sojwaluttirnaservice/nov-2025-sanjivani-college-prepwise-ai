const usersModel = require("../../models/users.model");
const { sendSuccess, sendError } = require("../../utils/responses/ApiResponse");
const STATUS = require("../../utils/status");
const asyncHandler = require("../../utils/asyncHandler");
const AppError = require("../../utils/AppError");
const jwt = require("jsonwebtoken");
const config = require("../../config/config");

const usersController = {
  createUser: asyncHandler(async (req, res) => {
    const { email, password, role } = req.body;

    const existingUser = await usersModel.getUserByEmail(req.body.email);

    if (existingUser) {
      throw new AppError(
        "User already exists with this email",
        STATUS.CONFLICT,
      );
    }

    const user = await usersModel.createUser(req.body);
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
    const user = await usersModel.getUserById(req.user._id);
    if (!user) {
      throw new AppError("User not found", STATUS.NOT_FOUND);
    }

    return sendSuccess(res, STATUS.OK, "User profile retrieved", user);
  }),
};

module.exports = usersController;
