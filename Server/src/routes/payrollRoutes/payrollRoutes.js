// ==================== FILE: routes/payrollRoutes.js ====================
const express = require("express");
const payrollController = require("../../controllers/payroll/payrollController");
const authoorizeRoles = require("../../middlewares/authorizeRole");
const verifyJWT = require("../../middlewares/verifyJWT");
const router = express.Router();

router.use(verifyJWT);

// ==================== PAYROLL CREATION ====================

/**
 * POST /api/payroll/manual
 * Manually create payroll for a specific employee
 * Body: { employeeId, startDate, endDate, paymentDate, generalAllowance?, otherDeductions? }
 */
router.post(
  "/manual",
  authoorizeRoles("admin"),
  payrollController.createManualPayroll
);

/**
 * POST /api/payroll/automatic
 * Automatically create payroll for multiple employees in a period
 * Body: { startDate, endDate, paymentDate, departmentFilter? }
 */
router.post(
  "/automatic",
  authoorizeRoles("admin", "hr"),
  payrollController.createAutomaticPayroll
);

// ==================== PDF GENERATION ====================

/**
 * GET /api/payroll/:payrollId/pdf
 * Generate and download single payslip PDF
 */
router.get(
  "/:payrollId/pdf",
  authoorizeRoles,
  payrollController.generatePayslipPDF
);

/**
 * POST /api/payroll/bulk-pdf
 * Generate multiple payslips
 * Body: { payrollIds: [id1, id2, ...] }
 */
router.post(
  "/bulk-pdf",
  authoorizeRoles,
  payrollController.generateBulkPayslipPDF
);

// ==================== PAYROLL RETRIEVAL ====================

/**
 * GET /api/payroll/:payrollId
 * Get specific payroll details
 */
router.get("/:payrollId", authoorizeRoles, payrollController.getPayroll);

/**
 * GET /api/payroll/employee/:employeeId
 * Get all payrolls for an employee
 * Query params: page, limit, startDate, endDate
 */
router.get(
  "/employee/:employeeId",
  authoorizeRoles,
  payrollController.getEmployeePayrolls
);

/**
 * GET /api/payroll/period/list
 * Get all payrolls for a period with filters
 * Query params: startDate, endDate, status, department, page, limit
 */
router.get(
  "/period/list",
  authoorizeRoles,
  payrollController.getPayrollsByPeriod
);

/**
 * GET /api/payroll/:payrollId/history
 * Get payroll history/audit trail
 */
router.get(
  "/:payrollId/history",
  authoorizeRoles,
  payrollController.getPayrollHistory
);

// ==================== PAYROLL MANAGEMENT ====================

/**
 * PATCH /api/payroll/:payrollId/status
 * Update payroll status
 * Body: { status, approvalReason? }
 */
router.patch(
  "/:payrollId/status",
  authoorizeRoles,
  payrollController.updatePayrollStatus
);

/**
 * PATCH /api/payroll/:payrollId/approve
 * Approve payroll
 * Body: { reason? }
 */
router.patch(
  "/:payrollId/approve",
  authoorizeRoles,
  payrollController.approvePayroll
);

/**
 * PATCH /api/payroll/:payrollId/reject
 * Reject payroll
 * Body: { reason }
 */
router.patch(
  "/:payrollId/reject",
  authoorizeRoles,
  payrollController.rejectPayroll
);

/**
 * DELETE /api/payroll/:payrollId
 * Delete payroll (only draft status)
 */
router.delete("/:payrollId", authoorizeRoles, payrollController.deletePayroll);

module.exports = router;
