const { v4: uuidv4 } = require("uuid");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

/**
 * Uploads a file to a specified upload folder.
 * @param {File} file - The file object from Multer.
 * @param {string} folder - The folder name (e.g., "tournaments", "players").
 * @returns {string} - The file path stored in the database.
 */
const uploadFile = async (file, folder) => {
    if (!file) throw new Error("File is required");
    if (!folder) throw new Error("Folder name is required");

    // const uploadDir = path.join(__dirname, '..', '..', 'uploads', folder);
    const uploadDir = path.resolve('uploads', folder);
    if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
    }

    const fileKey = `${uuidv4()}-${file.originalname}`;
    const filePath = path.join(uploadDir, fileKey);

    return fileKey;
};

module.exports = { uploadFile };
