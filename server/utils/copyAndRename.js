const fs = require("fs");
const path = require("path");
require("dotenv").config();
const { v4: uuidv4 } = require("uuid");

const uploadsDir = process.env.UPLOADS_DIR;

module.exports = {
  copyAndRenamePng: (sourceFilePath) => {
    const newFilename = uuidv4() + "-" + Date.now() + ".png";

    if (!fs.existsSync(sourceFilePath)) {
      console.error(`Source file ${sourceFilePath} does not exist.`);
      return;
    }

    const newFilePath = path.join(uploadsDir, newFilename);

    // Copy the file to the new location and rename it
    fs.copyFile(sourceFilePath, newFilePath, (err) => {
      if (err) {
        console.error(`Error copying file: ${err}`);
      } else {
        console.log(`File copied successfully to ${newFilePath}`);
      }
    });
    return newFilename;
  },
};
