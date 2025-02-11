const express = require("express");
const multer = require("multer");
const { uploadFile } = require("../services/uploadService");
const ResponseHandler = require("../utils/responseHandler");
const {
  ALLOWED_UPLOAD_FOLDERS,
  ALLOWED_IMAGE_TYPES,
} = require("../utils/constants");

const router = express.Router();

const storage = multer.memoryStorage();

const fileFilter = (req, file, callback) => {
  if (ALLOWED_IMAGE_TYPES.includes(file.mimetype)) {
    callback(null, true);
  } else {
    callback(null, false, ResponseHandler.error("Invalid file type. Only images are allowed."));
  }
};

const imageUpload = multer({ storage, fileFilter });

router.post("/", imageUpload.single("media"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json(
        ResponseHandler.error("No file uploaded", null, 400)
      );
    }

    const { type } = req.body;
    const uploadFolder =
      type && ALLOWED_UPLOAD_FOLDERS.includes(type) ? type : "images";

    const fileUrl = await uploadFile(req.file, uploadFolder);

    res.json(
      ResponseHandler.success("File uploaded successfully", { imageUrl: fileUrl })
    );
  } catch (error) {
    console.error(error);
    res.status(500).json(
      ResponseHandler.error("Error uploading file", error.message, 500)
    );
  }
});

module.exports = router;
