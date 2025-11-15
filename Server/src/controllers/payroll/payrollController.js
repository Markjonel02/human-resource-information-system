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
      // Create uploads directory if it doesn't exist
      const uploadsDir = path.join(__dirname, "../../uploads/payslips");
      if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true });
      }

      // Generate filename
      const filename = `Payslip-${payslip.employeeInfo.employeeId}-${
        payslip.payrollPeriod.startDate.toISOString().split("T")[0]
      }-${Date.now()}.pdf`;
      const filepath = path.join(uploadsDir, filename);

      // Create PDF
      const doc = new PDFDocument({ margin: 50, size: "A4" });
      const writeStream = fs.createWriteStream(filepath);

      doc.pipe(writeStream);

      // ===== HEADER =====
      doc
        .fontSize(24)
        .font("Helvetica-Bold")
        .text("PAYSLIP", { align: "center" })
        .moveDown(0.5);

      doc
        .fontSize(10)
        .font("Helvetica")
        .text(
          `Generated on: ${new Date().toLocaleDateString("en-PH", {
            year: "numeric",
            month: "long",
            day: "numeric",
          })}`,
          { align: "center" }
        )
        .moveDown(2);

      // ===== EMPLOYEE INFORMATION =====
      doc
        .fontSize(14)
        .font("Helvetica-Bold")
        .text("Employee Information")
        .moveDown(0.5);

      doc.fontSize(11).font("Helvetica");
      const employeeInfo = [
        [
          "Name:",
          `${payslip.employeeInfo.firstname} ${payslip.employeeInfo.lastname}`,
        ],
        ["Employee ID:", payslip.employeeInfo.employeeId],
        ["Department:", payslip.employeeInfo.department],
        ["Position:", payslip.employeeInfo.jobPosition],
        ["TIN:", payslip.employeeInfo.tinNumber || "N/A"],
        ["SSS:", payslip.employeeInfo.sssNumber || "N/A"],
        ["PhilHealth:", payslip.employeeInfo.philhealthNumber || "N/A"],
        ["Pag-IBIG:", payslip.employeeInfo.pagibigNumber || "N/A"],
      ];

      employeeInfo.forEach(([label, value]) => {
        doc.text(label, 50, doc.y, { continued: true, width: 150 });
        doc.text(value, 200);
      });

      doc.moveDown(1.5);

      // ===== PAYROLL PERIOD =====
      doc
        .fontSize(14)
        .font("Helvetica-Bold")
        .text("Payroll Period")
        .moveDown(0.5);

      doc.fontSize(11).font("Helvetica");
      doc.text(
        `Period: ${payslip.payrollPeriod.startDate.toLocaleDateString(
          "en-PH"
        )} - ${payslip.payrollPeriod.endDate.toLocaleDateString("en-PH")}`
      );
      doc.text(
        `Payment Date: ${payslip.paymentDate.toLocaleDateString("en-PH")}`
      );
      doc.moveDown(2);

      // ===== EARNINGS TABLE =====
      doc.fontSize(14).font("Helvetica-Bold").text("EARNINGS").moveDown(0.5);

      // Table headers
      const tableTop = doc.y;
      doc.fontSize(10).font("Helvetica-Bold");
      doc.text("Description", 50, tableTop, { width: 250 });
      doc.text("Units", 300, tableTop, { width: 80, align: "right" });
      doc.text("Rate", 380, tableTop, { width: 80, align: "right" });
      doc.text("Amount", 460, tableTop, { width: 90, align: "right" });

      doc.moveDown(0.5);
      doc
        .strokeColor("#cccccc")
        .lineWidth(1)
        .moveTo(50, doc.y)
        .lineTo(550, doc.y)
        .stroke();
      doc.moveDown(0.3);

      // Earnings rows
      doc.fontSize(10).font("Helvetica");
      const earnings = payslip.earnings;

      const earningsData = [
        [
          "Basic Pay",
          earnings.basicRegular.unit,
          `₱${earnings.basicRegular.rate.toLocaleString()}`,
          `₱${earnings.basicRegular.amount.toLocaleString()}`,
        ],
        [
          "Sick Leave",
          earnings.sickLeave.unit,
          `₱${earnings.sickLeave.rate.toLocaleString()}`,
          `₱${earnings.sickLeave.amount.toLocaleString()}`,
        ],
        [
          "General Allowance",
          "-",
          "-",
          `₱${earnings.generalAllowance.amount.toLocaleString()}`,
        ],
      ];

      if (earnings.absences.unit > 0) {
        earningsData.push([
          "Absences",
          earnings.absences.unit,
          `₱${earnings.absences.rate.toLocaleString()}`,
          `₱${earnings.absences.amount.toLocaleString()}`,
        ]);
      }

      earningsData.forEach((row) => {
        const y = doc.y;
        doc.text(row[0], 50, y, { width: 250 });
        doc.text(row[1].toString(), 300, y, { width: 80, align: "right" });
        doc.text(row[2], 380, y, { width: 80, align: "right" });
        doc.text(row[3], 460, y, { width: 90, align: "right" });
        doc.moveDown(0.8);
      });

      doc.moveDown(0.5);
      doc
        .strokeColor("#cccccc")
        .lineWidth(1)
        .moveTo(50, doc.y)
        .lineTo(550, doc.y)
        .stroke();
      doc.moveDown(0.3);

      // Total Earnings
      doc.fontSize(11).font("Helvetica-Bold");
      const grossY = doc.y;
      doc.text("GROSS PAY:", 300, grossY, { width: 160, align: "right" });
      doc.text(
        `₱${payslip.summary.grossThisPay.toLocaleString()}`,
        460,
        grossY,
        { width: 90, align: "right" }
      );

      doc.moveDown(2);

      // ===== DEDUCTIONS TABLE =====
      doc.fontSize(14).font("Helvetica-Bold").text("DEDUCTIONS").moveDown(0.5);

      // Table headers
      const deductTableTop = doc.y;
      doc.fontSize(10).font("Helvetica-Bold");
      doc.text("Description", 50, deductTableTop, { width: 400 });
      doc.text("Amount", 460, deductTableTop, { width: 90, align: "right" });

      doc.moveDown(0.5);
      doc
        .strokeColor("#cccccc")
        .lineWidth(1)
        .moveTo(50, doc.y)
        .lineTo(550, doc.y)
        .stroke();
      doc.moveDown(0.3);

      // Deductions rows
      doc.fontSize(10).font("Helvetica");
      const d = payslip.deductions;

      const deductionsData = [
        ["SSS Contribution", `₱${d.sss.deducted.toLocaleString()}`],
        [
          "PhilHealth Contribution",
          `₱${d.philhealth.deducted.toLocaleString()}`,
        ],
        ["Pag-IBIG Contribution", `₱${d.pagIbig.deducted.toLocaleString()}`],
        ["Withholding Tax", `₱${d.withholdingTax.deducted.toLocaleString()}`],
      ];

      if (d.otherDeductions && d.otherDeductions.length > 0) {
        d.otherDeductions.forEach((item) => {
          deductionsData.push([
            item.description,
            `₱${item.amount.toLocaleString()}`,
          ]);
        });
      }

      deductionsData.forEach((row) => {
        const y = doc.y;
        doc.text(row[0], 50, y, { width: 400 });
        doc.text(row[1], 460, y, { width: 90, align: "right" });
        doc.moveDown(0.8);
      });

      doc.moveDown(0.5);
      doc
        .strokeColor("#cccccc")
        .lineWidth(1)
        .moveTo(50, doc.y)
        .lineTo(550, doc.y)
        .stroke();
      doc.moveDown(0.3);

      // Total Deductions
      doc.fontSize(11).font("Helvetica-Bold");
      const totalDeductY = doc.y;
      doc.text("TOTAL DEDUCTIONS:", 300, totalDeductY, {
        width: 160,
        align: "right",
      });
      doc.text(
        `₱${payslip.summary.totalDeductionsThisPay.toLocaleString()}`,
        460,
        totalDeductY,
        { width: 90, align: "right" }
      );

      doc.moveDown(3);

      // ===== NET PAY =====
      doc
        .fontSize(16)
        .font("Helvetica-Bold")
        .fillColor("#2c5282")
        .text("NET PAY:", 300, doc.y, { width: 160, align: "right" });
      doc
        .fontSize(18)
        .text(
          `₱${payslip.summary.netPayThisPay.toLocaleString()}`,
          460,
          doc.y - 20,
          { width: 90, align: "right" }
        );

      doc.fillColor("#000000");
      doc.moveDown(3);

      // ===== FOOTER =====
      doc
        .fontSize(8)
        .font("Helvetica")
        .text(
          "This is a system-generated payslip. No signature required.",
          50,
          doc.page.height - 100,
          { align: "center", width: 500 }
        );

      doc.text(
        `Status: ${payslip.status.toUpperCase()}`,
        50,
        doc.page.height - 80,
        { align: "center", width: 500 }
      );

      doc.end();

      writeStream.on("finish", () => {
        resolve({ filename, filepath });
      });

      writeStream.on("error", reject);
    } catch (error) {
      reject(error);
    }
  });
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
      .populate("employee", "firstname lastname employeeId")
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

module.exports = exports;
