const docu = require("../../../controllers/Admin/dcuments/policiesMemo");
const express = require("express");
const router = express.Router();
const authorizeRoles = require("../../../middlewares/authorizeRole");
const verifyJWT = require("../../../middlewares/verifyJWT");
const multer = require("multer");
router.use(verifyJWT);

// Storage setup
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});
// Filter PDF only
const fileFilter = (req, file, cb) => {
  if (file.mimetype === "application/pdf") cb(null, true);
  else cb(new Error("Only PDF files are allowed!"), false);
};
const upload = multer({ storage: storage });

router.post(
  "/upload",
  upload.single("pdfFile"),
  authorizeRoles("admin", "hr"),
  docu.uploadPdf
);
router.get("/all", docu.getAllPdfs);
module.exports = router;
