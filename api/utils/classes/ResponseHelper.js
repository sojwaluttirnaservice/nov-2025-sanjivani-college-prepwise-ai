const path = require('path');
const STATUS = require('../status');

/**
 * ResponseHelper class provides standardized API responses and page rendering.
 */
class ResponseHelper {

    /**
     * Sends a standardized JSON API response.
     *
     * @param {Object} res - Express response object.
     * @param {number} [statusCode=status.OK] - HTTP status code.
     * @param {boolean} [success=false] - Indicates if the request was successful.
     * @param {string} [message=''] - Description of the operation outcome.
     * @param {Object|null} [data=null] - Optional data payload to include in the response.
     * @param {Object|string|null} [error=null] - Optional error details for debugging or logging.
     */
    static sendResponse(res, statusCode = STATUS.OK, success = false, message = '', data = null, error = null) {
        return res.status(statusCode).json({
            statusCode,
            success,
            message,
            data,
            error
        });
    }

    /**
     * Sends a standardized JSON API error response.
     *
     * @param {Object} res - Express response object.
     * @param {number} [statusCode=status.INTERNAL_SERVER_ERROR] - HTTP status code.
     * @param {boolean} [success=false] - Indicates success status (usually false).
     * @param {string} [message=''] - Error message for client-side display or logging.
     * @param {Object|null} [data=null] - Additional context or metadata related to the error.
     * @param {Object|string|null} [error=null] - Detailed error object or stack trace.
     */
    static sendError(res, statusCode = STATUS.INTERNAL_SERVER_ERROR, success = false, message = '', data = null, error = null) {
        return res.status(statusCode).json({
            statusCode,
            success,
            message,
            data,
            error
        });
    }

    /**
     * Renders a server-side page using a specified view file and data.
     *
     * @param {Object} res - Express response object.
     * @param {string} filePath - Path to the template/view file (relative to `views/` directory).
     * @param {Object} [renderData={}] - Data object passed to the view template.
     */
    static renderPage(res, filePath, renderData = {}) {
        return res.render(filePath, { title: "No title found", ...renderData });
    }
}

module.exports = ResponseHelper;
