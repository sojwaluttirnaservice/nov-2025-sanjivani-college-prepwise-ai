const asyncHandler = require("../utils/asyncHandler");
const APP_ROLES = require("../utils/checks/roles");
const { sendError } = require("../utils/responses/ApiResponse");
const STATUS = require("../utils/status");
const { extractToken, verifyToken } = require("../utils/token");

// Admin-only access
const isAdmin = asyncHandler(async (req, res, next) => {
  const token = extractToken(req);
  if (!token) return sendError(res, STATUS.UNAUTHORIZED, "No token provided.");

  const decoded = verifyToken(token);
  if (!decoded || decoded.role !== APP_ROLES.ADMIN) {
    return sendError(res, STATUS.FORBIDDEN, "Access denied. Admins only.");
  }

  req.user = decoded;
  next();
});

// Authenticated access for any role
const isAuthenticated = asyncHandler(async (req, res, next) => {
  const token = extractToken(req);
  if (!token) return sendError(res, STATUS.UNAUTHORIZED, "No token provided.");

  const decoded = verifyToken(token);
  if (!decoded)
    return sendError(res, STATUS.UNAUTHORIZED, "Invalid or expired token.");

  req.user = decoded;
  next();
});

// Customer-only access
const isStudent = asyncHandler(async (req, res, next) => {
  const token = extractToken(req);
  if (!token) return sendError(res, STATUS.UNAUTHORIZED, "No token provided.");

  const decoded = verifyToken(token);
  if (!decoded || decoded.role !== APP_ROLES.STUDENT) {
    return sendError(res, STATUS.FORBIDDEN, "Access denied. Students only.");
  }

  req.user = decoded;
  next();
});

module.exports = {
  isAdmin,
  isAuthenticated,
  isStudent,
};
