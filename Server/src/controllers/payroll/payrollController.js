// ==================== FILE: controllers/payslip/payslipAdminController.js ====================
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
 * Get days in month
 */
const getDaysInMonth = (date) => {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
};

/**
 * Get current payroll period (1-15 or 16-end of month)
 */
const getCurrentPayrollPeriod = () => {
  const today = new Date();
  const dayOfMonth = today.getDate();
  const daysInMonth = getDaysInMonth(today);

  let startDate, endDate, periodLabel;

  if (dayOfMonth >= 1 && dayOfMonth <= 15) {
    startDate = new Date(today.getFullYear(), today.getMonth(), 1);
    endDate = new Date(today.getFullYear(), today.getMonth(), 15);
    periodLabel = "1-15";
  } else {
    startDate = new Date(today.getFullYear(), today.getMonth(), 16);
    endDate = new Date(today.getFullYear(), today.getMonth(), daysInMonth);
    periodLabel = `16-${daysInMonth}`;
  }

  return { startDate, endDate, periodLabel, daysInMonth };
};

/**
 * Calculate daily rate from monthly salary
 */
const calculateDailyRate = (monthlySalary) => {
  return monthlySalary / 26;
};

/**
 * Get attendance data for payroll period
 */
const getAttendanceData = async (employeeId, startDate, endDate) => {
  try {
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
          totalHoursRendered += record.hoursRendered || 480;
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

    return {
      totalWorkingDays: daysPresent + daysAbsent + daysLate + daysOnLeave,
      daysPresent,
      daysAbsent,
      daysLate,
      daysOnLeave,
      totalTardinessMinutes,
      totalHoursRendered,
    };
  } catch (error) {
    console.error("Error getting attendance data:", error);
    return {
      totalWorkingDays: 0,
      daysPresent: 0,
      daysAbsent: 0,
      daysLate: 0,
      daysOnLeave: 0,
      totalTardinessMinutes: 0,
      totalHoursRendered: 0,
    };
  }
};

/**
 * Calculate earnings
 */
const calculateEarnings = (
  dailyRate,
  daysPresent,
  daysOnLeave,
  daysAbsent,
  generalAllowance = 0
) => {
  const basicRegularAmount = dailyRate * daysPresent;
  const sickLeaveAmount = dailyRate * daysOnLeave;
  const absencesAmount = -dailyRate * daysAbsent;

  return {
    basicRegular: {
      unit: daysPresent,
      rate: parseFloat(dailyRate.toFixed(2)),
      amount: parseFloat(basicRegularAmount.toFixed(2)),
    },
    sickLeave: {
      unit: daysOnLeave,
      rate: parseFloat(dailyRate.toFixed(2)),
      amount: parseFloat(sickLeaveAmount.toFixed(2)),
    },
    generalAllowance: {
      amount: parseFloat(generalAllowance.toFixed(2)),
    },
    absences: {
      unit: daysAbsent,
      rate: parseFloat(dailyRate.toFixed(2)),
      amount: parseFloat(absencesAmount.toFixed(2)),
    },
  };
};

/**
 * Calculate deductions
 */
const calculateDeductions = (grossPay) => {
  const sssRate = 0.045;
  const philhealthRate = 0.025;
  const pagIbigRate = 0.02;
  const taxRate = 0.12;

  const sssDeduction = grossPay * sssRate;
  const philhealthDeduction = grossPay * philhealthRate;
  const pagIbigDeduction = grossPay * pagIbigRate;
  const taxDeduction = Math.max(0, (grossPay - sssDeduction) * taxRate);

  return {
    sss: {
      description: "Social Security System",
      deducted: parseFloat((Math.round(sssDeduction * 100) / 100).toFixed(2)),
      balance: parseFloat((Math.round(sssDeduction * 100) / 100).toFixed(2)),
    },
    philhealth: {
      description: "PhilHealth",
      deducted: parseFloat(
        (Math.round(philhealthDeduction * 100) / 100).toFixed(2)
      ),
      balance: parseFloat(
        (Math.round(philhealthDeduction * 100) / 100).toFixed(2)
      ),
    },
    pagIbig: {
      description: "Pag-IBIG",
      deducted: parseFloat(
        (Math.round(pagIbigDeduction * 100) / 100).toFixed(2)
      ),
      balance: parseFloat(
        (Math.round(pagIbigDeduction * 100) / 100).toFixed(2)
      ),
    },
    withholdingTax: {
      description: "Withholding Tax",
      deducted: parseFloat((Math.round(taxDeduction * 100) / 100).toFixed(2)),
    },
    otherDeductions: [],
  };
};

/**
 * Get leave credits snapshot
 */
const getLeaveCreditsSnapshot = async (employeeId, year) => {
  try {
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
  } catch (error) {
    console.error("Error getting leave credits:", error);
    return {
      VL: { total: 5, used: 0, balance: 5 },
      SL: { total: 5, used: 0, balance: 5 },
      LWOP: { total: 0, used: 0, balance: 0 },
      BL: { total: 5, used: 0, balance: 5 },
      CL: { total: 5, used: 0, balance: 5 },
    };
  }
};

/**
 * Create payroll history
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
  try {
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
  } catch (error) {
    console.error("Error creating payroll history:", error);
  }
};

/**
 * Generate Payslip PDF
 */

const generatePayslipPDF = async (payslip) => {
  return new Promise((resolve, reject) => {
    try {
      const uploadsDir = path.join(__dirname, "../../uploads/payslips");
      if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true });
      }

      const filename = `Payslip-${payslip.employeeInfo.employeeId}-${
        payslip.payrollPeriod.startDate.toISOString().split("T")[0]
      }-${Date.now()}.pdf`;
      const filepath = path.join(uploadsDir, filename);

      const doc = new PDFDocument({
        margin: 50,
        size: "A4",
      });

      const writeStream = fs.createWriteStream(filepath);
      doc.pipe(writeStream);

      // ===== HEADER =====
      doc
        .font("Helvetica-Bold")
        .fontSize(20)
        .text("PAYSLIP", { align: "center" });

      doc
        .font("Helvetica")
        .fontSize(9)
        .text(
          `Generated: ${new Date().toLocaleDateString("en-PH", {
            year: "numeric",
            month: "long",
            day: "numeric",
          })}`,
          { align: "center" }
        );

      doc.moveDown(1);

      // ===== EMPLOYEE DETAILS =====
      doc.fontSize(10).font("Helvetica-Bold").text("Employee Information");

      doc
        .font("Helvetica")
        .fontSize(9)
        .text(
          `Name: ${payslip.employeeInfo.firstname} ${payslip.employeeInfo.lastname}`
        )
        .text(`Employee ID: ${payslip.employeeInfo.employeeId}`)
        .text(`Department: ${payslip.employeeInfo.department}`)
        .text(`Position: ${payslip.employeeInfo.jobPosition}`);

      doc.moveDown(1);

      // ===== PAYROLL PERIOD =====
      doc.fontSize(10).font("Helvetica-Bold").text("Payroll Period");

      doc
        .font("Helvetica")
        .fontSize(9)
        .text(
          `Period: ${payslip.payrollPeriod.startDate.toLocaleDateString(
            "en-PH"
          )} to ${payslip.payrollPeriod.endDate.toLocaleDateString("en-PH")}`
        )
        .text(
          `Payment Date: ${payslip.paymentDate.toLocaleDateString("en-PH")}`
        )
        .text(`TIN: ${payslip.employeeInfo.tinNumber || "N/A"}`)
        .text(`SSS: ${payslip.employeeInfo.sssNumber || "N/A"}`);

      doc.moveDown(2);

      // ============================
      // TABLE HELPERS
      // ============================
      const colDesc = 50;
      const colUnits = 260;
      const colRate = 310;
      const colAmount = 400;

      const printRow = (label, units, rate, amount, bold = false) => {
        doc.font(bold ? "Helvetica-Bold" : "Helvetica").fontSize(9);

        doc.text(label, colDesc, doc.y, { width: 200 });

        doc.text(units !== null ? units.toString() : "-", colUnits, doc.y, {
          width: 40,
          align: "center",
        });

        doc.text(
          rate !== null
            ? `₱${parseFloat(rate).toLocaleString("en-PH", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}`
            : "-",
          colRate,
          doc.y,
          { width: 70, align: "right" }
        );

        doc.text(
          amount !== null
            ? `₱${parseFloat(amount).toLocaleString("en-PH", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}`
            : "-",
          colAmount,
          doc.y,
          { width: 90, align: "right" }
        );

        doc.moveDown(0.4);
      };

      // ============================
      // ===== EARNINGS SECTION =====
      // ============================
      doc.font("Helvetica-Bold").fontSize(11).text("EARNINGS");
      doc.moveDown(0.5);

      doc
        .fontSize(9)
        .text("DESCRIPTION", colDesc)
        .text("UNITS", colUnits, doc.y - 12, { width: 40, align: "center" })
        .text("RATE", colRate, doc.y - 12, { width: 70, align: "right" })
        .text("AMOUNT", colAmount, doc.y - 12, { width: 90, align: "right" });

      doc.moveDown(0.5);

      const e = payslip.earnings;

      printRow(
        "Basic Pay",
        e.basicRegular.unit,
        e.basicRegular.rate,
        e.basicRegular.amount
      );
      printRow(
        "Sick Leave",
        e.sickLeave.unit,
        e.sickLeave.rate,
        e.sickLeave.amount
      );
      printRow("General Allowance", "-", "-", e.generalAllowance.amount);

      if (e.absences && e.absences.unit > 0) {
        printRow(
          "Absences (Deduction)",
          e.absences.unit,
          e.absences.rate,
          -Math.abs(e.absences.amount)
        );
      }

      doc.moveDown(0.7);

      printRow("GROSS PAY", "", "", payslip.summary.grossThisPay, true);

      doc.moveDown(2);

      // ============================
      // ===== DEDUCTIONS SECTION =====
      // ============================
      doc.font("Helvetica-Bold").fontSize(11).text("DEDUCTIONS");
      doc.moveDown(0.5);

      doc
        .fontSize(9)
        .text("DESCRIPTION", colDesc)
        .text("AMOUNT", colAmount, doc.y - 12, { width: 90, align: "right" });

      doc.moveDown(0.5);

      const d = payslip.deductions;
      const dedList = [
        { label: "SSS Contribution", amount: d.sss.deducted },
        { label: "PhilHealth Contribution", amount: d.philhealth.deducted },
        { label: "Pag-IBIG Contribution", amount: d.pagIbig.deducted },
        { label: "Withholding Tax", amount: d.withholdingTax.deducted },
      ];

      if (d.otherDeductions) {
        d.otherDeductions.forEach((x) =>
          dedList.push({ label: x.description, amount: x.amount })
        );
      }

      dedList.forEach((x) => {
        doc
          .font("Helvetica")
          .fontSize(9)
          .text(x.label, colDesc, doc.y, { width: 300 });

        doc.text(
          `₱${parseFloat(x.amount).toLocaleString("en-PH", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}`,
          colAmount,
          doc.y,
          { width: 90, align: "right" }
        );

        doc.moveDown(0.4);
      });

      doc.moveDown(0.7);

      printRow(
        "TOTAL DEDUCTIONS",
        "",
        "",
        payslip.summary.totalDeductionsThisPay,
        true
      );

      doc.moveDown(2);

      // ============================
      // ===== NET PAY =====
      // ============================
      doc.font("Helvetica-Bold").fontSize(14).text("NET PAY:", colDesc);

      doc.fontSize(18).text(
        `₱${parseFloat(payslip.summary.netPayThisPay).toLocaleString("en-PH", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })}`,
        colAmount - 20,
        doc.y - 20,
        { width: 120, align: "right" }
      );

      doc.end();

      writeStream.on("finish", () => resolve({ filename, filepath }));
      writeStream.on("error", reject);
    } catch (error) {
      reject(error);
    }
  });
};

// ==================== EDIT/UPDATE PAYSLIP ====================

/**
 * Get single payslip for editing
 */
exports.getPayslipById = async (req, res) => {
  try {
    const { payslipId } = req.params;

    const payslip = await Payroll.findById(payslipId).populate(
      "employee",
      "firstname lastname employeeId"
    );

    if (!payslip) {
      return res.status(404).json({
        success: false,
        message: "Payslip not found",
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
 * Update/Edit payslip
 */
exports.updatePayslip = async (req, res) => {
  try {
    const { payslipId } = req.params;
    const {
      customStartDate,
      customEndDate,
      daysWorked,
      generalAllowance,
      otherDeductions,
      status,
      notes,
    } = req.body;

    // Find existing payslip
    const existingPayslip = await Payroll.findById(payslipId);
    if (!existingPayslip) {
      return res.status(404).json({
        success: false,
        message: "Payslip not found",
      });
    }

    // Check if payslip can be edited
    if (
      existingPayslip.status === "paid" ||
      existingPayslip.status === "processed"
    ) {
      return res.status(400).json({
        success: false,
        message: `Cannot edit payslip with status: ${existingPayslip.status}`,
      });
    }

    // Store previous values for history
    const previousValues = {
      payrollPeriod: existingPayslip.payrollPeriod,
      earnings: existingPayslip.earnings,
      deductions: existingPayslip.deductions,
      summary: existingPayslip.summary,
      status: existingPayslip.status,
      notes: existingPayslip.notes,
    };

    // Get employee
    const employee = await User.findById(existingPayslip.employee);
    if (!employee) {
      return res.status(404).json({
        success: false,
        message: "Employee not found",
      });
    }

    // Determine payroll period
    let startDate, endDate, paymentDate;

    if (customStartDate && customEndDate) {
      startDate = new Date(customStartDate);
      endDate = new Date(customEndDate);
      paymentDate = endDate;
    } else {
      startDate = existingPayslip.payrollPeriod.startDate;
      endDate = existingPayslip.payrollPeriod.endDate;
      paymentDate = existingPayslip.paymentDate;
    }

    // Get attendance data
    const attendanceData = await getAttendanceData(
      existingPayslip.employee,
      startDate,
      endDate
    );

    // Use custom days worked or attendance data
    const actualDaysWorked = daysWorked || attendanceData.daysPresent;

    // Recalculate
    const dailyRate = calculateDailyRate(employee.salaryRate);
    const earnings = calculateEarnings(
      dailyRate,
      actualDaysWorked,
      attendanceData.daysOnLeave,
      attendanceData.daysAbsent,
      generalAllowance !== undefined
        ? generalAllowance
        : existingPayslip.earnings.generalAllowance.amount
    );

    const grossPay =
      earnings.basicRegular.amount +
      earnings.sickLeave.amount +
      earnings.generalAllowance.amount +
      earnings.absences.amount;

    const deductions = calculateDeductions(grossPay);

    if (otherDeductions && otherDeductions.length > 0) {
      deductions.otherDeductions = otherDeductions;
    } else if (existingPayslip.deductions.otherDeductions) {
      deductions.otherDeductions = existingPayslip.deductions.otherDeductions;
    }

    const totalDeductions =
      deductions.sss.deducted +
      deductions.philhealth.deducted +
      deductions.pagIbig.deducted +
      deductions.withholdingTax.deducted +
      deductions.otherDeductions.reduce(
        (sum, ded) => sum + (ded.amount || 0),
        0
      );

    const netPay = grossPay - totalDeductions;

    // Update payslip
    existingPayslip.payrollPeriod = {
      startDate,
      endDate,
    };
    existingPayslip.paymentDate = paymentDate;
    existingPayslip.earnings = earnings;
    existingPayslip.deductions = deductions;
    existingPayslip.summary = {
      grossThisPay: parseFloat(grossPay.toFixed(2)),
      totalDeductionsThisPay: parseFloat(totalDeductions.toFixed(2)),
      netPayThisPay: parseFloat(netPay.toFixed(2)),
      grossYearToDate: parseFloat(grossPay.toFixed(2)),
      totalDeductionsYearToDate: parseFloat(totalDeductions.toFixed(2)),
      netPayYearToDate: parseFloat(netPay.toFixed(2)),
    };
    existingPayslip.attendanceSummary = attendanceData;

    if (status) {
      existingPayslip.status = status;
    }

    if (notes !== undefined) {
      existingPayslip.notes = notes;
    }

    await existingPayslip.save();

    // Regenerate PDF
    try {
      const pdfResult = await generatePayslipPDF(existingPayslip);
      existingPayslip.pdfFilename = pdfResult.filename;
      existingPayslip.pdfPath = pdfResult.filepath;
      existingPayslip.pdfGeneratedAt = new Date();
      await existingPayslip.save();
    } catch (pdfError) {
      console.error("Error regenerating PDF:", pdfError);
    }

    // Create history record
    await createPayrollHistory(
      existingPayslip._id,
      existingPayslip.employee,
      "updated",
      req.user._id,
      previousValues,
      {
        payrollPeriod: existingPayslip.payrollPeriod,
        earnings: existingPayslip.earnings,
        deductions: existingPayslip.deductions,
        summary: existingPayslip.summary,
        status: existingPayslip.status,
        notes: existingPayslip.notes,
      },
      "Payslip manually updated"
    );

    return res.status(200).json({
      success: true,
      message: "Payslip updated successfully",
      data: {
        ...existingPayslip.toObject(),
        pdfDownloadUrl: `/api/payslip/admin/${existingPayslip._id}/download-pdf`,
      },
    });
  } catch (error) {
    console.error("Error updating payslip:", error);
    return res.status(500).json({
      success: false,
      message: "Error updating payslip",
      error: error.message,
    });
  }
};

/**
 * Delete payslip (soft delete - change status to cancelled)
 */
exports.deletePayslip = async (req, res) => {
  try {
    const { payslipId } = req.params;
    const { reason } = req.body;

    const payslip = await Payroll.findById(payslipId);
    if (!payslip) {
      return res.status(404).json({
        success: false,
        message: "Payslip not found",
      });
    }

    // Check if payslip can be deleted
    if (payslip.status === "paid" || payslip.status === "processed") {
      return res.status(400).json({
        success: false,
        message: `Cannot delete payslip with status: ${payslip.status}`,
      });
    }

    const previousStatus = payslip.status;
    payslip.status = "cancelled";
    payslip.notes = `${payslip.notes}\n\nCANCELLED: ${
      reason || "No reason provided"
    }`;
    await payslip.save();

    // Create history record
    await createPayrollHistory(
      payslip._id,
      payslip.employee,
      "cancelled",
      req.user._id,
      { status: previousStatus },
      { status: "cancelled" },
      reason || "Payslip cancelled"
    );

    return res.status(200).json({
      success: true,
      message: "Payslip cancelled successfully",
      data: payslip,
    });
  } catch (error) {
    console.error("Error deleting payslip:", error);
    return res.status(500).json({
      success: false,
      message: "Error deleting payslip",
      error: error.message,
    });
  }
};

/**
 * Approve payslip
 */
exports.approvePayslip = async (req, res) => {
  try {
    const { payslipId } = req.params;
    const { notes } = req.body;

    const payslip = await Payroll.findById(payslipId);
    if (!payslip) {
      return res.status(404).json({
        success: false,
        message: "Payslip not found",
      });
    }

    if (payslip.status !== "pending" && payslip.status !== "draft") {
      return res.status(400).json({
        success: false,
        message: `Cannot approve payslip with status: ${payslip.status}`,
      });
    }

    const previousStatus = payslip.status;
    payslip.status = "approved";
    payslip.approvalWorkflow.approvedBy = req.user._id;
    payslip.approvalWorkflow.approvalDate = new Date();

    if (notes) {
      payslip.notes = `${payslip.notes}\n\nAPPROVED: ${notes}`;
    }

    await payslip.save();

    // Create history record
    await createPayrollHistory(
      payslip._id,
      payslip.employee,
      "approved",
      req.user._id,
      { status: previousStatus },
      { status: "approved", approvedBy: req.user._id },
      notes || "Payslip approved"
    );

    return res.status(200).json({
      success: true,
      message: "Payslip approved successfully",
      data: payslip,
    });
  } catch (error) {
    console.error("Error approving payslip:", error);
    return res.status(500).json({
      success: false,
      message: "Error approving payslip",
      error: error.message,
    });
  }
};
// ==================== SEARCH EMPLOYEES ====================

/**
 * Search employees by name or employee ID
 */
exports.searchEmployees = async (req, res) => {
  try {
    const { query } = req.query;

    if (!query || query.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: "Search query is required",
      });
    }

    const employees = await User.find({
      employeeStatus: 1,
      $or: [
        { firstname: { $regex: query, $options: "i" } },
        { lastname: { $regex: query, $options: "i" } },
        { employeeId: { $regex: query, $options: "i" } },
      ],
    }).select(
      "_id firstname lastname employeeId department jobposition salaryRate"
    );

    if (employees.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No employees found",
        data: [],
      });
    }

    return res.status(200).json({
      success: true,
      message: `Found ${employees.length} employee(s)`,
      data: employees,
    });
  } catch (error) {
    console.error("Error searching employees:", error);
    return res.status(500).json({
      success: false,
      message: "Error searching employees",
      error: error.message,
    });
  }
};

// ==================== PAYROLL PERIOD & RELEASE INFO ====================

/**
 * Get current payroll period and release information
 */
exports.getPayrollPeriodInfo = async (req, res) => {
  try {
    const { startDate, endDate, periodLabel, daysInMonth } =
      getCurrentPayrollPeriod();

    return res.status(200).json({
      success: true,
      data: {
        currentPeriod: {
          label: periodLabel,
          startDate,
          endDate,
          daysInMonth,
        },
        message: `Current payroll period: ${periodLabel} (${startDate.toLocaleDateString()} - ${endDate.toLocaleDateString()})`,
      },
    });
  } catch (error) {
    console.error("Error getting payroll period info:", error);
    return res.status(500).json({
      success: false,
      message: "Error getting payroll period info",
      error: error.message,
    });
  }
};

// ==================== CREATE PAYSLIP - ADMIN/HR ====================

/**
 * Create payslip manually (Admin/HR)
 * For 1-15 period OR 16-end of month period
 */
exports.createPayslipManual = async (req, res) => {
  try {
    const {
      employeeId,
      customStartDate,
      customEndDate,
      daysWorked,
      generalAllowance = 0,
      otherDeductions = [],
    } = req.body;

    // Validate required fields
    if (!employeeId) {
      return res.status(400).json({
        success: false,
        message: "Employee ID is required",
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

    // Determine payroll period
    let startDate, endDate, paymentDate, periodLabel;

    if (customStartDate && customEndDate) {
      startDate = new Date(customStartDate);
      endDate = new Date(customEndDate);
      const dayOfMonth = new Date().getDate();
      const daysInMonth = getDaysInMonth(new Date());

      if (dayOfMonth >= 1 && dayOfMonth <= 15) {
        periodLabel = "1-15";
        paymentDate = new Date(
          new Date().getFullYear(),
          new Date().getMonth(),
          15
        );
      } else {
        periodLabel = `16-${daysInMonth}`;
        paymentDate = new Date(
          new Date().getFullYear(),
          new Date().getMonth(),
          daysInMonth
        );
      }
    } else {
      const period = getCurrentPayrollPeriod();
      startDate = period.startDate;
      endDate = period.endDate;
      periodLabel = period.periodLabel;
      paymentDate = endDate;
    }

    // Check if payslip already exists for this period
    const existingPayslip = await Payroll.findOne({
      employee: employeeId,
      "payrollPeriod.startDate": startDate,
      "payrollPeriod.endDate": endDate,
    });

    if (existingPayslip) {
      return res.status(409).json({
        success: false,
        message: `Payslip already exists for ${employee.firstname} ${employee.lastname} for period ${periodLabel}`,
      });
    }

    // Get attendance data
    const attendanceData = await getAttendanceData(
      employeeId,
      startDate,
      endDate
    );

    // Use custom days worked or attendance data
    const actualDaysWorked = daysWorked || attendanceData.daysPresent;

    // Calculate daily rate and earnings
    const dailyRate = calculateDailyRate(employee.salaryRate);
    const earnings = calculateEarnings(
      dailyRate,
      actualDaysWorked,
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

    if (otherDeductions.length > 0) {
      deductions.otherDeductions = otherDeductions;
    }

    // Calculate total deductions
    const totalDeductions =
      deductions.sss.deducted +
      deductions.philhealth.deducted +
      deductions.pagIbig.deducted +
      deductions.withholdingTax.deducted +
      otherDeductions.reduce((sum, ded) => sum + (ded.amount || 0), 0);

    // Calculate net pay
    const netPay = grossPay - totalDeductions;

    // Get leave credits
    const leaveEntitlements = await getLeaveCreditsSnapshot(
      employeeId,
      startDate.getFullYear()
    );

    // Create payslip
    const payslip = new Payroll({
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
        startDate,
        endDate,
      },
      paymentDate,
      basicPay: employee.salaryRate,
      earnings,
      deductions,
      summary: {
        grossThisPay: parseFloat(grossPay.toFixed(2)),
        totalDeductionsThisPay: parseFloat(totalDeductions.toFixed(2)),
        netPayThisPay: parseFloat(netPay.toFixed(2)),
        grossYearToDate: parseFloat(grossPay.toFixed(2)),
        totalDeductionsYearToDate: parseFloat(totalDeductions.toFixed(2)),
        netPayYearToDate: parseFloat(netPay.toFixed(2)),
      },
      leaveCredits: null,
      leaveEntitlements,
      attendanceSummary: attendanceData,
      status: "draft",
      notes: `Manually created for period ${periodLabel} by ${req.user.role}`,
      approvalWorkflow: {
        submittedBy: req.user._id,
        submissionDate: new Date(),
      },
    });

    await payslip.save();

    // Generate PDF
    const pdfResult = await generatePayslipPDF(payslip);

    // Store PDF filename in payslip
    payslip.pdfFilename = pdfResult.filename;
    payslip.pdfPath = pdfResult.filepath;
    await payslip.save();

    // Create history record
    await createPayrollHistory(
      payslip._id,
      employeeId,
      "created",
      req.user._id,
      null,
      {
        payrollPeriod: `${periodLabel}`,
        status: "draft",
        createdBy: req.user.role,
        pdfGenerated: true,
      },
      `Manual payslip created for ${periodLabel} period with PDF`
    );

    return res.status(201).json({
      success: true,
      message: `Payslip created successfully for ${employee.firstname} ${employee.lastname} (${periodLabel})`,
      data: {
        ...payslip.toObject(),
        pdfDownloadUrl: `/payroll/${payslip._id}/download-pdf`,
      },
    });
  } catch (error) {
    console.error("Error creating payslip:", error);
    return res.status(500).json({
      success: false,
      message: "Error creating payslip",
      error: error.message,
    });
  }
};

/**
 * Create payslips for multiple employees (batch)
 */
exports.createPayslipBatch = async (req, res) => {
  try {
    const {
      employeeIds,
      customStartDate,
      customEndDate,
      generalAllowance = 0,
    } = req.body;

    if (!employeeIds || employeeIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: "At least one employee ID is required",
      });
    }

    // Determine payroll period
    let startDate, endDate, periodLabel;

    if (customStartDate && customEndDate) {
      startDate = new Date(customStartDate);
      endDate = new Date(customEndDate);
      const dayOfMonth = new Date().getDate();
      const daysInMonth = getDaysInMonth(new Date());

      if (dayOfMonth >= 1 && dayOfMonth <= 15) {
        periodLabel = "1-15";
      } else {
        periodLabel = `16-${daysInMonth}`;
      }
    } else {
      const period = getCurrentPayrollPeriod();
      startDate = period.startDate;
      endDate = period.endDate;
      periodLabel = period.periodLabel;
    }

    const createdPayslips = [];
    const failedPayslips = [];

    for (const empId of employeeIds) {
      try {
        const employee = await User.findById(empId);

        if (!employee) {
          failedPayslips.push({
            employeeId: empId,
            reason: "Employee not found",
          });
          continue;
        }

        // Check if payslip already exists
        const existingPayslip = await Payroll.findOne({
          employee: empId,
          "payrollPeriod.startDate": startDate,
          "payrollPeriod.endDate": endDate,
        });

        if (existingPayslip) {
          failedPayslips.push({
            employeeId: employee.employeeId,
            reason: "Payslip already exists for this period",
          });
          continue;
        }

        // Get attendance data
        const attendanceData = await getAttendanceData(
          empId,
          startDate,
          endDate
        );

        // Calculate
        const dailyRate = calculateDailyRate(employee.salaryRate);
        const earnings = calculateEarnings(
          dailyRate,
          attendanceData.daysPresent,
          attendanceData.daysOnLeave,
          attendanceData.daysAbsent,
          generalAllowance
        );

        const grossPay =
          earnings.basicRegular.amount +
          earnings.sickLeave.amount +
          earnings.generalAllowance.amount +
          earnings.absences.amount;

        const deductions = calculateDeductions(grossPay);

        const totalDeductions =
          deductions.sss.deducted +
          deductions.philhealth.deducted +
          deductions.pagIbig.deducted +
          deductions.withholdingTax.deducted;

        const netPay = grossPay - totalDeductions;

        const leaveEntitlements = await getLeaveCreditsSnapshot(
          empId,
          startDate.getFullYear()
        );

        // Create payslip
        const payslip = new Payroll({
          employee: empId,
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
          payrollPeriod: { startDate, endDate },
          paymentDate: endDate,
          basicPay: employee.salaryRate,
          earnings,
          deductions,
          summary: {
            grossThisPay: parseFloat(grossPay.toFixed(2)),
            totalDeductionsThisPay: parseFloat(totalDeductions.toFixed(2)),
            netPayThisPay: parseFloat(netPay.toFixed(2)),
            grossYearToDate: parseFloat(grossPay.toFixed(2)),
            totalDeductionsYearToDate: parseFloat(totalDeductions.toFixed(2)),
            netPayYearToDate: parseFloat(netPay.toFixed(2)),
          },
          leaveCredits: null,
          leaveEntitlements,
          attendanceSummary: attendanceData,
          status: "draft",
          notes: `Batch created for period ${periodLabel}`,
          approvalWorkflow: {
            submittedBy: req.user._id,
            submissionDate: new Date(),
          },
        });

        await payslip.save();

        // Generate PDF for each payslip
        try {
          const pdfResult = await generatePayslipPDF(payslip);
          payslip.pdfFilename = pdfResult.filename;
          payslip.pdfPath = pdfResult.filepath;
          await payslip.save();
        } catch (pdfError) {
          console.error("Error generating PDF for payslip:", pdfError);
          // Continue even if PDF generation fails
        }

        await createPayrollHistory(
          payslip._id,
          empId,
          "created",
          req.user._id,
          null,
          { periodLabel, status: "draft" },
          `Batch payslip created for ${periodLabel}`
        );

        createdPayslips.push({
          employeeId: employee.employeeId,
          name: `${employee.firstname} ${employee.lastname}`,
          netPay: netPay,
          pdfDownloadUrl: `/api/payroll/${payslip._id}/download-pdf`,
        });
      } catch (error) {
        failedPayslips.push({
          employeeId: empId,
          reason: error.message,
        });
      }
    }

    return res.status(201).json({
      success: true,
      message: `Created ${createdPayslips.length} payslips, ${failedPayslips.length} failed`,
      data: {
        created: createdPayslips.length,
        failed: failedPayslips.length,
        createdPayslips,
        failedPayslips,
      },
    });
  } catch (error) {
    console.error("Error creating batch payslips:", error);
    return res.status(500).json({
      success: false,
      message: "Error creating batch payslips",
      error: error.message,
    });
  }
};

/**
 * Get all payslips for admin (with filtering)
 */
exports.getAllPayslips = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      status,
      department,
      startDate,
      endDate,
    } = req.query;

    let query = {};

    if (status) {
      query.status = status;
    }

    if (department) {
      query["employeeInfo.department"] = department;
    }

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
    const payslips = await Payroll.find(query)
      .populate("employee", "firstname lastname employeeId department")
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

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
    console.error("Error fetching payslips:", error);
    return res.status(500).json({
      success: false,
      message: "Error fetching payslips",
      error: error.message,
    });
  }
};

// ==================== DOWNLOAD PAYSLIP PDF ====================

/**
 * Download existing payslip PDF
 */
exports.downloadPayslipPdf = async (req, res) => {
  try {
    const { payslipId } = req.params;

    // Fetch payslip
    const payslip = await Payroll.findById(payslipId);
    if (!payslip) {
      return res.status(404).json({
        success: false,
        message: "Payslip not found",
      });
    }

    // Check if PDF already exists
    if (payslip.pdfPath && fs.existsSync(payslip.pdfPath)) {
      // Send existing PDF
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
      // Generate new PDF if it doesn't exist
      const pdfResult = await generatePayslipPDF(payslip);

      // Update payslip with PDF info
      payslip.pdfFilename = pdfResult.filename;
      payslip.pdfPath = pdfResult.filepath;
      await payslip.save();

      // Send the PDF
      const filename = `Payslip-${payslip.employeeInfo.lastname}-${
        payslip.payrollPeriod.startDate.toISOString().split("T")[0]
      }.pdf`;

      res.setHeader("Content-Type", "application/pdf");
      res.setHeader(
        "Content-Disposition",
        `attachment; filename="${filename}"`
      );

      const fileStream = fs.createReadStream(pdfResult.filepath);
      fileStream.pipe(res);
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
 * Stream/View payslip PDF in browser
 */
exports.viewPayslipPdf = async (req, res) => {
  try {
    const { payslipId } = req.params;

    // Fetch payslip
    const payslip = await Payroll.findById(payslipId);
    if (!payslip) {
      return res.status(404).json({
        success: false,
        message: "Payslip not found",
      });
    }

    // Check if PDF already exists
    if (payslip.pdfPath && fs.existsSync(payslip.pdfPath)) {
      // Send existing PDF for viewing
      res.setHeader("Content-Type", "application/pdf");
      res.setHeader("Content-Disposition", "inline");

      const fileStream = fs.createReadStream(payslip.pdfPath);
      fileStream.pipe(res);
    } else {
      // Generate new PDF if it doesn't exist
      const pdfResult = await generatePayslipPDF(payslip);

      // Update payslip with PDF info
      payslip.pdfFilename = pdfResult.filename;
      payslip.pdfPath = pdfResult.filepath;
      await payslip.save();

      // Send the PDF for viewing
      res.setHeader("Content-Type", "application/pdf");
      res.setHeader("Content-Disposition", "inline");

      const fileStream = fs.createReadStream(pdfResult.filepath);
      fileStream.pipe(res);
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

exports.bulkApprovePayslips = async (req, res) => {
  try {
    const { payslipIds } = req.body;

    if (!payslipIds || payslipIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: "At least one payslip ID is required",
      });
    }

    const approvedPayslips = [];
    const failedPayslips = [];

    for (const payslipId of payslipIds) {
      try {
        const payslip = await Payroll.findById(payslipId);

        if (!payslip) {
          failedPayslips.push({
            payslipId,
            reason: "Payslip not found",
          });
          continue;
        }

        if (payslip.status !== "pending" && payslip.status !== "draft") {
          failedPayslips.push({
            payslipId,
            reason: `Cannot approve payslip with status: ${payslip.status}`,
          });
          continue;
        }

        const previousStatus = payslip.status;
        payslip.status = "approved";
        payslip.approvalWorkflow.approvedBy = req.user._id;
        payslip.approvalWorkflow.approvalDate = new Date();

        await payslip.save();

        // Create history record
        await createPayrollHistory(
          payslip._id,
          payslip.employee,
          "approved",
          req.user._id,
          { status: previousStatus },
          { status: "approved", approvedBy: req.user._id },
          "Bulk approval"
        );

        approvedPayslips.push({
          payslipId: payslip._id,
          employeeId: payslip.employeeInfo.employeeId,
          name: `${payslip.employeeInfo.firstname} ${payslip.employeeInfo.lastname}`,
        });
      } catch (error) {
        failedPayslips.push({
          payslipId,
          reason: error.message,
        });
      }
    }

    return res.status(200).json({
      success: true,
      message: `Approved ${approvedPayslips.length} payslips, ${failedPayslips.length} failed`,
      data: {
        approved: approvedPayslips.length,
        failed: failedPayslips.length,
        approvedPayslips,
        failedPayslips,
      },
    });
  } catch (error) {
    console.error("Error bulk approving payslips:", error);
    return res.status(500).json({
      success: false,
      message: "Error bulk approving payslips",
      error: error.message,
    });
  }
};
module.exports = exports;
