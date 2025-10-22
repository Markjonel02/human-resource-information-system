// routes/Admin/documents/policyRoutes.js
const express = require("express");
const router = express.Router();
const authorizeRoles = require("../../../middlewares/authorizeRole");
const verifyJWT = require("../../../middlewares/verifyJWT");
const {
  uploadPolicy,
  getAllPolicies,
  getPolicyById,
  downloadPolicy,
  updatePolicy,
  deletePolicy,
  upload,
} = require("../../../controllers/Admin/dcuments/policiesMemo");
router.use(verifyJWT);
// Upload policy (PDF only)
router.post(
  "/upload",
  upload.single("file"),
  authorizeRoles("hr", "admin"),
  uploadPolicy
);

// Get all policies
router.get("/get-policy", getAllPolicies);

// Get single policy by ID
router.get("/:id", authorizeRoles("hr", "admin"), getPolicyById);

// Download policy PDF
router.get("/:id/download", authorizeRoles("hr", "admin"), downloadPolicy);

// Update policy metadata (title, description)
router.put("/:id", authorizeRoles("hr", "admin"), updatePolicy);

// Delete policy
router.delete("/:id", authorizeRoles("hr", "admin"), deletePolicy);

module.exports = router;
