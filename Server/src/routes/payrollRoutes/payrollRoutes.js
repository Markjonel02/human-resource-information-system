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
 * GET /api/payslip/admin/search/employees
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
router.get(
  "/payslip/:payslipId/download",
  authorizeRoles("admin", "hr"),
  payslipAdminController.downloadPayslipPdf
);

module.exports = router;
