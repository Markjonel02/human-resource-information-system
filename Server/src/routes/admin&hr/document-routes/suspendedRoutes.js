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

// Search employees
router.get(
  "/search-employees",
  authorizeRoles("admin", "hr"),
  suspensionController.searchEmployees
);

// Search suspensions
router.get(
  "/search",
  authorizeRoles("admin", "hr"),
  suspensionController.searchEmployeeSuspensions
);

// Get all suspensions - MUST BE BEFORE /:employeeId
router.get(
  "/suspension-all",
  authorizeRoles("admin", "hr"),
  suspensionController.getAllSuspensions
);

// Get suspensions for specific employee - GENERIC ROUTES LAST
router.get(
  "/:employeeId",
  authorizeRoles("admin", "hr"),
  suspensionController.getEmployeeSuspensions
);

// HR can only update status
router.put(
  "/update/:suspensionId",
  authorizeRoles("hr"),
  suspensionController.updateSuspensionStatus
);

// Admin can update everything
router.put(
  "/update-full/:suspensionId",
  authorizeRoles("admin"),
  suspensionController.updateSuspension
);
// Delete suspension
router.delete(
  "/delete/:suspensionId",
  authorizeRoles("admin", "hr"),
  suspensionController.deleteSuspension
);

module.exports = router;
