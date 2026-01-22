const jwt = require("jsonwebtoken");
const config = require("../config/config");

/**
 * Generate JWT token
 * @param {Object} payload - Payload to embed in token (id, email, role)
 * @param {string} [expiresIn='1d'] - Token expiry
 * @returns {string}
 */
const generateToken = (payload, expiresIn = "1d") => {
  const secretKey = config?.security?.jwtSecret;

  if (!secretKey) {
    throw new Error("JWT secret key is not configured");
  }

  if (!payload || typeof payload !== "object") {
    throw new Error("JWT payload must be a valid object");
  }

  return jwt.sign(payload, secretKey, {
    expiresIn,
    algorithm: "HS256",
  });
};

/**
 * Extract JWT token from Authorization header
 * Format: Authorization: Bearer <token>
 *
 * @param {import('express').Request} req
 * @returns {string|null}
 */
const extractToken = (req) => {
  if (!req || !req.headers) return null;

  const authHeader =
    req.headers.authorization || req.headers.Authorization;

  if (!authHeader || typeof authHeader !== "string") {
    return null;
  }

  const parts = authHeader.split(" ");

  if (parts.length !== 2 || parts[0] !== "Bearer") {
    return null;
  }

  return parts[1] || null;
};

/**
 * Verify JWT token
 *
 * @param {string} token
 * @param {boolean} [ignoreExpiration=false]
 * @returns {Object|null}
 */
const verifyToken = (token, ignoreExpiration = false) => {
  if (!token || typeof token !== "string") {
    return null;
  }

  const secretKey = config?.security?.jwtSecret;
  if (!secretKey) {
    console.error("JWT secret key missing");
    return null;
  }

  try {
    return jwt.verify(token, secretKey, { ignoreExpiration });
  } catch (err) {
    // expected failures: expired / malformed / invalid signature
    if (process.env.NODE_ENV !== "production") {
      console.error("JWT verification failed:", err.message);
    }
    return null;
  }
};

/**
 * Decode JWT token without verification (⚠️ DO NOT TRUST OUTPUT)
 *
 * @param {import('express').Request} req
 * @returns {Object|null}
 */
const decodeToken = (req) => {
  const token = extractToken(req);
  if (!token) return null;

  try {
    return jwt.decode(token) || null;
  } catch {
    return null;
  }
};

module.exports = {
  generateToken,
  extractToken,
  verifyToken,
  decodeToken,
};
