// routes/Admin/documents/policyRoutes.js
const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const authorizeRoles = require("../../../middlewares/authorizeRole");
const verifyJWT = require("../../../middlewares/verifyJWT");
const {
  uploadPolicy,
  getAllPolicies,
  getPolicyById,
  downloadPolicy,
  viewPolicy,
  updatePolicy,
  deletePolicy,
} = require("../../../controllers/Admin/dcuments/policiesMemo");

router.use(verifyJWT);

// === Ensure uploads directory exists ===
const uploadsDir = global.uploadsDir;

if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// === Multer config ===
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadsDir),
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype === "application/pdf") cb(null, true);
  else cb(new Error("Only PDF files are allowed"), false);
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
});

// === Routes ===

// Upload policy (Admin, HR)
router.post(
  "/upload-policy",
  verifyJWT,
  authorizeRoles("admin", "hr"),
  upload.single("policyFile"),
  uploadPolicy
);

// Get all policies
router.get("/getall-uploaded", verifyJWT, getAllPolicies);

// Get single policy
router.get("/get-uploaded/:id", verifyJWT, getPolicyById);

// View policy in browser
router.get("/view/:id", verifyJWT, viewPolicy);

// Download policy
router.get("/download-policy/:policyId", downloadPolicy);

// Update policy details (Admin, HR)
router.put("/:id", verifyJWT, authorizeRoles("admin", "hr"), updatePolicy);

// Delete policy (Admin only)
router.delete("/:id", verifyJWT, authorizeRoles("admin"), deletePolicy);

module.exports = router;
