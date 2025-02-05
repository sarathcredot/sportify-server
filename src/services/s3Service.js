const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3");
const { v4: uuidv4 } = require("uuid");

const s3 = new S3Client({
    region: process.env.AWS_REGION,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    },
});

/**
 * Uploads a file to AWS S3 in the specified folder.
 * @param {File} file - The file object from Multer.
 * @param {string} folder - The folder name in S3 (e.g., "tournaments", "players").
 * @returns {string} - The file path stored in the database.
 */
const uploadFile = async (file, folder) => {
    if (!file) throw new Error("File is required");
    if (!folder) throw new Error("Folder name is required");

    const fileKey = `${folder}/${uuidv4()}-${file.originalname}`;

    const uploadParams = {
        Bucket: process.env.AWS_BUCKET_NAME,
        Key: fileKey,
        Body: file.buffer,
        ContentType: file.mimetype,
    };

    await s3.send(new PutObjectCommand(uploadParams));
    return fileKey; // Store only the file path
};

module.exports = { uploadFile };
