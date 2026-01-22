const path = require("path");
const { generateFileName } = require("./generateFileName");


/**
 * @typedef {Object} ProcessedFileData
 * @property {string} image_name - Formatted file name (for storage).
 * @property {string} storage_type - Storage location (e.g., local, aws_s3).
 * @property {string} file_name - Original uploaded file name.
 * @property {number} file_size - Size of the file in bytes.
 * @property {string} file_type - MIME type of the file (e.g., image/png).
 */

/**
 * Processes file metadata before saving to the database.
 * @param {Express.Multer.File} file - The uploaded file object from Multer.
 * @param {string} storageType - Storage location (default: "local").
 * @returns {ProcessedFileData} - Processed file metadata.
 */
const processFileData = (file, storageType = "local") => {
    if (!file) throw new Error("No file provided");

    return {
        image_name: generateFileName(file), // Formatted name from multer
        storage_type: storageType,
        file_name: file.originalname, // Original uploaded file name
        file_size: file.size, // File size in bytes
        file_type: file.mimetype, // MIME type of the file
    };
};

module.exports = { processFileData };
