// ==================== FILE: routes/payrollEmployeeRoutes.js ====================
const express = require("express");
const payrollEmployeeController = require("../../controllers/employee/payroll/employeePayroll");
const verifyJWT = require("../../middlewares/verifyJWT");

const router = express.Router();

// Apply JWT verification to all routes
router.use(verifyJWT);

// ==================== EMPLOYEE PAYSLIP ENDPOINTS ====================

/**
 * GET /api/payroll/employee/my-payslips
 * Get all payslips for logged-in employee
 * Query params: page, limit, year, status
 * Access: Authenticated Employee
 */
router.get("/my-payslips", payrollEmployeeController.getMyPayslips);

/**
 * GET /api/payroll/employee/my-payslips/:payslipId
 * Get single payslip details
 * Access: Authenticated Employee (own payslips only)
 */
router.get(
  "/my-payslips/:payslipId",
  payrollEmployeeController.getMyPayslipById
);

/**
 * GET /api/payroll/employee/my-payslips/:payslipId/download-pdf
 * Download payslip PDF
 * Access: Authenticated Employee (own payslips only)
 */
router.get(
  "/my-payslips/:payslipId/download-pdf",
  payrollEmployeeController.downloadMyPayslipPdf
);

/**
 * GET /api/payroll/employee/my-payslips/:payslipId/view-pdf
 * View payslip PDF in browser
 * Access: Authenticated Employee (own payslips only)
 */
router.get(
  "/my-payslips/:payslipId/view-pdf",
  payrollEmployeeController.viewMyPayslipPdf
);

/**
 * GET /api/payroll/employee/summary
 * Get payslip summary/statistics
 * Access: Authenticated Employee
 */
router.get("/summary", payrollEmployeeController.getMyPayslipSummary);

/**
 * GET /api/payroll/employee/years
 * Get available years with payslips
 * Access: Authenticated Employee
 */
router.get("/years", payrollEmployeeController.getMyPayslipYears);

module.exports = router;
