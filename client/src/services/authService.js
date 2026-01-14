import { DUMMY_USERS } from "../data/auth";

/**
 * Mocking the Authentication API
 */
export const authService = {
  login: async (credentials) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const { email, password } = credentials;

        // Dev Mode Bypass
        const isDev = import.meta.env.MODE === "development";
        if (isDev) {
          if (email === "admin" || password === "admin") {
            return resolve({
              user: DUMMY_USERS.find((u) => u.role === "ADMIN"),
              token: "mock-admin-token",
            });
          }
          if (email === "student" || email.length > 3) {
            return resolve({
              user: DUMMY_USERS.find((u) => u.role === "STUDENT"),
              token: "mock-student-token",
            });
          }
        }

        // Normal logic (simulated)
        const user = DUMMY_USERS.find(
          (u) => u.email === email && u.password === password
        );
        if (user) {
          resolve({ user, token: `mock-token-${user.id}` });
        } else {
          reject(new Error("Invalid credentials"));
        }
      }, 800);
    });
  },

  register: async (userData) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          user: { ...userData, id: Date.now().toString(), role: "STUDENT" },
          token: "mock-reg-token",
        });
      }, 800);
    });
  },
};
