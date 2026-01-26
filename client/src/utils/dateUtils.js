/**
 * Format a date string into a readable format
 * e.g., "Jan 26, 2025, 04:30 PM"
 * @param {string} dateString
 * @returns {string} formatted date
 */
export const formatDate = (dateString) => {
  if (!dateString) return "N/A";

  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};
