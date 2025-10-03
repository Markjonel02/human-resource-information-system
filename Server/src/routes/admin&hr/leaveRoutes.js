const express = require("express");
const router = express.Router();

// Middlewares
const verifyJWT = require("../../middlewares/verifyJWT");
const authorizeRoles = require("../../middlewares/authorizeRole");
const Leave = require("../../controllers/Admin/leaveController");




router.use(verifyJWT);
// ============ LEAVES ============
router.post(
  "/approve-leave/:id",
  authorizeRoles("admin", "hr"),
  Leave.approveLeave
);

// Approve multiple leaves in bulk (Admin only)
router.post(
  "/approve-leave-bulk",
  authorizeRoles("admin", "hr"),
  Leave.approveLeaveBulk
);

router.get(
  "/get-leave-requests",
  authorizeRoles("admin", "hr"),
  Leave.getAllEmployeeLeave
);

router.get(
  "/get-leave-breakdown",
  authorizeRoles("admin", "hr"),
  Leave.getLeaveBreakdown
);

router.post(
  "/reject-leave/:id",
  authorizeRoles("admin", "hr"),
  Leave.rejectLeave
);

router.post(
  "/reject-leave-bulk",
  authorizeRoles("admin", "hr"),
  Leave.rejectLeaveBulk
);
router.get(
  "/search-employees",
  authorizeRoles("admin", "hr"),
  Leave.searchEmployees
);
// ============ END OF LEAVES ============



module.exports = router;