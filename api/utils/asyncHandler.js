/**
 * @module asyncHandler
 * @description
 * Middleware utility for wrapping asynchronous Express route handlers.
 *
 * This function eliminates repetitive try/catch blocks in async route handlers
 * by automatically catching and handling unhandled promise rejections or errors.
 *
 * If an error occurs during execution of the wrapped function, it logs the error
 * (including the stack trace in development) and sends a standardized JSON response.
 *
 * @example
 * const express = require('express');
 * const router = express.Router();
 * const asyncHandler = require('./utils/asyncHandler');
 *
 * router.get('/users', asyncHandler(async (req, res) => {
 *     const users = await User.findAll();
 *     res.json({ success: true, data: users });
 * }));
 *
 * @example
 * // Example with error handling inside asyncHandler
 * router.post('/create', asyncHandler(async (req, res) => {
 *     throw new Error('Database connection failed');
 * }));
 */

/**
 * Wraps an asynchronous Express route handler or middleware function.
 *
 * @param {Function} fn - The async route handler (req, res, next) => Promise.
 * @returns {Function} Wrapped Express middleware function with built-in error handling.
 */
const asyncHandler = (fn) => {
  return async (req, res, next) => {
    try {
      await fn(req, res, next);
    } catch (err) {
      console.error(`❌ Error: ${err.message || err}`);
      console.error("STACK TRACE:", err?.stack);

      // 🔹 Default (AppError aware)
      let statusCode = err.statusCode || 500;
      let message = err.message || "Internal Server Error";

      /**
       * =========================
       * MONGOOSE / MONGODB ERRORS
       * =========================
       */

      // 1️⃣ Schema validation error
      if (err.name === "ValidationError") {
        statusCode = 400;
        message = Object.values(err.errors)
          .map((e) => e.message)
          .join(", ");
      }

      // 2️⃣ Invalid ObjectId
      else if (err.name === "CastError") {
        statusCode = 400;
        message = `Invalid ${err.path}: ${err.value}`;
      }

      // 3️⃣ Duplicate key error
      else if (err.code === 11000 || err.name === "MongoServerError") {
        statusCode = 409;

        const field = err.keyValue ? Object.keys(err.keyValue)[0] : "field";

        const value = err.keyValue ? err.keyValue[field] : "";

        message = `${field} "${value}" already exists`;
      }

      // 4️⃣ Document not found (.orFail())
      else if (err.name === "DocumentNotFoundError") {
        statusCode = 404;
        message = "Resource not found";
      }

      // 5️⃣ Version conflict
      else if (err.name === "VersionError") {
        statusCode = 409;
        message = "Document version conflict";
      }

      /**
       * =========================
       * FINAL RESPONSE
       * =========================
       */

      return res.status(statusCode).json({
        success: false,
        message,
        data: null,
        error: process.env.PROJECT_ENV === "DEV" ? err : undefined,
        stackTrace: process.env.PROJECT_ENV === "DEV" ? err.stack : undefined,
      });
    }
  };
};

module.exports = asyncHandler;
