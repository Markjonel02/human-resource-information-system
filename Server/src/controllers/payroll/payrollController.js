// ==================== FILE: controllers/payrollController.js ====================
const Payroll = require("../../models/payroll/payrollSchema");
const PayrollHistory = require("../../models/payroll/payrollHistorySchema");
const User = require("../../models/user");
const LeaveCredits = require("../../models/LeaveSchema/leaveCreditsSchema");
const Attendance = require("../../models/attendance");
const PDFDocument = require("pdfkit");
const fs = require("fs");
const path = require("path");

// ==================== HELPER FUNCTIONS ====================

/**
 * Calculate daily rate from monthly salary
 * @param {Number} monthlySalary
 * @returns {Number} daily rate (26 working days per month)
 */
const calculateDailyRate = (monthlySalary) => {
  return monthlySalary / 26;
};

/**
 * Get attendance data for payroll period
 */
const getAttendanceData = async (employeeId, startDate, endDate) => {
  const attendanceRecords = await Attendance.find({
    employee: employeeId,
    date: {
      $gte: startDate,
      $lte: endDate,
    },
  });

  let daysPresent = 0;
  let daysAbsent = 0;
  let daysLate = 0;
  let daysOnLeave = 0;
  let totalTardinessMinutes = 0;
  let totalHoursRendered = 0;

  attendanceRecords.forEach((record) => {
    switch (record.status) {
      case "present":
        daysPresent++;
        totalHoursRendered += record.hoursRendered || 480; // 8 hours default
        break;
      case "absent":
        daysAbsent++;
        break;
      case "late":
        daysLate++;
        totalTardinessMinutes += record.tardinessMinutes || 0;
        totalHoursRendered += record.hoursRendered || 480;
        break;
      case "on_leave":
        daysOnLeave++;
        break;
    }
  });

  const totalWorkingDays = daysPresent + daysAbsent + daysLate + daysOnLeave;

  return {
    totalWorkingDays,
    daysPresent,
    daysAbsent,
    daysLate,
    daysOnLeave,
    totalTardinessMinutes,
    totalHoursRendered,
  };
};

/**
 * Calculate earnings based on attendance and salary
 */
const calculateEarnings = (
  dailyRate,
  daysPresent,
  daysOnLeave,
  daysAbsent,
  generalAllowance = 0
) => {
  const basicRegularAmount = dailyRate * daysPresent;
  const sickLeaveAmount = dailyRate * daysOnLeave; // Assuming on_leave is paid
  const absencesAmount = -dailyRate * daysAbsent; // Negative for deduction

  return {
    basicRegular: {
      unit: daysPresent,
      rate: dailyRate,
      amount: basicRegularAmount,
    },
    sickLeave: {
      unit: daysOnLeave,
      rate: dailyRate,
      amount: sickLeaveAmount,
    },
    generalAllowance: {
      amount: generalAllowance,
    },
    absences: {
      unit: daysAbsent,
      rate: dailyRate,
      amount: absencesAmount,
    },
  };
};

/**
 * Calculate deductions (SSS, PhilHealth, Pag-IBIG, Tax)
 */
const calculateDeductions = (grossPay) => {
  // Sample rates (adjust based on actual regulations)
  const sssRate = 0.045; // 4.5%
  const philhealthRate = 0.025; // 2.5%
  const pagIbigRate = 0.02; // 2%
  const taxRate = 0.12; // 12% (simplified)

  const sssDeduction = grossPay * sssRate;
  const philhealthDeduction = grossPay * philhealthRate;
  const pagIbigDeduction = grossPay * pagIbigRate;
  const taxDeduction = Math.max(0, (grossPay - sssDeduction) * taxRate);

  return {
    sss: {
      description: "Social Security System",
      deducted: Math.round(sssDeduction * 100) / 100,
      balance: Math.round(sssDeduction * 100) / 100,
    },
    philhealth: {
      description: "PhilHealth",
      deducted: Math.round(philhealthDeduction * 100) / 100,
      balance: Math.round(philhealthDeduction * 100) / 100,
    },
    pagIbig: {
      description: "Pag-IBIG",
      deducted: Math.round(pagIbigDeduction * 100) / 100,
      balance: Math.round(pagIbigDeduction * 100) / 100,
    },
    withholdingTax: {
      description: "Withholding Tax",
      deducted: Math.round(taxDeduction * 100) / 100,
    },
    otherDeductions: [],
  };
};

/**
 * Get leave credits snapshot
 */
const getLeaveCreditsSnapshot = async (employeeId, year) => {
  const leaveCredits = await LeaveCredits.findOne({
    employee: employeeId,
    year,
  });

  if (!leaveCredits) {
    return {
      VL: { total: 5, used: 0, balance: 5 },
      SL: { total: 5, used: 0, balance: 5 },
      LWOP: { total: 0, used: 0, balance: 0 },
      BL: { total: 5, used: 0, balance: 5 },
      CL: { total: 5, used: 0, balance: 5 },
    };
  }

  return leaveCredits.credits;
};

/**
 * Create payroll history record
 */
const createPayrollHistory = async (
  payrollId,
  employeeId,
  action,
  changedBy,
  previousValues = null,
  newValues = null,
  reason = null
) => {
  const history = new PayrollHistory({
    payroll: payrollId,
    employee: employeeId,
    action,
    previousValues,
    newValues,
    changedBy,
    reason,
  });

  await history.save();
  return history;
};

// ==================== MANUAL PAYROLL CREATION ====================

/**
 * Manually create payroll for a specific employee
 */
exports.createManualPayroll = async (req, res) => {
  try {
    const {
      employeeId,
      startDate,
      endDate,
      paymentDate,
      generalAllowance = 0,
      otherDeductions = [],
    } = req.body;

    // Validate input
    if (!employeeId || !startDate || !endDate || !paymentDate) {
      return res.status(400).json({
        success: false,
        message:
          "Missing required fields: employeeId, startDate, endDate, paymentDate",
      });
    }

    // Get employee
    const employee = await User.findById(employeeId);
    if (!employee) {
      return res.status(404).json({
        success: false,
        message: "Employee not found",
      });
    }

    // Get attendance data
    const attendanceData = await getAttendanceData(
      employeeId,
      new Date(startDate),
      new Date(endDate)
    );

    // Calculate daily rate
    const dailyRate = calculateDailyRate(employee.salaryRate);

    // Calculate earnings
    const earnings = calculateEarnings(
      dailyRate,
      attendanceData.daysPresent,
      attendanceData.daysOnLeave,
      attendanceData.daysAbsent,
      generalAllowance
    );

    // Calculate gross pay
    const grossPay =
      earnings.basicRegular.amount +
      earnings.sickLeave.amount +
      earnings.generalAllowance.amount +
      earnings.absences.amount;

    // Calculate deductions
    const deductions = calculateDeductions(grossPay);

    // Add other deductions
    if (otherDeductions.length > 0) {
      deductions.otherDeductions = otherDeductions;
    }

    // Calculate total deductions
    const totalDeductions =
      deductions.sss.deducted +
      deductions.philhealth.deducted +
      deductions.pagIbig.deducted +
      deductions.withholdingTax.deducted +
      otherDeductions.reduce((sum, ded) => sum + ded.amount, 0);

    // Calculate net pay
    const netPay = grossPay - totalDeductions;

    // Get leave credits snapshot
    const leaveEntitlements = await getLeaveCreditsSnapshot(
      employeeId,
      new Date(startDate).getFullYear()
    );

    // Create payroll document
    const payroll = new Payroll({
      employee: employeeId,
      employeeInfo: {
        employeeId: employee.employeeId,
        firstname: employee.firstname,
        lastname: employee.lastname,
        businessUnit: employee.businessUnit,
        department: employee.department,
        jobPosition: employee.jobposition,
        tinNumber: employee.tinNumber,
        sssNumber: employee.sssNumber,
        philhealthNumber: employee.philhealthNumber,
        pagibigNumber: employee.pagibigNumber,
      },
      payrollPeriod: {
        startDate: new Date(startDate),
        endDate: new Date(endDate),
      },
      paymentDate: new Date(paymentDate),
      basicPay: employee.salaryRate,
      earnings,
      deductions,
      summary: {
        grossThisPay: Math.round(grossPay * 100) / 100,
        totalDeductionsThisPay: Math.round(totalDeductions * 100) / 100,
        netPayThisPay: Math.round(netPay * 100) / 100,
        grossYearToDate: Math.round(grossPay * 100) / 100,
        totalDeductionsYearToDate: Math.round(totalDeductions * 100) / 100,
        netPayYearToDate: Math.round(netPay * 100) / 100,
      },
      leaveCredits: null,
      leaveEntitlements,
      attendanceSummary: attendanceData,
      status: "draft",
      approvalWorkflow: {
        submittedBy: req.user._id,
      },
    });

    await payroll.save();

    // Create history record
    await createPayrollHistory(
      payroll._id,
      employeeId,
      "created",
      req.user._id,
      null,
      { payrollPeriod: payroll.payrollPeriod, status: "draft" }
    );

    return res.status(201).json({
      success: true,
      message: "Payroll created successfully",
      data: payroll,
    });
  } catch (error) {
    console.error("Error creating manual payroll:", error);
    return res.status(500).json({
      success: false,
      message: "Error creating payroll",
      error: error.message,
    });
  }
};

// ==================== AUTOMATIC PAYROLL CREATION ====================

/**
 * Automatically create payroll for multiple employees in a period
 */
exports.createAutomaticPayroll = async (req, res) => {
  try {
    const {
      startDate,
      endDate,
      paymentDate,
      departmentFilter = null,
    } = req.body;

    // Validate input
    if (!startDate || !endDate || !paymentDate) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields: startDate, endDate, paymentDate",
      });
    }

    // Get all active employees
    let query = { employeeStatus: 1 }; // Active employees
    if (departmentFilter) {
      query.department = departmentFilter;
    }

    const employees = await User.find(query);

    if (employees.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No active employees found",
      });
    }

    const createdPayrolls = [];
    const failedPayrolls = [];

    // Create payroll for each employee
    for (const employee of employees) {
      try {
        // Get attendance data
        const attendanceData = await getAttendanceData(
          employee._id,
          new Date(startDate),
          new Date(endDate)
        );

        // Calculate daily rate
        const dailyRate = calculateDailyRate(employee.salaryRate);

        // Calculate earnings
        const earnings = calculateEarnings(
          dailyRate,
          attendanceData.daysPresent,
          attendanceData.daysOnLeave,
          attendanceData.daysAbsent,
          0
        );

        // Calculate gross pay
        const grossPay =
          earnings.basicRegular.amount +
          earnings.sickLeave.amount +
          earnings.generalAllowance.amount +
          earnings.absences.amount;

        // Calculate deductions
        const deductions = calculateDeductions(grossPay);

        // Calculate total deductions
        const totalDeductions =
          deductions.sss.deducted +
          deductions.philhealth.deducted +
          deductions.pagIbig.deducted +
          deductions.withholdingTax.deducted;

        // Calculate net pay
        const netPay = grossPay - totalDeductions;

        // Get leave credits snapshot
        const leaveEntitlements = await getLeaveCreditsSnapshot(
          employee._id,
          new Date(startDate).getFullYear()
        );

        // Create payroll document
        const payroll = new Payroll({
          employee: employee._id,
          employeeInfo: {
            employeeId: employee.employeeId,
            firstname: employee.firstname,
            lastname: employee.lastname,
            businessUnit: employee.businessUnit,
            department: employee.department,
            jobPosition: employee.jobposition,
            tinNumber: employee.tinNumber,
            sssNumber: employee.sssNumber,
            philhealthNumber: employee.philhealthNumber,
            pagibigNumber: employee.pagibigNumber,
          },
          payrollPeriod: {
            startDate: new Date(startDate),
            endDate: new Date(endDate),
          },
          paymentDate: new Date(paymentDate),
          basicPay: employee.salaryRate,
          earnings,
          deductions,
          summary: {
            grossThisPay: Math.round(grossPay * 100) / 100,
            totalDeductionsThisPay: Math.round(totalDeductions * 100) / 100,
            netPayThisPay: Math.round(netPay * 100) / 100,
            grossYearToDate: Math.round(grossPay * 100) / 100,
            totalDeductionsYearToDate: Math.round(totalDeductions * 100) / 100,
            netPayYearToDate: Math.round(netPay * 100) / 100,
          },
          leaveCredits: null,
          leaveEntitlements,
          attendanceSummary: attendanceData,
          status: "draft",
          approvalWorkflow: {
            submittedBy: req.user._id,
          },
        });

        await payroll.save();

        // Create history record
        await createPayrollHistory(
          payroll._id,
          employee._id,
          "created",
          req.user._id
        );

        createdPayrolls.push(payroll);
      } catch (employeeError) {
        failedPayrolls.push({
          employeeId: employee.employeeId,
          error: employeeError.message,
        });
      }
    }

    return res.status(201).json({
      success: true,
      message: `Payroll created for ${createdPayrolls.length} employees`,
      data: {
        created: createdPayrolls.length,
        failed: failedPayrolls.length,
        createdPayrolls,
        failedPayrolls,
      },
    });
  } catch (error) {
    console.error("Error creating automatic payroll:", error);
    return res.status(500).json({
      success: false,
      message: "Error creating payrolls",
      error: error.message,
    });
  }
};

// ==================== PDF GENERATION ====================

/**
 * Generate PDF payslip for a specific payroll
 */
exports.generatePayslipPDF = async (req, res) => {
  try {
    const { payrollId } = req.params;

    // Get payroll data
    const payroll = await Payroll.findById(payrollId).populate("employee");

    if (!payroll) {
      return res.status(404).json({
        success: false,
        message: "Payroll not found",
      });
    }

    // Create PDF document
    const doc = new PDFDocument({
      margin: 40,
      size: "A4",
    });

    // Set response headers
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="Payslip_${
        payroll.employeeInfo.employeeId
      }_${payroll.paymentDate.getFullYear()}-${String(
        payroll.paymentDate.getMonth() + 1
      ).padStart(2, "0")}.pdf"`
    );

    // Pipe to response
    doc.pipe(res);

    // Title
    doc.fontSize(16).font("Helvetica-Bold").text("PAYROLL SLIP", {
      align: "center",
    });
    doc.fontSize(10).text("", { align: "center" });

    // Company Info Section
    doc.fontSize(11).font("Helvetica-Bold").text("EMPLOYEE INFORMATION", {
      underline: true,
    });
    doc.fontSize(9).font("Helvetica");

    const employeeInfo = [
      ["Employee ID:", payroll.employeeInfo.employeeId],
      [
        "Name:",
        `${payroll.employeeInfo.firstname} ${payroll.employeeInfo.lastname}`,
      ],
      ["Position:", payroll.employeeInfo.jobPosition],
      ["Department:", payroll.employeeInfo.department],
      ["Business Unit:", payroll.employeeInfo.businessUnit],
    ];

    employeeInfo.forEach(([label, value]) => {
      doc
        .font("Helvetica-Bold")
        .text(label, 50, null, { width: 100, align: "left" })
        .moveUp()
        .font("Helvetica")
        .text(value, 150, null, { width: 300, align: "left" });
    });

    doc.moveDown();

    // Payroll Period Section
    doc.fontSize(11).font("Helvetica-Bold").text("PAYROLL PERIOD", {
      underline: true,
    });
    doc.fontSize(9).font("Helvetica");

    const periodInfo = [
      [
        "Period:",
        `${payroll.payrollPeriod.startDate.toLocaleDateString()} - ${payroll.payrollPeriod.endDate.toLocaleDateString()}`,
      ],
      ["Payment Date:", payroll.paymentDate.toLocaleDateString()],
    ];

    periodInfo.forEach(([label, value]) => {
      doc
        .font("Helvetica-Bold")
        .text(label, 50, null, { width: 100, align: "left" })
        .moveUp()
        .font("Helvetica")
        .text(value, 150, null, { width: 300, align: "left" });
    });

    doc.moveDown();

    // Earnings Section
    doc.fontSize(11).font("Helvetica-Bold").text("EARNINGS", {
      underline: true,
    });

    const earningsData = [
      ["Description", "Unit", "Rate", "Amount", { align: "right", width: 60 }],
      [
        "Basic Regular",
        payroll.earnings.basicRegular.unit,
        `₱${payroll.earnings.basicRegular.rate.toFixed(2)}`,
        `₱${payroll.earnings.basicRegular.amount.toFixed(2)}`,
      ],
      [
        "Sick Leave",
        payroll.earnings.sickLeave.unit,
        `₱${payroll.earnings.sickLeave.rate.toFixed(2)}`,
        `₱${payroll.earnings.sickLeave.amount.toFixed(2)}`,
      ],
    ];

    if (payroll.earnings.absences.amount !== 0) {
      earningsData.push([
        "Absences",
        payroll.earnings.absences.unit,
        `₱${payroll.earnings.absences.rate.toFixed(2)}`,
        `₱${payroll.earnings.absences.amount.toFixed(2)}`,
      ]);
    }

    doc.fontSize(8);
    earningsData.forEach((row, index) => {
      if (index === 0) {
        doc.font("Helvetica-Bold");
      } else {
        doc.font("Helvetica");
      }

      row.forEach((cell, colIndex) => {
        if (colIndex === 0) {
          doc.text(cell, 50, null, { width: 100 });
        } else if (colIndex === 1) {
          doc.moveUp().text(cell, 150, null, { width: 60, align: "right" });
        } else if (colIndex === 2) {
          doc.moveUp().text(cell, 210, null, { width: 70, align: "right" });
        } else {
          doc.moveUp().text(cell, 280, null, { width: 80, align: "right" });
        }
      });
      doc.moveDown();
    });

    doc.moveDown();

    // Deductions Section
    doc.fontSize(11).font("Helvetica-Bold").text("DEDUCTIONS", {
      underline: true,
    });

    const deductionsData = [
      ["Description", "Amount"],
      ["SSS", `₱${payroll.deductions.sss.deducted.toFixed(2)}`],
      ["PhilHealth", `₱${payroll.deductions.philhealth.deducted.toFixed(2)}`],
      ["Pag-IBIG", `₱${payroll.deductions.pagIbig.deducted.toFixed(2)}`],
      [
        "Withholding Tax",
        `₱${payroll.deductions.withholdingTax.deducted.toFixed(2)}`,
      ],
    ];

    doc.fontSize(8);
    deductionsData.forEach((row, index) => {
      if (index === 0) {
        doc.font("Helvetica-Bold");
      } else {
        doc.font("Helvetica");
      }

      doc.text(row[0], 50, null, { width: 200 });
      doc.moveUp().text(row[1], 300, null, { width: 80, align: "right" });
      doc.moveDown();
    });

    doc.moveDown();

    // Summary Section
    doc.fontSize(11).font("Helvetica-Bold").text("SUMMARY", {
      underline: true,
    });
    doc.fontSize(9).font("Helvetica");

    const summaryData = [
      ["Gross Pay", `₱${payroll.summary.grossThisPay.toFixed(2)}`],
      [
        "Total Deductions",
        `₱${payroll.summary.totalDeductionsThisPay.toFixed(2)}`,
      ],
      ["Net Pay", `₱${payroll.summary.netPayThisPay.toFixed(2)}`],
    ];

    summaryData.forEach(([label, value]) => {
      doc
        .font("Helvetica-Bold")
        .text(label, 50, null, { width: 200, align: "left" })
        .moveUp()
        .font("Helvetica")
        .text(value, 300, null, { width: 80, align: "right" });
    });

    doc.moveDown(2);

    // Leave Entitlements Section
    doc.fontSize(11).font("Helvetica-Bold").text("LEAVE BALANCE", {
      underline: true,
    });
    doc.fontSize(8).font("Helvetica");

    const leaveData = [
      ["Leave Type", "Entitled", "Used", "Balance"],
      [
        "Vacation Leave",
        payroll.leaveEntitlements.VL.total,
        payroll.leaveEntitlements.VL.used,
        payroll.leaveEntitlements.VL.balance,
      ],
      [
        "Sick Leave",
        payroll.leaveEntitlements.SL.total,
        payroll.leaveEntitlements.SL.used,
        payroll.leaveEntitlements.SL.balance,
      ],
    ];

    leaveData.forEach((row, index) => {
      if (index === 0) {
        doc.font("Helvetica-Bold");
      } else {
        doc.font("Helvetica");
      }

      row.forEach((cell, colIndex) => {
        if (colIndex === 0) {
          doc.text(cell, 50, null, { width: 100 });
        } else {
          doc.moveUp().text(cell, 200 + colIndex * 60, null, {
            width: 50,
            align: "right",
          });
        }
      });
      doc.moveDown();
    });

    doc.moveDown(2);

    // Footer
    doc
      .fontSize(8)
      .font("Helvetica")
      .text(
        "This is a system-generated document. For inquiries, contact your HR Department.",
        50,
        null,
        { width: 480, align: "center" }
      );

    // Finalize PDF
    doc.end();
  } catch (error) {
    console.error("Error generating PDF:", error);
    return res.status(500).json({
      success: false,
      message: "Error generating PDF",
      error: error.message,
    });
  }
};

/**
 * Generate PDF payslips for multiple employees
 */
exports.generateBulkPayslipPDF = async (req, res) => {
  try {
    const { payrollIds } = req.body;

    if (!payrollIds || payrollIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No payroll IDs provided",
      });
    }

    // Get all payrolls
    const payrolls = await Payroll.find({ _id: { $in: payrollIds } }).populate(
      "employee"
    );

    if (payrolls.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Payrolls not found",
      });
    }

    // Set response headers for ZIP or multiple PDFs
    res.setHeader("Content-Type", "application/json");

    const generatedFiles = [];

    for (const payroll of payrolls) {
      const filename = `Payslip_${
        payroll.employeeInfo.employeeId
      }_${payroll.paymentDate.getFullYear()}-${String(
        payroll.paymentDate.getMonth() + 1
      ).padStart(2, "0")}.pdf`;
      generatedFiles.push({
        filename,
        payrollId: payroll._id,
        employee: `${payroll.employeeInfo.firstname} ${payroll.employeeInfo.lastname}`,
      });
    }

    return res.status(200).json({
      success: true,
      message: `${generatedFiles.length} payslip(s) ready for download`,
      data: generatedFiles,
    });
  } catch (error) {
    console.error("Error generating bulk payslips:", error);
    return res.status(500).json({
      success: false,
      message: "Error generating payslips",
      error: error.message,
    });
  }
};

// ==================== OTHER OPERATIONS ====================

/**
 * Get payroll by ID
 */
exports.getPayroll = async (req, res) => {
  try {
    const { payrollId } = req.params;

    const payroll = await Payroll.findById(payrollId).populate("employee");

    if (!payroll) {
      return res.status(404).json({
        success: false,
        message: "Payroll not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: payroll,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error fetching payroll",
      error: error.message,
    });
  }
};

/**
 * Get payroll history
 */
exports.getPayrollHistory = async (req, res) => {
  try {
    const { payrollId } = req.params;

    const history = await PayrollHistory.find({
      payroll: payrollId,
    })
      .populate("changedBy", "firstname lastname")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      data: history,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error fetching payroll history",
      error: error.message,
    });
  }
};

/**
 * Update payroll status
 */
exports.updatePayrollStatus = async (req, res) => {
  try {
    const { payrollId } = req.params;
    const { status, approvalReason } = req.body;

    const validStatuses = [
      "draft",
      "pending",
      "approved",
      "processed",
      "paid",
      "cancelled",
    ];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status",
      });
    }

    const payroll = await Payroll.findById(payrollId);

    if (!payroll) {
      return res.status(404).json({
        success: false,
        message: "Payroll not found",
      });
    }

    const previousStatus = payroll.status;

    payroll.status = status;

    if (status === "approved") {
      payroll.approvalWorkflow.approvedBy = req.user._id;
      payroll.approvalWorkflow.approvalDate = new Date();
    }

    await payroll.save();

    // Create history record
    await createPayrollHistory(
      payrollId,
      payroll.employee,
      status,
      req.user._id,
      { status: previousStatus },
      { status: status },
      approvalReason
    );

    return res.status(200).json({
      success: true,
      message: `Payroll status updated to ${status}`,
      data: payroll,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error updating payroll status",
      error: error.message,
    });
  }
};

/**
 * Approve payroll
 */
exports.approvePayroll = async (req, res) => {
  try {
    const { payrollId } = req.params;
    const { reason } = req.body;

    const payroll = await Payroll.findById(payrollId);

    if (!payroll) {
      return res.status(404).json({
        success: false,
        message: "Payroll not found",
      });
    }

    if (payroll.status === "approved") {
      return res.status(400).json({
        success: false,
        message: "Payroll is already approved",
      });
    }

    payroll.status = "approved";
    payroll.approvalWorkflow.approvedBy = req.user._id;
    payroll.approvalWorkflow.approvalDate = new Date();

    await payroll.save();

    // Create history record
    await createPayrollHistory(
      payrollId,
      payroll.employee,
      "approved",
      req.user._id,
      null,
      { status: "approved" },
      reason
    );

    return res.status(200).json({
      success: true,
      message: "Payroll approved successfully",
      data: payroll,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error approving payroll",
      error: error.message,
    });
  }
};

/**
 * Reject payroll
 */
exports.rejectPayroll = async (req, res) => {
  try {
    const { payrollId } = req.params;
    const { reason } = req.body;

    if (!reason) {
      return res.status(400).json({
        success: false,
        message: "Rejection reason is required",
      });
    }

    const payroll = await Payroll.findById(payrollId);

    if (!payroll) {
      return res.status(404).json({
        success: false,
        message: "Payroll not found",
      });
    }

    payroll.status = "draft";
    payroll.approvalWorkflow.rejectionReason = reason;

    await payroll.save();

    // Create history record
    await createPayrollHistory(
      payrollId,
      payroll.employee,
      "rejected",
      req.user._id,
      null,
      { status: "draft" },
      reason
    );

    return res.status(200).json({
      success: true,
      message: "Payroll rejected",
      data: payroll,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error rejecting payroll",
      error: error.message,
    });
  }
};

/**
 * Get payrolls for employee (with pagination)
 */
exports.getEmployeePayrolls = async (req, res) => {
  try {
    const { employeeId } = req.params;
    const { page = 1, limit = 10, startDate, endDate } = req.query;

    let query = { employee: employeeId };

    if (startDate || endDate) {
      query["payrollPeriod.startDate"] = {};
      if (startDate) {
        query["payrollPeriod.startDate"].$gte = new Date(startDate);
      }
      if (endDate) {
        query["payrollPeriod.startDate"].$lte = new Date(endDate);
      }
    }

    const total = await Payroll.countDocuments(query);
    const payrolls = await Payroll.find(query)
      .populate("employee", "firstname lastname employeeId")
      .sort({ "payrollPeriod.startDate": -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    return res.status(200).json({
      success: true,
      data: payrolls,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalRecords: total,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error fetching employee payrolls",
      error: error.message,
    });
  }
};

/**
 * Get all payrolls for a period (with filtering)
 */
exports.getPayrollsByPeriod = async (req, res) => {
  try {
    const {
      startDate,
      endDate,
      status,
      department,
      page = 1,
      limit = 20,
    } = req.query;

    if (!startDate || !endDate) {
      return res.status(400).json({
        success: false,
        message: "startDate and endDate are required",
      });
    }

    let query = {
      "payrollPeriod.startDate": {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      },
    };

    if (status) {
      query.status = status;
    }

    if (department) {
      query["employeeInfo.department"] = department;
    }

    const total = await Payroll.countDocuments(query);
    const payrolls = await Payroll.find(query)
      .populate("employee", "firstname lastname employeeId")
      .sort({ paymentDate: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    return res.status(200).json({
      success: true,
      data: payrolls,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalRecords: total,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error fetching payrolls",
      error: error.message,
    });
  }
};

/**
 * Delete payroll (only if draft status)
 */
exports.deletePayroll = async (req, res) => {
  try {
    const { payrollId } = req.params;

    const payroll = await Payroll.findById(payrollId);

    if (!payroll) {
      return res.status(404).json({
        success: false,
        message: "Payroll not found",
      });
    }

    if (payroll.status !== "draft") {
      return res.status(400).json({
        success: false,
        message: "Only draft payrolls can be deleted",
      });
    }

    await Payroll.findByIdAndDelete(payrollId);

    // Create history record
    await createPayrollHistory(
      payrollId,
      payroll.employee,
      "deleted",
      req.user._id
    );

    return res.status(200).json({
      success: true,
      message: "Payroll deleted successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error deleting payroll",
      error: error.message,
    });
  }
};

module.exports = exports;
