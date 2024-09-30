// eslint-disable-next-line import/no-extraneous-dependencies
const multer = require('multer');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
require('dotenv').config();
const { logger } = require('../logger');

const uploadsDir = process.env.UPLOADS_DIR;
if (!fs.existsSync(uploadsDir)){
    fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, uploadsDir); // Make sure this folder exists
    },
    filename: function(req, file, cb) {
        logger.info(file);
        const fileExtension = file.originalname.split('.').pop();
        const newFilename = uuidv4() + '-' + Date.now() + '.' + fileExtension;  // Ensures a unique filename
        cb(null, newFilename);
    }
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 50 * 1024 * 1024 }
});

const deleteUploadedFiles = (files) => {
    files.forEach((file) => {
        fs.unlinkSync(uploadsDir + '/' + file);
    });
}

module.exports = {upload, deleteUploadedFiles};
