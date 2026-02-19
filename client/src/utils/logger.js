/**
 * Logger utility to handle console logging based on environment.
 * Logs are only output in development environment (import.meta.env.DEV).
 */
export const logger = {
  /**
   * Log informational messages (only in DEV)
   */
  log: (...args) => {
    if (import.meta.env.DEV) {
      console.log(...args);
    }
  },

  /**
   * Log debug messages with [DEBUG] prefix (only in DEV)
   */
  debug: (...args) => {
    if (import.meta.env.DEV) {
      console.log("[DEBUG]", ...args); // Using log for debug to avoid browser filtering issues sometimes associated with debug
    }
  },

  /**
   * Log warnings (only in DEV)
   */
  warn: (...args) => {
    if (import.meta.env.DEV) {
      console.warn(...args);
    }
  },

  /**
   * Log errors.
   * Note: Standard console.error is used to ensure errors are visible in production if needed,
   * but you can use this wrapper for consistency.
   * If you want dev-only errors, use devError.
   */
  error: (...args) => {
    console.error(...args);
  },

  /**
   * Log errors only in DEV environment
   */
  devError: (...args) => {
    if (import.meta.env.DEV) {
      console.error(...args);
    }
  },
};

export default logger;
