import axios from "axios";
import messageUtil from "./message";
import clientConfig from "../config/clientConfig";

const instance = axios.create({
  baseURL: clientConfig.API_URL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request Interceptor - Attach token to requests
instance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// Response Interceptor - Handle successful responses
instance.interceptors.response.use(
  (response) => {
    // Return the data object from API response
    return response.data;
  },
  (error) => {
    // Handle errors
    if (error.response) {
      // Server responded with error status
      const { statusCode, message: apiMessage } = error.response.data;

      // Show error toast
      messageUtil.error(apiMessage || "Something went wrong!");

      // Handle specific status codes
      if (statusCode === 401) {
        // Unauthorized - clear token and redirect to login
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        window.location.href = "/login";
      }
    } else if (error.request) {
      // Request made but no response received
      messageUtil.error("Network error. Please check your connection.");
    } else {
      // Something else happened
      messageUtil.error("An unexpected error occurred.");
    }

    return Promise.reject(error);
  },
);

export { instance };
