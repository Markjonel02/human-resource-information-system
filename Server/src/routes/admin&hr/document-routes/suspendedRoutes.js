const express = require("express");
const router = express.Router();

const VerifyJWT = require("../../../middlewares/verifyJWT");
const authorizeRoles = require("../../../middlewares/authorizeRole");
const suspensionController = require("../../../controllers/Admin/dcuments/suspendedContorller");

// Apply JWT verification to all routes
router.use(VerifyJWT);

// Create suspension
router.post(
  "/create",
  authorizeRoles("admin", "hr"),
  suspensionController.createSuspension
);

// Search suspensions
router.get(
  "/search",
  authorizeRoles("admin", "hr"),
  suspensionController.searchEmployeeSuspensions
);

// Search employees
router.get(
  "/search-employees",
  authorizeRoles("admin", "hr"),
  suspensionController.searchEmployees
);

// Get suspensions for specific employee
router.get(
  "/:employeeId",
  authorizeRoles("admin", "hr"),
  suspensionController.getEmployeeSuspensions
);

// Update suspension status
router.put(
  "/update/:suspensionId",
  authorizeRoles("admin", "hr"),
  suspensionController.updateSuspensionStatus
);

// Delete suspension
router.delete("/delete/:suspensionId", suspensionController.deleteSuspension);

module.exports = router;
