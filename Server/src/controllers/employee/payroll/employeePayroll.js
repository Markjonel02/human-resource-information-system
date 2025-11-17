// ==================== FILE: controllers/payroll/payrollEmployeeController.js ====================
const Payroll = require("../../../models/payroll/payrollSchema");
const fs = require("fs");
const path = require("path");

/**
 * Get all payslips for logged-in employee
 */
exports.getMyPayslips = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      year,
      status = "approved", // Only show approved by default
    } = req.query;

    // Build query - only get payslips for logged-in employee
    let query = {
      employee: req.user._id,
    };

    // Filter by status (employees should primarily see approved/paid payslips)
    if (status) {
      if (status === "all") {
        // Show all except cancelled
        query.status = { $ne: "cancelled" };
      } else {
        query.status = status;
      }
    }

    // Filter by year
    if (year) {
      const startOfYear = new Date(year, 0, 1);
      const endOfYear = new Date(year, 11, 31, 23, 59, 59);
      query["payrollPeriod.startDate"] = {
        $gte: startOfYear,
        $lte: endOfYear,
      };
    }

    const total = await Payroll.countDocuments(query);
    const payslips = await Payroll.find(query)
      .sort({ paymentDate: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .select(
        "payrollPeriod paymentDate summary status earnings deductions pdfFilename pdfPath createdAt"
      );

    return res.status(200).json({
      success: true,
      data: payslips,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalRecords: total,
      },
    });
  } catch (error) {
    console.error("Error fetching employee payslips:", error);
    return res.status(500).json({
      success: false,
      message: "Error fetching payslips",
      error: error.message,
    });
  }
};

/**
 * Get single payslip details for logged-in employee
 */
exports.getMyPayslipById = async (req, res) => {
  try {
    const { payslipId } = req.params;

    const payslip = await Payroll.findOne({
      _id: payslipId,
      employee: req.user._id, // Ensure employee can only access their own payslips
    });

    if (!payslip) {
      return res.status(404).json({
        success: false,
        message: "Payslip not found or access denied",
      });
    }

    // Only allow access to approved, processed, or paid payslips
    if (
      payslip.status !== "approved" &&
      payslip.status !== "processed" &&
      payslip.status !== "paid"
    ) {
      return res.status(403).json({
        success: false,
        message: "This payslip is not yet available for viewing",
      });
    }

    return res.status(200).json({
      success: true,
      data: payslip,
    });
  } catch (error) {
    console.error("Error fetching payslip:", error);
    return res.status(500).json({
      success: false,
      message: "Error fetching payslip",
      error: error.message,
    });
  }
};

/**
 * Download payslip PDF for logged-in employee
 */
exports.downloadMyPayslipPdf = async (req, res) => {
  try {
    const { payslipId } = req.params;

    // Find payslip and verify ownership
    const payslip = await Payroll.findOne({
      _id: payslipId,
      employee: req.user._id,
    });

    if (!payslip) {
      return res.status(404).json({
        success: false,
        message: "Payslip not found or access denied",
      });
    }

    // Only allow download of approved, processed, or paid payslips
    if (
      payslip.status !== "approved" &&
      payslip.status !== "processed" &&
      payslip.status !== "paid"
    ) {
      return res.status(403).json({
        success: false,
        message: "This payslip is not yet available for download",
      });
    }

    // Check if PDF exists
    if (payslip.pdfPath && fs.existsSync(payslip.pdfPath)) {
      const filename = `Payslip-${payslip.employeeInfo.lastname}-${
        payslip.payrollPeriod.startDate.toISOString().split("T")[0]
      }.pdf`;

      res.setHeader("Content-Type", "application/pdf");
      res.setHeader(
        "Content-Disposition",
        `attachment; filename="${filename}"`
      );

      const fileStream = fs.createReadStream(payslip.pdfPath);
      fileStream.pipe(res);
    } else {
      return res.status(404).json({
        success: false,
        message: "PDF file not found. Please contact HR.",
      });
    }
  } catch (error) {
    console.error("Error downloading payslip PDF:", error);
    return res.status(500).json({
      success: false,
      message: "Error downloading payslip PDF",
      error: error.message,
    });
  }
};

/**
 * View payslip PDF in browser for logged-in employee
 */
exports.viewMyPayslipPdf = async (req, res) => {
  try {
    const { payslipId } = req.params;

    // Find payslip and verify ownership
    const payslip = await Payroll.findOne({
      _id: payslipId,
      employee: req.user._id,
    });

    if (!payslip) {
      return res.status(404).json({
        success: false,
        message: "Payslip not found or access denied",
      });
    }

    // Only allow viewing of approved, processed, or paid payslips
    if (
      payslip.status !== "approved" &&
      payslip.status !== "processed" &&
      payslip.status !== "paid"
    ) {
      return res.status(403).json({
        success: false,
        message: "This payslip is not yet available for viewing",
      });
    }

    // Check if PDF exists
    if (payslip.pdfPath && fs.existsSync(payslip.pdfPath)) {
      res.setHeader("Content-Type", "application/pdf");
      res.setHeader("Content-Disposition", "inline");

      const fileStream = fs.createReadStream(payslip.pdfPath);
      fileStream.pipe(res);
    } else {
      return res.status(404).json({
        success: false,
        message: "PDF file not found. Please contact HR.",
      });
    }
  } catch (error) {
    console.error("Error viewing payslip PDF:", error);
    return res.status(500).json({
      success: false,
      message: "Error viewing payslip PDF",
      error: error.message,
    });
  }
};

/**
 * Get payslip summary/statistics for logged-in employee
 */
exports.getMyPayslipSummary = async (req, res) => {
  try {
    const currentYear = new Date().getFullYear();

    // Get year-to-date summary
    const ytdPayslips = await Payroll.find({
      employee: req.user._id,
      status: { $in: ["approved", "processed", "paid"] },
      "payrollPeriod.startDate": {
        $gte: new Date(currentYear, 0, 1),
        $lte: new Date(currentYear, 11, 31),
      },
    });

    // Calculate totals
    let totalGrossYTD = 0;
    let totalDeductionsYTD = 0;
    let totalNetYTD = 0;
    let totalPayslips = ytdPayslips.length;

    ytdPayslips.forEach((payslip) => {
      totalGrossYTD += payslip.summary.grossThisPay || 0;
      totalDeductionsYTD += payslip.summary.totalDeductionsThisPay || 0;
      totalNetYTD += payslip.summary.netPayThisPay || 0;
    });

    // Get latest payslip
    const latestPayslip = await Payroll.findOne({
      employee: req.user._id,
      status: { $in: ["approved", "processed", "paid"] },
    })
      .sort({ paymentDate: -1 })
      .limit(1);

    return res.status(200).json({
      success: true,
      data: {
        yearToDate: {
          year: currentYear,
          totalGross: parseFloat(totalGrossYTD.toFixed(2)),
          totalDeductions: parseFloat(totalDeductionsYTD.toFixed(2)),
          totalNet: parseFloat(totalNetYTD.toFixed(2)),
          payslipCount: totalPayslips,
        },
        latestPayslip: latestPayslip
          ? {
              _id: latestPayslip._id,
              paymentDate: latestPayslip.paymentDate,
              netPay: latestPayslip.summary.netPayThisPay,
              status: latestPayslip.status,
            }
          : null,
      },
    });
  } catch (error) {
    console.error("Error fetching payslip summary:", error);
    return res.status(500).json({
      success: false,
      message: "Error fetching payslip summary",
      error: error.message,
    });
  }
};

/**
 * Get available years with payslips for employee
 */
exports.getMyPayslipYears = async (req, res) => {
  try {
    const years = await Payroll.aggregate([
      {
        $match: {
          employee: req.user._id,
          status: { $in: ["approved", "processed", "paid"] },
        },
      },
      {
        $group: {
          _id: { $year: "$payrollPeriod.startDate" },
        },
      },
      {
        $sort: { _id: -1 },
      },
    ]);

    return res.status(200).json({
      success: true,
      data: years.map((y) => y._id),
    });
  } catch (error) {
    console.error("Error fetching payslip years:", error);
    return res.status(500).json({
      success: false,
      message: "Error fetching payslip years",
      error: error.message,
    });
  }
};

module.exports = exports;
