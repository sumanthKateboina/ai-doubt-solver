const multer = require("multer");

// Use memory storage for serverless environments (like Vercel)
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  // Allow images and audio files
  const allowedExtensions = /jpeg|jpg|png|webp|gif|webm|mp3|wav|m4a|ogg|3gp|opus/;
  const allowedMimeTypes = /image|audio/;

  const extname = allowedExtensions.test(file.originalname.toLowerCase()) || !file.originalname;
  const mimetype = allowedMimeTypes.test(file.mimetype);

  if (extname && mimetype) {
    cb(null, true);
  } else {
    cb(new Error("Only images and audio files are allowed!"));
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
});

module.exports = upload;
