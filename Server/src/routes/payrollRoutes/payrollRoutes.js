// ==================== FILE: routes/payrollRoutes.js ====================
const express = require("express");
const payrollController = require("../../controllers/payroll/payrollController");
const authorizeRoles = require("../../middlewares/authorizeRole");
const verifyJWT = require("../../middlewares/verifyJWT");

const router = express.Router();

// Apply JWT verification to all routes
router.use(verifyJWT);

// ==================== AUTO RELEASE ENDPOINTS ====================

/**
 * GET /api/payroll/release-date/next
 * Get next payroll release date (considering weekends and holidays)
 */
router.get("/release-date/next", payrollController.getNextPayrollReleaseDate);

/**
 * POST /api/payroll/auto-release
 * Manually trigger auto payroll release (Admin only)
 */
router.post(
  "/auto-release",
  authorizeRoles("admin", "hr"),
  payrollController.autoReleasePayroll
);

// ==================== PAYROLL CREATION ====================

/**
 * POST /api/payroll/manual
 * Manually create payroll for a specific employee
 * Body: { employeeId, startDate, endDate, paymentDate, generalAllowance?, otherDeductions? }
 */
router.post(
  "/manual",
  authorizeRoles("admin", "hr"),
  payrollController.createManualPayroll
);

/**
 * POST /api/payroll/automatic
 * Automatically create payroll for multiple employees in a period
 * Body: { startDate, endDate, paymentDate, departmentFilter? }
 */
router.post(
  "/automatic",
  authorizeRoles("admin", "hr"),
  payrollController.createAutomaticPayroll
);

// ==================== PDF GENERATION ====================

/**
 * POST /api/payroll/bulk-pdf
 * Generate multiple payslips
 * Body: { payrollIds: [id1, id2, ...] }
 * NOTE: Must come before /:payrollId routes to avoid conflicts
 */
router.post("/bulk-pdf", payrollController.generateBulkPayslipPDF);

/**
 * GET /api/payroll/:payrollId/pdf
 * Generate and download single payslip PDF
 */
router.get("/:payrollId/pdf", payrollController.generatePayslipPDF);

// ==================== PAYROLL RETRIEVAL ====================

/**
 * GET /api/payroll/period/list
 * Get all payrolls for a period with filters
 * Query params: startDate, endDate, status, department, page, limit
 * NOTE: Must come before /:payrollId routes to avoid conflicts
 */
router.get("/period/list", payrollController.getPayrollsByPeriod);

/**
 * GET /api/payroll/employee/:employeeId
 * Get all payrolls for an employee
 * Query params: page, limit, startDate, endDate
 * NOTE: Must come before /:payrollId routes to avoid conflicts
 */
router.get("/employee/:employeeId", payrollController.getEmployeePayrolls);

/**
 * GET /api/payroll/:payrollId/history
 * Get payroll history/audit trail
 */
router.get("/:payrollId/history", payrollController.getPayrollHistory);

/**
 * GET /api/payroll/:payrollId
 * Get specific payroll details
 */
router.get("/:payrollId", payrollController.getPayroll);

// ==================== PAYROLL MANAGEMENT ====================

/**
 * PATCH /api/payroll/:payrollId/status
 * Update payroll status
 * Body: { status, approvalReason? }
 */
router.patch(
  "/:payrollId/status",
  authorizeRoles("admin", "hr"),
  payrollController.updatePayrollStatus
);

/**
 * PATCH /api/payroll/:payrollId/approve
 * Approve payroll
 * Body: { reason? }
 */
router.patch(
  "/:payrollId/approve",
  authorizeRoles("admin", "hr"),
  payrollController.approvePayroll
);

/**
 * PATCH /api/payroll/:payrollId/reject
 * Reject payroll
 * Body: { reason }
 */
router.patch(
  "/:payrollId/reject",
  authorizeRoles("admin", "hr"),
  payrollController.rejectPayroll
);

/**
 * DELETE /api/payroll/:payrollId
 * Delete payroll (only draft status)
 */
router.delete(
  "/:payrollId",
  authorizeRoles("admin", "hr"),
  payrollController.deletePayroll
);

module.exports = router;
