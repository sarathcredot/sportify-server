const express = require("express");
const multer = require("multer");
const { uploadFile } = require("../services/uploadService");
const ResponseHandler = require("../utils/responseHandler");
const {
  ALLOWED_UPLOAD_FOLDERS,
  ALLOWED_IMAGE_TYPES,
  ALLOWED_VIDEO_TYPES,
} = require("../utils/constants");

const router = express.Router();

const storage = multer.memoryStorage();

const imageFileFilter = (req, file, callback) => {
  if (ALLOWED_IMAGE_TYPES.includes(file.mimetype)) {
    callback(null, true);
  } else {
    callback(null, false, ResponseHandler.error("Invalid file type. Only images are allowed."));
  }
};

const videoFileFilter = (req, file, callback) => {
  if (ALLOWED_VIDEO_TYPES.includes(file.mimetype)) {
    callback(null, true);
  } else {
    callback(null, false, ResponseHandler.error("Invalid file type. Only videos are allowed."));
  }
};

const imageUpload = multer({ storage, fileFilter: imageFileFilter });
const videoUpload = multer({ storage, fileFilter: videoFileFilter });

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

router.post("/multiple/image", imageUpload.array("media", 10), async (req, res) => {
  try {

    if (!req.files || req.files.length === 0) {
      return res.status(400).json(
        ResponseHandler.error("No files uploaded", null, 400)
      );
    }

    const { type } = req.body;
    const uploadFolder =
      type && ALLOWED_UPLOAD_FOLDERS.includes(type) ? type : "images";

    const fileUrls = await Promise.all(
      req.files.map(file => uploadFile(file, uploadFolder))
    );

    res.json(
      ResponseHandler.success("Files uploaded successfully", { imageUrls: fileUrls })
    );
  } catch (error) {
    console.error(error);
    res.status(500).json(
      ResponseHandler.error("Error uploading files", error.message, 500)
    );
  }
});

router.post("/video", videoUpload.single("media"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json(
        ResponseHandler.error("No file uploaded", null, 400)
      );
    }

    const { type } = req.body;
    const uploadFolder =
      type && ALLOWED_UPLOAD_FOLDERS.includes(type) ? type : "videos";

    const fileUrl = await uploadFile(req.file, uploadFolder);

    res.json(
      ResponseHandler.success("File uploaded successfully", { videoUrl: fileUrl })
    );
  } catch (error) {
    console.error(error);
    res.status(500).json(
      ResponseHandler.error("Error uploading file", error.message, 500)
    );
  }
});

module.exports = router;
