const express = require('express');
const fileUpload = require('express-fileupload');
const path = require('path');

const filesPayloadExists = require('../middleware/filePayloadExists');
const fileExtLimiter = require('../middleware/fileExtLimiter');
const fileSizeLimiter = require('../middleware/fileSizeLimiter');

const { uploadProfilePicture, getProfilePicture } = require('../controllers/profileController');

const router = express.Router();

// Route to upload profile picture
router.post(
    '/:userEmail',
    fileUpload({ createParentPath: true }),
    filesPayloadExists,
    fileExtLimiter(['.png', '.jpg', '.jpeg']),
    fileSizeLimiter,
    uploadProfilePicture
);

// Route to get the profile picture of a user
router.get('/:userEmail', getProfilePicture);

module.exports = router;
