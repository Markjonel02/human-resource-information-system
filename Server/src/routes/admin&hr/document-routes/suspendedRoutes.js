const express = require("express");
const router = express.Router();

const VerifyJWT = require("../../../middlewares/verifyJWT");
const authorizeRoles = require("../../../middlewares/authorizeRole");
const suspensionController = require("../../../controllers/Admin/dcuments/suspendedContorller");

// Apply JWT verification to all routes
router.use(VerifyJWT);

/**
 * @route   GET /api/suspension/all-suspension
 * @desc    Get all suspensions
 * @access  Private (Admin/HR)
 */
router.get(
  "/all-suspension",
  authorizeRoles("admin", "hr"),
  suspensionController.getAllSuspensions
);
router.post(
  "/create",
  authorizeRoles("admin", "hr"),
  suspensionController.createSuspension
);

router.put(
  "/:id",
  authorizeRoles("admin", "hr"),
  suspensionController.updateSuspension
);

/**
 * @route   GET /api/suspension/employee/:employeeId
 * @desc    Get all suspensions for a specific employee
 * @access  Private
 */
router.get(
  "/employee/:employeeId",
  suspensionController.getSuspensionsByEmployee
);

/**
 * @route   GET /api/suspension/:id
 * @desc    Get suspension by ID
 * @access  Private
 */
router.get("/:id", suspensionController.getSuspensionById);

/**
 * @route   POST /api/suspension/create-suspension
 * @desc    Create a new suspension record
 * @access  Private (Admin/HR)
 */
router.post(
  "/create-suspension",
  authorizeRoles("admin", "hr"),
  suspensionController.createSuspension
);

/**
 * @route   PUT /api/suspension/edit-suspension/:id
 * @desc    Update a suspension record
 * @access  Private (Admin/HR)
 */
router.put(
  "/edit-suspension/:id",
  authorizeRoles("admin", "hr"),
  suspensionController.updateSuspension
);

/**
 * @route   DELETE /api/suspension/delete-suspension/:id
 * @desc    Delete a suspension record
 * @access  Private (Admin/HR)
 */
router.delete(
  "/delete-suspension/:id",
  authorizeRoles("admin", "hr"),
  suspensionController.deleteSuspension
);

module.exports = router;
