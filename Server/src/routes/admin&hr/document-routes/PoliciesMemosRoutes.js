const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const authorizeRoles = require("../../../middlewares/authorizeRole");
const verifyJWT = require("../../../middlewares/verifyJWT");
const docu = require("../../../controllers/Admin/dcuments/policiesMemo");

router.use(verifyJWT);

// Ensure uploads directory exists - now points to root level uploads
const uploadDir = path.join(__dirname, "../../../../uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Points to root level uploads folder
    const uploadPath = path.join(__dirname, "../../../../uploads");
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

// Only allow PDF
const fileFilter = (req, file, cb) => {
  if (file.mimetype === "application/pdf") {
    cb(null, true);
  } else {
    cb(new Error("Only PDF files are allowed!"), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
});

// Routes
router.post(
  "/upload",
  authorizeRoles("admin", "hr"),
  upload.single("file"),
  docu.uploadPdf
);

router.get("/getall-uploaded", docu.getAllPdfs);
router.get("/download/:filename", docu.downloadPdf);

// Error handling middleware for multer errors
router.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === "LIMIT_FILE_SIZE") {
      return res.status(400).json({
        message: "File is too large. Maximum size is 10MB",
      });
    }
    return res.status(400).json({
      message: error.message,
    });
  } else if (error) {
    return res.status(400).json({
      message: error.message,
    });
  }
  next();
});

module.exports = router;
