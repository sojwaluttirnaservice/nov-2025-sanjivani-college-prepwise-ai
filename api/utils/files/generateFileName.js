const path = require("path");

/**
 * Generates a safe, unique filename for Multer uploads.
 *
 * @param {Object} file - Multer file object
 * @param {string} [prefix=''] - Optional filename prefix
 * @returns {string} Generated filename
 */
const generateFileName = (file, prefix = "") => {
  // originalname works with multer
  if (!file || !file.originalname) {
    throw new Error("Valid Multer file object with originalname is required");
  }

  let letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";

  // Generate 1–10 random letters
  const charCount = Math.floor(Math.random() * 10) + 1;
  let charSeq = "";
  for (let i = 0; i < charCount; i++) {
    charSeq += letters[Math.floor(Math.random() * letters.length)];
  }

  // Generate 1–10 random digits
  const digitCount = Math.floor(Math.random() * 10) + 1;
  const numSeq = Math.floor(Math.random() * Math.pow(10, digitCount))
    .toString()
    .padStart(digitCount, "0");

  // Random 6-digit number
  const randomNum = Math.floor(Math.random() * 900000) + 100000;

  // Timestamp
  const timestamp = Date.now();

  // ✅ Correct: extract extension from originalname
  const extension = path.extname(file.originalname).toLowerCase();

  return `${prefix}${charSeq}${numSeq}_${randomNum}_${timestamp}${extension}`;
};

module.exports = { generateFileName };
