const multer = require("multer");

const storage = multer.memoryStorage();

exports.uploader = multer({ storage });
