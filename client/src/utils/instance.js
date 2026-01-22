import axios from "axios";
import toast from "react-hot-toast";
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
  }
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
      const { statusCode, message } = error.response.data;

      // Show error toast
      toast.error(message || "Something went wrong!");

      // Handle specific status codes
      if (statusCode === 401) {
        // Unauthorized - clear token and redirect to login
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        window.location.href = "/login";
      }
    } else if (error.request) {
      // Request made but no response received
      toast.error("Network error. Please check your connection.");
    } else {
      // Something else happened
      toast.error("An unexpected error occurred.");
    }

    return Promise.reject(error);
  }
);

export { instance };
