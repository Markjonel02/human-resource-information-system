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
  downloadPolicyByFilename, // import the new function
} = require("../../../controllers/Admin/dcuments/policiesMemo");

// =======================
// Middleware
// =======================
router.use(verifyJWT);

// =======================
// Ensure uploads directory exists
// =======================
const uploadsDir = path.join(global.uploadsDir, "policies");

if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// =======================
// Multer configuration
// =======================
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadsDir),
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `${uniqueSuffix}${ext}`);
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

// =======================
// Routes
// =======================

// Upload a policy file (Admin / HR)
router.post(
  "/upload-policy",
  authorizeRoles("admin", "hr"),
  upload.single("policyFile"), // expect field name 'policyFile' from frontend
  uploadPolicy
);

// Fetch all uploaded policies
router.get("/getall-uploaded", getAllPolicies);

// Fetch single policy by ID
router.get("/get-uploaded/:id", getPolicyById);

// View a policy PDF in browser
router.get("/view/:id", viewPolicy);

// Download a policy PDF file
router.get("/download-policy/:policyId", downloadPolicy);

// Download by filename (fallback)
router.get("/download-by-filename/:filename", downloadPolicyByFilename);

// Update policy metadata (Admin / HR)
router.put("/:id", authorizeRoles("admin", "hr"), updatePolicy);

// Delete a policy (Admin only)
router.delete("/:id", authorizeRoles("admin"), deletePolicy);

// =======================
// Export router
// =======================
module.exports = router;
