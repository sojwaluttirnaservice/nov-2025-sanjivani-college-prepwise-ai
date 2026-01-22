const { v4: uuidv4 } = require('uuid');
const { generalConfig } = require('../config/generalConfig');


const otpManager = {
    /**
     * Generates a numeric or alphanumeric OTP with expiry and reference ID.
     *
     * @param {Object} otpConfig - OTP configuration
     * @param {number} otpConfig.length - OTP length (default 6)
     * @param {number} otpConfig.expiryTime - Expiry in minutes (default 20)
     * @param {boolean} [otpConfig.alphanumeric=false] - Whether OTP should be alphanumeric
     * @returns {Object} { otp, expiresAt, expiresAtReadable, otpReferenceId }
     */
    generateOtp: (otpConfig = {
        length: 6,
        expiryTime: generalConfig.OTP_VALIDITY_PERIOD, // in minutes
        alphanumeric: false
    }) => {
        const { length, expiryTime, alphanumeric = false } = otpConfig;

        if (!Number.isInteger(length) || length <= 0) {
            throw new Error("OTP length must be a positive integer.");
        }
        if (!Number.isFinite(expiryTime) || expiryTime <= 0) {
            throw new Error("Expiry time must be a positive number (in minutes).");
        }

        const chars = alphanumeric
            ? 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
            : '0123456789';

        const otp = Array.from({ length }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
        const expiresAt = new Date(Date.now() + expiryTime * 60 * 1000);
        const otpReferenceId = uuidv4();


        // 111111 is temporary otp
        return {
            otp: 111111 || otp,
            expiresAt,
            expiresAtReadable: new Date(expiresAt).toISOString(),
            otpReferenceId
        };
    },

    /**
     * Verifies the OTP against stored data.
     *
     * @param {string} inputOtp - The OTP entered by user
     * @param {Object} storedOtpData - The OTP object returned by generateOtp
     * @returns {Object} { valid: boolean, reason?: string, otpMessage?:string }
     */
    verifyOtp: (inputOtp, storedOtpData) => {
        const now = Date.now();
        if (now > storedOtpData.expires_at) return {
            valid: false,
            reason: 'expired',
            otpMessage: 'OTP is expired'
        };

        if (inputOtp !== storedOtpData.otp) return {
            valid: false,
            reason: 'mismatch',
            otpMessage: 'Invalid OTP'
        };
        return { valid: true };
    },




    /**
   * Masks a mobile number by hiding the middle 6 digits.
   *
   * Example:
   * - Input: "+919876543210" → Output: "+91xxxxxx3210"
   * - Input: "9876543210" → Output: "xxxxxx3210"
   *
   * @param {string} mobile - The full mobile number, with or without country code.
   * @returns {string} - The masked mobile number.
   * @throws {Error} - If the number is invalid or too short.
   */
    maskMobileNumber(mobile) {
        if (typeof mobile !== 'string') {
            throw new Error('Mobile number must be a string.');
        }

        // Remove common formatting characters
        const sanitizedMobile = mobile.replace(/[\s\-().]/g, '');

        // Regex: Optional country code (+1 to +9999), 6 middle digits, at least 3 ending digits
        const match = sanitizedMobile.match(/^(\+\d{1,4})?(\d{6})(\d{3,})$/);

        if (!match) {
            throw new Error('Invalid mobile number format.');
        }

        const countryCode = match[1] || '';
        const lastDigits = match[3];

        return `${countryCode}xxxxxx${lastDigits}`;
    },



    /**
 * Sanitizes an Indian mobile number string.
 * - Removes spaces and formatting characters.
 * - Ensures it has +91 country code.
 * - Validates it's a proper 10-digit mobile number.
 * - Returns the format: +911234567890 (no masking)
 *
 * @param {string} mobile - The input mobile number string.
 * @returns {string} - The sanitized mobile number with +91.
 * @throws {Error} - If the number is invalid.
 */
    sanitizeMobileNumber(mobile) {
        if (typeof mobile !== 'string') {
            throw new Error('Mobile number must be a string');
        }

        // Remove common formatting characters
        let cleaned = mobile.replace(/[\s\-().]/g, '');

        // If starts with +91, remove it temporarily for validation
        if (cleaned.startsWith('+91')) {
            cleaned = cleaned.slice(3);
        }

        // After cleaning, should be exactly 10 digits
        if (!/^\d{10}$/.test(cleaned)) {
            throw new Error('Invalid mobile number: must contain exactly 10 digits');
        }

        // Return sanitized number with +91 prefix
        return `+91${cleaned}`;
    }
};

module.exports = otpManager;
