import message from "./message";

/**
 * extractErrorMessage
 * Utility to extract the error message from an API response error object.
 *
 * @param {any} error - The error object caught in a try/catch or promise rejection.
 * @param {string} defaultMessage - Fallback message if no specific error message is found.
 * @returns {string} - The extracted error message.
 */
export const extractErrorMessage = (
  error,
  defaultMessage = "Something went wrong",
) => {
  if (error?.response?.data?.message) {
    return error.response.data.message;
  }
  if (error?.message) {
    return error.message;
  }
  return defaultMessage;
};

/**
 * handleError
 * Utility to extract the error message and display it using the message utility.
 *
 * @param {any} error - The error object.
 * @param {string} defaultMessage - Fallback message.
 * @returns {string} - The extracted message (in case it's needed).
 */
export const handleError = (error, defaultMessage) => {
  const msg = extractErrorMessage(error, defaultMessage);
  message.error(msg);
  return msg;
};
