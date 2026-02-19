const usersModel = require("../../models/users.model");
const Branch = require("../../schemas/Branch");
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
      throw new AppError(
        "No valid fields provided to update",
        STATUS.BAD_REQUEST,
      );
    }

    const nextBranchId = updates.branchId ?? existingUser.branchId;
    const nextSemester = updates.semester ?? existingUser.semester;
    const nextYear = updates.year ?? existingUser.year;

    if (existingUser.role === "STUDENT") {
      if (!nextBranchId || !nextSemester || !nextYear) {
        throw new AppError(
          "Student must have a valid Branch, Year, and Semester",
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

  /**
   * =========================
   * GET ALL STUDENTS (ADMIN)
   * =========================
   */
  getUsers: asyncHandler(async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const { branch, year, semester, search, role } = req.query;

    // Base query
    const query = {};

    // Filter by Role (Default to STUDENT if not specified, or allow filtering)
    if (role) {
      query.role = role;
    } else {
      query.role = "STUDENT"; // Default to students for this view
    }

    // Filter by Branch
    if (branch) {
      // If branch is ObjectID
      if (branch.match(/^[0-9a-fA-F]{24}$/)) {
        query.branchId = branch;
      } else {
        // Look up branch by name
        const branchDoc = await Branch.findOne({
          name: { $regex: new RegExp(`^${branch}$`, "i") },
        });
        if (branchDoc) {
          query.branchId = branchDoc._id;
        } else {
          // If branch name provided but not found, ensure no results are returned for that filter
          // return empty list
          return sendSuccess(res, STATUS.OK, "Users retrieved successfully", {
            users: [],
            pagination: {
              total: 0,
              page,
              limit,
              pages: 0,
            },
          });
        }
      }
    }

    // Filter by Year/Semester
    if (year) query.year = year;
    if (semester) query.semester = semester;

    // Search by Name or Email
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ];
    }

    // Execute Query
    const total = await usersModel.Model.countDocuments(query);
    const users = await usersModel.Model.find(query)
      .select("-password") // Exclude password
      .populate("branchId", "name") // Populate branch name
      .sort({ createdAt: -1 }) // Newest first
      .skip(skip)
      .limit(limit);

    return sendSuccess(res, STATUS.OK, "Users retrieved successfully", {
      users,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    });
  }),

  /**
   * =========================
   * GET USER BY ID (ADMIN)
   * =========================
   */
  getUserById: asyncHandler(async (req, res) => {
    const { id } = req.params;

    const user = await usersModel
      .getUserById(id)
      .select("-password")
      .populate("branchId", "name");

    if (!user) {
      throw new AppError("User not found", STATUS.NOT_FOUND);
    }

    return sendSuccess(res, STATUS.OK, "User retrieved successfully", user);
  }),
};

module.exports = usersController;
