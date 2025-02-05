const express = require("express");
const multer = require("multer");
const { uploadFile } = require("../services/uploadService");

const router = express.Router();

const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
    const allowedTypes = [
        'image/jpeg', 'image/png', 'image/bmp', 'image/webp', 'image/tiff', 
    ];
    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Invalid file type. Only images are allowed.'));
    }
};

const imageUpload = multer({ storage, fileFilter });

router.post("/", imageUpload.single('media'), async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ error: "No file uploaded" });
        
        const { type } = req.body;
        const fileUrl = await uploadFile(req.file, type || 'images');

        res.json({ success: true, imageUrl: fileUrl });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Error uploading file" });
    }
});

module.exports = router;
