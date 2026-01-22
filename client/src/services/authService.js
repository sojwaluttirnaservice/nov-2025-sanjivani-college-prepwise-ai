import { instance } from "../utils/instance";

/**
 * Authentication Service
 * Handles login, registration, and verification against the real backend API.
 */
export const authService = {
  /**
   * Login user
   * @param {Object} credentials - { email, password }
   * @returns {Promise<Object>} - { user, token }
   */
  login: async (credentials) => {
    // POST /users/login
    console.log(credentials);
    // Response data structure: { statusCode, success, message, data: { token, user } }
    const response = await instance.post("/users/login", credentials);
    return response.data; // Returns { token, user }
  },

  /**
   * Register new user
   * @param {Object} userData - User registration details
   * @returns {Promise<Object>} - { user }
   */
  register: async (userData) => {
    // POST /users
    // Response data structure: { statusCode, success, message, data: { user } }
    const response = await instance.post("/users", userData);
    return response.data; // Returns { user }
  },

  /**
   * Verify authenticated user (Optional, for persistent session checks)
   * @returns {Promise<Object>} - { user }
   */
  verify: async () => {
    // GET /users/verify
    const response = await instance.get("/users/verify");
    return response.data;
  },

  me: async () => {
    const response = await instance.get("/users/me");
    return response.data;
  },

  updateMe: async (updates) => {
    const response = await instance.patch("/users/me", updates);
    return response.data;
  },
};
