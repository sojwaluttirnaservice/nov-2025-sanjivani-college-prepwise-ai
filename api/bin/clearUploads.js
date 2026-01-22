const fs = require("fs");
const path = require("path");
const { UPLOAD_PATHS } = require("../utils/files/filePaths");

/**
 * Deletes all files inside the given directory without deleting the folder itself.
 * @param {string} directoryPath - The absolute path of the directory.
 */
const clearDirectory = (directoryPath) => {
    try {
        if (!fs.existsSync(directoryPath)) {
            console.log(`⚠️ Directory does not exist: ${directoryPath}`);
            return;
        }

        const files = fs.readdirSync(directoryPath);
        files.forEach((file) => {
            const filePath = path.join(directoryPath, file);
            fs.unlinkSync(filePath); // Delete each file
        });

        console.log(`✅ Cleared files from: ${directoryPath}`);
    } catch (error) {
        console.error(`❌ Error clearing directory (${directoryPath}): ${error.message}`);
    }
};

/**
 * Clears files from all directories inside UPLOAD_PATHS.
 */
const clearAllUploadDirectories = () => {
    Object.values(UPLOAD_PATHS).forEach(({ absolutePath }) => {
        clearDirectory(absolutePath);
    });
    console.log("🚀 All upload directories have been cleared successfully!");
};


clearAllUploadDirectories()

module.exports = { clearAllUploadDirectories };
