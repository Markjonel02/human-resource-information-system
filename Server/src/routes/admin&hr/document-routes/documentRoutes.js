const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const authorizeRoles = require("../../../middlewares/authorizeRole");
const verifyJWT = require("../../../middlewares/verifyJWT");
const docu = require("../../../controllers/Admin/dcuments/policiesMemo");

router.use(verifyJWT);

// Ensure uploads directory exists
const uploadDir = path.join(__dirname, "../../../uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, "../../uploads"); // points to src/uploads
    if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

// Only allow PDF
const fileFilter = (req, file, cb) => {
  if (file.mimetype === "application/pdf") cb(null, true);
  else cb(new Error("Only PDF files are allowed!"), false);
};

const upload = multer({ storage, fileFilter });

// Routes
router.post(
  "/upload",
  authorizeRoles("admin", "hr"),
  upload.single("file"), // Must match frontend field name
  docu.uploadPdf
);

router.get("/getall-uploaded", docu.getAllPdfs);
router.get("/download/:filename", docu.downloadPdf);
module.exports = router;
