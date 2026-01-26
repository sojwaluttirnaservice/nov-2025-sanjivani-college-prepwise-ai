require("dotenv").config();

/**
 * @typedef {Object} DatabaseConfig
 * @property {string} uri - MongoDB connection URI
 */

/**
 * @typedef {Object} ServerConfig
 * @property {number} port - Port number on which the server will run
 * @property {string} env - Current environment (DEV | PROD)
 */

/**
 * @typedef {Object} SecurityConfig
 * @property {string} jwtSecret - Secret key for JWT signing
 * @property {string} sessionSecret - Secret key for sessions
 */

/**
 * @typedef {Object} Config
 * @property {DatabaseConfig} db
 * @property {string | undefined} allowedOrigin
 * @property {ServerConfig} server
 * @property {SecurityConfig} security
 */

const ENV = process.env.PROJECT_ENV || "DEV";

const baseConfig = {
  server: {
    port: Number(process.env.PORT) || 5000,
    env: ENV,
  },
};

const configs = {
  DEV: {
    ...baseConfig,
    db: {
      uri: process.env.MONGODB_URI,
    },
    allowedOrigin: process.env.ALLOWED_ORIGIN,
    security: {
      jwtSecret: process.env.JWT_SECRET_KEY,
      sessionSecret: process.env.SESSION_SECRET,
    },
    llm: {
      provider: process.env.LLM_PROVIDER,
      openaiApiKey: process.env.OPENAI_API_KEY,
      openaiModel: process.env.OPENAI_MODEL,
      geminiApiKey: process.env.GEMINI_API_KEY,
      geminiModel: process.env.GEMINI_MODEL,
    },
  },

  PROD: {
    ...baseConfig,
    db: {
      // User requested to use same DB for both modes
      uri: process.env.MONGODB_URI,
    },
    allowedOrigin:
      process.env.ALLOWED_ORIGIN_PROD || process.env.ALLOWED_ORIGIN,
    security: {
      jwtSecret: process.env.JWT_SECRET_KEY_PROD || process.env.JWT_SECRET_KEY,
      sessionSecret:
        process.env.SESSION_SECRET_PROD || process.env.SESSION_SECRET,
    },
    llm: {
      provider: process.env.LLM_PROVIDER,
      openaiApiKey: process.env.OPENAI_API_KEY,
      openaiModel: process.env.OPENAI_MODEL,
      geminiApiKey: process.env.GEMINI_API_KEY,
      geminiModel: process.env.GEMINI_MODEL,
    },
  },
};

/**
 * ❗ Fail fast if required env vars are missing
 */
const required = ["db.uri", "security.jwtSecret", "security.sessionSecret"];

required.forEach((key) => {
  const value = key.split(".").reduce((o, i) => o?.[i], configs[ENV]);
  if (!value) {
    throw new Error(`❌ Missing required config: ${key} (${ENV})`);
  }
});

/**
 * @type {Config}
 */
module.exports = configs[ENV];
