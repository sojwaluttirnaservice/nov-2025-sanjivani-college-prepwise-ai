import toast from "react-hot-toast";

/**
 * Custom message utility wrapper around react-hot-toast.
 * Provides consistent styling and behavior for notifications across the app.
 */
const message = {
  /**
   * Show a success toast
   * @param {string} msg - The message to display
   */
  success: (msg) => {
    toast.success(msg, {
      style: {
        borderRadius: "10px",
        background: "#333",
        color: "#fff",
      },
    });
  },

  /**
   * Show an error toast
   * @param {string} msg - The message to display
   */
  error: (msg) => {
    toast.error(msg, {
      style: {
        borderRadius: "10px",
        background: "#333",
        color: "#fff",
      },
    });
  },

  /**
   * Show a loading toast
   * @param {string} msg - The message to display
   * @returns {string} toastId - ID of the toast to dismiss later if needed
   */
  loading: (msg) => {
    return toast.loading(msg, {
      style: {
        borderRadius: "10px",
        background: "#333",
        color: "#fff",
      },
    });
  },

  /**
   * Show a custom toast (can be used for warnings, info etc.)
   * @param {string} msg - The message to display
   * @param {string} icon - Emoji icon to display
   */
  custom: (msg, icon = "ℹ️") => {
    toast(msg, {
      icon: icon,
      style: {
        borderRadius: "10px",
        background: "#333",
        color: "#fff",
      },
    });
  },

  /**
   * Dismiss a specific toast or all toasts
   * @param {string} [toastId] - Optional ID of the toast to dismiss
   */
  dismiss: (toastId) => {
    toast.dismiss(toastId);
  },

  /**
   * Promise toast for async operations
   * @param {Promise} promise - The promise to track
   * @param {string} loadingMsg - Message during loading
   * @param {string} successMsg - Message on success
   * @param {string} errorMsg - Message on error
   */
  promise: (promise, loadingMsg, successMsg, errorMsg) => {
    return toast.promise(
      promise,
      {
        loading: loadingMsg,
        success: successMsg,
        error: errorMsg,
      },
      {
        style: {
          borderRadius: "10px",
          background: "#333",
          color: "#fff",
        },
      }
    );
  },
};

export default message;
