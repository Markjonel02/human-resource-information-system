// ==================== FILE: routes/payslipAdminRoutes.js ====================
const express = require("express");
const payslipAdminController = require("../../controllers/payroll/payrollController");
const authorizeRoles = require("../../middlewares/authorizeRole");
const verifyJWT = require("../../middlewares/verifyJWT");

const router = express.Router();

// Apply JWT verification to all routes
router.use(verifyJWT);

// ==================== SEARCH ENDPOINTS ====================

/**
 * GET /api/payslip/admin/search-employees
 * Search employees by name or employee ID
 * Query params: query
 * Access: Admin, HR
 */
router.get(
  "/search-employees",
  authorizeRoles("admin", "hr"),
  payslipAdminController.searchEmployees
);

// ==================== PAYROLL PERIOD INFO ====================

/**
 * GET /api/payslip/admin/period-info
 * Get current payroll period information
 * Returns: 1-15 or 16-end of month info
 * Access: Admin, HR
 */
router.get(
  "/period-info",
  authorizeRoles("admin", "hr"),
  payslipAdminController.getPayrollPeriodInfo
);

// ==================== CREATE PAYSLIP ====================

/**
 * POST /api/payslip/admin/create
 * Create payslip manually for single employee
 * Body: {
 *   employeeId: string,
 *   customStartDate?: string,
 *   customEndDate?: string,
 *   daysWorked?: number,
 *   generalAllowance?: number,
 *   otherDeductions?: array
 * }
 * Access: Admin, HR
 */
router.post(
  "/create",
  authorizeRoles("admin", "hr"),
  payslipAdminController.createPayslipManual
);

/**
 * POST /api/payslip/admin/create-batch
 * Create payslips for multiple employees
 * Body: {
 *   employeeIds: array,
 *   customStartDate?: string,
 *   customEndDate?: string,
 *   generalAllowance?: number
 * }
 * Access: Admin, HR
 */
router.post(
  "/create-batch",
  authorizeRoles("admin", "hr"),
  payslipAdminController.createPayslipBatch
);

// ==================== VIEW PAYSLIPS ====================

/**
 * GET /api/payslip/admin/all
 * Get all payslips with filtering
 * Query params: page, limit, status, department, startDate, endDate
 * Access: Admin, HR
 */
router.get(
  "/all",
  authorizeRoles("admin", "hr"),
  payslipAdminController.getAllPayslips
);

// ==================== PDF ENDPOINTS ====================

/**
 * GET /api/payslip/admin/:payslipId/download-pdf
 * Download payslip as PDF (attachment)
 * Params: payslipId
 * Access: Admin, HR
 */
router.get(
  "/:payslipId/download-pdf",
  authorizeRoles("admin", "hr"),
  payslipAdminController.downloadPayslipPdf
);

/**
 * GET /api/payslip/admin/:payslipId/view-pdf
 * View payslip PDF in browser (inline)
 * Params: payslipId
 * Access: Admin, HR
 */
router.get(
  "/:payslipId/view-pdf",
  authorizeRoles("admin", "hr"),
  payslipAdminController.viewPayslipPdf
);
router.get(
  "/:payslipId",
  authorizeRoles("admin", "hr"),
  payslipAdminController.getPayslipById
);

/**
 * PUT /api/payslip/admin/:payslipId
 * Update/edit payslip
 */
router.put(
  "/:payslipId",
  authorizeRoles("admin", "hr"),
  payslipAdminController.updatePayslip
);

/**
 * DELETE /api/payslip/admin/:payslipId
 * Cancel/delete payslip (soft delete)
 */
router.delete(
  "/:payslipId",
  authorizeRoles("admin", "hr"),
  payslipAdminController.deletePayslip
);

/**
 * POST /api/payslip/admin/:payslipId/approve
 * Approve payslip
 */
router.post(
  "/:payslipId/approve",
  authorizeRoles("admin", "hr"),
  payslipAdminController.approvePayslip
);

router.post(
  "/bulk-approve",
  authorizeRoles("admin", "hr"),
  payslipAdminController.bulkApprovePayslips
);
module.exports = router;
