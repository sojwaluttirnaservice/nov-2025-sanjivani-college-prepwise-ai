/**
 * General configuration for the application.
 *
 * @module generalConfig
 */

/**
 * @typedef {Object} GeneralConfig
 * @property {boolean} isOtpEnabled - Flag to enable or disable OTP functionality.
 * @property {number} OTP_VALIDITY_PERIOD - OTP validity period in minutes.
 */

/**
 * @type {GeneralConfig}
 */
const generalConfig = {
    /**
     * Flag to enable or disable OTP functionality.
     * If set to false, OTP generation and verification will be skipped or mocked.
     * @type {boolean}
     */
    isOtpEnabled: true,

    /**
     * Time in minutes for which an OTP is valid.
     * @type {number}
     */
    OTP_VALIDITY_PERIOD: 10
};

module.exports = { generalConfig };
