const multer = require("multer");
const path = require("path");
const { generateFileName } = require("../utils/files/generateFileName");

/**
 * Configures Multer for dynamic storage and strict file type validation.
 * Throws meaningful errors if something goes wrong.
 *
 * @param {string} destPath - Destination folder for file storage.
 * @returns {import("multer").Multer} - Multer instance with configured storage.
 */
const configureMulter = (destPath) => {
  const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      try {
        cb(null, destPath);
      } catch (err) {
        cb(new Error("Failed to set destination folder."), null);
      }
    },
    filename: (req, file, cb) => {
      try {
        const generatedName = generateFileName(file);
        cb(null, generatedName);
      } catch (err) {
        console.log(err);
        cb(new Error(`Failed to generate filename: ${err.message}`), null);
      }
    },
  });

  // ✅ Allow images, documents, and videos
  const allowedMimeTypes = [
    "image/jpeg",
    "image/png",
    "image/gif",
    "image/webp",
    "image/svg+xml",
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/vnd.ms-excel",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    "application/vnd.ms-powerpoint",
    "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    "text/plain",
    // 🚀 Video MIME types
    "video/mp4", // MP4 video format
    "video/webm", // WebM video format
    "video/ogg", // Ogg video format
    "video/avi", // AVI video format
    "video/mkv", // MKV video format
  ];

  const fileFilter = (req, file, cb) => {
    if (allowedMimeTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      // ❌ Throw an error that will be caught by Multer's middleware
      cb(new Error(`File type '${file.mimetype}' is not allowed.`), false);
    }
  };

  const limits = (file) => {
    // Set different size limits based on file type
    switch (file.mimetype) {
      case "video/mp4":
      case "video/webm":
      case "video/ogg":
      case "video/avi":
      case "video/mkv":
        return { fileSize: 100 * 1024 * 1024 }; // 100 MB for videos
      case "application/pdf":
      case "application/msword":
      case "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
      case "application/vnd.ms-excel":
      case "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet":
      case "application/vnd.ms-powerpoint":
      case "application/vnd.openxmlformats-officedocument.presentationml.presentation":
        return { fileSize: 10 * 1024 * 1024 }; // 10 MB for documents/PDFs
      case "image/jpeg":
      case "image/png":
      case "image/gif":
      case "image/webp":
      case "image/svg+xml":
        return { fileSize: 5 * 1024 * 1024 }; // 5 MB for images
      default:
        return { fileSize: 5 * 1024 * 1024 }; // Default to 5 MB for other file types
    }
  };

  return multer({
    storage,
    fileFilter,
    limits: (req, file, cb) => {
      const fileLimit = limits(file);
      cb(null, fileLimit);
    },
  });
};

module.exports = configureMulter;
