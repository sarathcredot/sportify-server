

const express = require('express');
const validate = require('../../utils/validate');
const { createClipboardSchema } = require('../../schemas/clipboardSchema');
const ClipboardController = require('../../controllers/clipboardController');

const router = express.Router();
const clipboardController = new ClipboardController();




router.get(
    '/',
    clipboardController.getAllClipBoards
);


module.exports =router