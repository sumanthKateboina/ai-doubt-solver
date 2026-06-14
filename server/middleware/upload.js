const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Ensure uploads directory exists
const uploadDir = path.join(__dirname, "../uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    // Add extension, default to .webm if file lacks extension (for raw blobs)
    let ext = path.extname(file.originalname);
    if (!ext) {
      if (file.mimetype.includes("audio")) {
        ext = ".webm";
      } else if (file.mimetype.includes("image")) {
        ext = ".png";
      }
    }
    cb(null, uniqueSuffix + ext);
  },
});

const fileFilter = (req, file, cb) => {
  // Allow images and audio files
  const allowedExtensions = /jpeg|jpg|png|webp|gif|webm|mp3|wav|m4a|ogg|3gp|opus/;
  const allowedMimeTypes = /image|audio/;

  const extname = allowedExtensions.test(
    path.extname(file.originalname).toLowerCase()
  ) || !path.extname(file.originalname); // Allow files without extensions (recorded audio blobs)
  
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
