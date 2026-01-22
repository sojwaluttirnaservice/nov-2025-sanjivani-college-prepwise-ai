const fs = require("fs");
const path = require("path");
const { isDevMode } = require("../checks/constants");
const config = require("../../config/config");

// Define base directory for uploads (differs for development & production)
const BASE_UPLOADS_DIR = !isDevMode() ? "uploads" : "uploads";
const BASE_PATH = "public";

/**
 * Constructs absolute directory path.
 * @param {string} relativePath - Subdirectory path within uploads.
 * @returns {string} - Full directory path.
 */
const getDirectoryPath = (relativePath) => {
  let dirPath = path.join(BASE_PATH, BASE_UPLOADS_DIR, relativePath);
  return dirPath;
};

/**
 * Constructs accessible render path (public URL).
 * @param {string} relativePath - Subdirectory path within uploads.
 * @returns {string} - Publicly accessible URL path.
 */

const SEPARATOR = path.sep;
const getRenderPath = (relativePath) => {
  let renderPath = `${SEPARATOR}${BASE_UPLOADS_DIR}${SEPARATOR}${relativePath}`;
  return renderPath;
};

/**
 * Returns structured paths for a given directory.
 * @param {string} relativePath - The subdirectory path.
 * @returns {Object} - Object containing absolute and public render paths.
 */
const constructPaths = (relativePath) => ({
  absolutePath: getDirectoryPath(relativePath),
  publicPath: getRenderPath(relativePath),
  relativePath,
});

/**
 * @typedef {Object} UploadPaths
 * @property {UploadPathStructure} prescriptions - Prescription image storage paths for prescriptions.
 */

/**
 * @typedef {Object} UploadPathStructure
 * @property {string} absolutePath - Absolute file path for storing uploads.
 * @property {string} publicPath - Publicly accessible URL for the file.
 * @property {string} relativePath - Relative path within the uploads directory.
 */

/**
 * Upload paths configuration for different types of files.
 * @type {UploadPaths}
 */

// sample
const UPLOAD_PATHS = {
  // Define upload categories here as needed for PrepWise AI
};

/**
 * Creates a directory if it does not exist.
 * @param {string} dirPath - The absolute path of the directory to create.
 */
const ensureDirectoryExists = (dirPath) => {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
};

/**
 * Ensures all required upload directories are created.
 */
const initializeUploadDirectories = () => {
  try {
    Object.values(UPLOAD_PATHS).forEach(({ absolutePath }) => {
      ensureDirectoryExists(absolutePath);
    });
    console.log(
      `✅ All required upload directories have been successfully created in ${
        isDevMode() ? "dev-uploads" : "uploads"
      }`,
    );
  } catch (error) {
    console.error(`❌ Error creating upload directories: ${error.message}`);
  }
};

/**
 * Deletes a file if it exists.
 * @param {string} deletePath - The absolute path of the file to delete.
 * @returns {Promise<boolean>} - Resolves `true` if deleted, `false` if file doesn't exist.
 */
const deleteFile = async (deletePath) => {
  try {
    if (fs.existsSync(deletePath)) {
      await fs.promises.unlink(deletePath);
      console.log(`✅ File deleted: ${deletePath}`);
      return true;
    } else {
      console.warn(`⚠️ File not found: ${deletePath}`);
      return false;
    }
  } catch (error) {
    console.error(`❌ Error deleting file: ${error.message}`);
    return false;
  }
};

/**
 * Checks if a file exists asynchronously.
 * @param {string} filePath - The absolute path of the file.
 * @returns {Promise<boolean>} - Resolves `true` if the file exists, `false` otherwise.
 */
const fileExists = async (filePath) => {
  try {
    await fs.promises.access(filePath, fs.constants.F_OK);
    return true;
  } catch (error) {
    return false;
  }
};

module.exports = {
  UPLOAD_PATHS,
  initializeUploadDirectories,
  deleteFile,
  fileExists,
  SEPARATOR,
};
