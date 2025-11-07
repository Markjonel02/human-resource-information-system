// ==================== FILE: controllers/payroll/payrollController.js ====================
const Payroll = require("../../models/payroll/payrollSchema");
const PayrollHistory = require("../../models/payroll/payrollHistorySchema");
const User = require("../../models/user");
const LeaveCredits = require("../../models/LeaveSchema/leaveCreditsSchema");
const Attendance = require("../../models/attendance");
const PDFDocument = require("pdfkit");
const cron = require("node-cron");

// ==================== PHILIPPINE HOLIDAYS ====================

const PH_HOLIDAYS_2025 = [
  "2025-01-01", // New Year
  "2025-02-10", // EDSA Revolution
  "2025-02-25", // EDSA Revolution
  "2025-04-09", // Day of Valor
  "2025-04-18", // Good Friday
  "2025-04-19", // Black Saturday
  "2025-04-21", // Easter Monday
  "2025-06-12", // Independence Day
  "2025-08-21", // Ninoy Aquino Day
  "2025-11-01", // All Saints Day
  "2025-11-30", // Bonifacio Day
  "2025-12-08", // Feast of Immaculate Conception
  "2025-12-25", // Christmas Day
  "2025-12-30", // Rizal Day
  "2025-12-31", // New Year's Eve
];

// ==================== HELPER FUNCTIONS ====================

/**
 * Check if date is weekend (Saturday or Sunday)
 */
const isWeekend = (date) => {
  const day = new Date(date).getDay();
  return day === 0 || day === 6;
};

/**
 * Check if date is Philippine holiday
 */
const isPhilippineHoliday = (date) => {
  const dateStr = date.toISOString().split("T")[0];
  return PH_HOLIDAYS_2025.includes(dateStr);
};

/**
 * Get next working day (skip weekends and holidays)
 */
const getNextWorkingDay = (date) => {
  let nextDate = new Date(date);
  nextDate.setDate(nextDate.getDate() + 1);

  while (isWeekend(nextDate) || isPhilippineHoliday(nextDate)) {
    nextDate.setDate(nextDate.getDate() + 1);
  }

  return nextDate;
};

/**
 * Get previous working day (skip weekends and holidays)
 */
const getPreviousWorkingDay = (date) => {
  let prevDate = new Date(date);
  prevDate.setDate(prevDate.getDate() - 1);

  while (isWeekend(prevDate) || isPhilippineHoliday(prevDate)) {
    prevDate.setDate(prevDate.getDate() - 1);
  }

  return prevDate;
};

/**
 * Adjust release date if it falls on weekend or holiday
 * If weekend/holiday, release on the day before
 */
const adjustReleaseDate = (date) => {
  let releaseDate = new Date(date);

  if (isWeekend(releaseDate) || isPhilippineHoliday(releaseDate)) {
    releaseDate = getPreviousWorkingDay(releaseDate);
  }

  return releaseDate;
};

/**
 * Calculate next 15-day payroll release date
 */
const calculateNextPayrollReleaseDate = () => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  let releaseDate = new Date(today);
  releaseDate.setDate(releaseDate.getDate() + 15);

  return adjustReleaseDate(releaseDate);
};

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
  } catch (error) {
    console.error("Error getting attendance data:", error);
    // Return default values if no attendance records
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
 * Calculate deductions (SSS, PhilHealth, Pag-IBIG, Tax)
 */
const calculateDeductions = (grossPay) => {
  const sssRate = 0.045; // 4.5%
  const philhealthRate = 0.025; // 2.5%
  const pagIbigRate = 0.02; // 2%
  const taxRate = 0.12; // 12%

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

// ==================== AUTO RELEASE ENDPOINTS ====================

/**
 * Get next payroll release date
 */
exports.getNextPayrollReleaseDate = async (req, res) => {
  try {
    const releaseDate = calculateNextPayrollReleaseDate();

    const isWeekendDate = isWeekend(releaseDate);
    const isHolidayDate = isPhilippineHoliday(releaseDate);

    return res.status(200).json({
      success: true,
      data: {
        nextReleaseDate: releaseDate,
        formattedDate: releaseDate.toLocaleDateString("en-PH", {
          year: "numeric",
          month: "long",
          day: "numeric",
        }),
        isWeekend: isWeekendDate,
        isHoliday: isHolidayDate,
        adjustedReason: isWeekendDate
          ? "weekend"
          : isHolidayDate
          ? "Philippine holiday"
          : "regular",
      },
    });
  } catch (error) {
    console.error("Error calculating release date:", error);
    return res.status(500).json({
      success: false,
      message: "Error calculating release date",
      error: error.message,
    });
  }
};

/**
 * Auto-release payroll for all employees every 15 days
 */
exports.autoReleasePayroll = async (req, res) => {
  try {
    console.log("⏰ Starting automatic payroll release process...");

    const releaseDate = calculateNextPayrollReleaseDate();
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Check if today is the release date
    if (releaseDate.getTime() !== today.getTime()) {
      console.log(
        `⏭️  Next release date is ${releaseDate.toDateString()}, skipping for today`
      );
      return res.status(200).json({
        success: true,
        message: "Not release date yet",
        data: {
          nextReleaseDate: releaseDate,
          released: 0,
        },
      });
    }

    console.log(
      `📅 Processing payroll release for: ${releaseDate.toDateString()}`
    );

    // Get all draft payrolls that are ready for release
    const payrollsToRelease = await Payroll.find({
      status: "draft",
      "payrollPeriod.endDate": {
        $lte: releaseDate,
      },
    });

    if (payrollsToRelease.length === 0) {
      console.log("✅ No payrolls pending for release");
      return res.status(200).json({
        success: true,
        message: "No payrolls to release",
        data: {
          released: 0,
          failed: 0,
        },
      });
    }

    let releasedCount = 0;
    const failedPayrolls = [];

    // Update status to "approved" for auto-release
    for (const payroll of payrollsToRelease) {
      try {
        payroll.status = "approved";
        payroll.approvalWorkflow.approvedBy = null;
        payroll.approvalWorkflow.approvalDate = releaseDate;
        payroll.notes = `Automatically released on ${releaseDate.toDateString()}`;

        await payroll.save();

        // Create history record
        await createPayrollHistory(
          payroll._id,
          payroll.employee,
          "approved",
          null,
          { status: "draft" },
          { status: "approved" },
          "System auto-release"
        );

        releasedCount++;
        console.log(
          `✅ Payroll released for employee: ${payroll.employeeInfo.employeeId}`
        );
      } catch (error) {
        failedPayrolls.push({
          employeeId: payroll.employeeInfo.employeeId,
          error: error.message,
        });
        console.error(
          `❌ Failed to release payroll for ${payroll.employeeInfo.employeeId}:`,
          error.message
        );
      }
    }

    console.log(
      `✨ Auto-release completed: ${releasedCount} released, ${failedPayrolls.length} failed`
    );

    return res.status(200).json({
      success: true,
      message: `Auto-release completed: ${releasedCount} released`,
      data: {
        released: releasedCount,
        failed: failedPayrolls.length,
        failedPayrolls,
      },
    });
  } catch (error) {
    console.error("❌ Error in auto-release process:", error);
    return res.status(500).json({
      success: false,
      message: "Error in auto-release process",
      error: error.message,
    });
  }
};

/**
 * Initialize CRON job for auto payroll release
 */
exports.initializePayrollScheduler = () => {
  console.log("🚀 Initializing payroll auto-release scheduler...");

  // Run at 12:00 AM every day
  cron.schedule("0 0 * * *", async () => {
    try {
      console.log("⏰ Running scheduled payroll auto-release...");
      await exports.autoReleasePayroll(
        {},
        {
          status: () => ({ json: () => {} }),
          json: () => {},
        }
      );
    } catch (error) {
      console.error("Error in scheduled payroll release:", error);
    }
  });

  console.log("✅ Payroll scheduler initialized (runs daily at 12:00 AM)");
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

    if (!employeeId || !startDate || !endDate || !paymentDate) {
      return res.status(400).json({
        success: false,
        message:
          "Missing required fields: employeeId, startDate, endDate, paymentDate",
      });
    }

    const employee = await User.findById(employeeId);
    if (!employee) {
      return res.status(404).json({
        success: false,
        message: "Employee not found",
      });
    }

    const attendanceData = await getAttendanceData(
      employeeId,
      new Date(startDate),
      new Date(endDate)
    );

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

    if (otherDeductions.length > 0) {
      deductions.otherDeductions = otherDeductions;
    }

    const totalDeductions =
      deductions.sss.deducted +
      deductions.philhealth.deducted +
      deductions.pagIbig.deducted +
      deductions.withholdingTax.deducted +
      otherDeductions.reduce((sum, ded) => sum + (ded.amount || 0), 0);

    const netPay = grossPay - totalDeductions;

    const leaveEntitlements = await getLeaveCreditsSnapshot(
      employeeId,
      new Date(startDate).getFullYear()
    );

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
      approvalWorkflow: {
        submittedBy: req.user._id,
      },
    });

    await payroll.save();

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

    if (!startDate || !endDate || !paymentDate) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields: startDate, endDate, paymentDate",
      });
    }

    let query = { employeeStatus: 1 };
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

    for (const employee of employees) {
      try {
        const attendanceData = await getAttendanceData(
          employee._id,
          new Date(startDate),
          new Date(endDate)
        );

        const dailyRate = calculateDailyRate(employee.salaryRate);
        const earnings = calculateEarnings(
          dailyRate,
          attendanceData.daysPresent,
          attendanceData.daysOnLeave,
          attendanceData.daysAbsent,
          0
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
          employee._id,
          new Date(startDate).getFullYear()
        );

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
          approvalWorkflow: {
            submittedBy: req.user._id,
          },
        });

        await payroll.save();

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

    const payroll = await Payroll.findById(payrollId).populate("employee");

    if (!payroll) {
      return res.status(404).json({
        success: false,
        message: "Payroll not found",
      });
    }

    const doc = new PDFDocument({
      margin: 40,
      size: "A4",
    });

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="Payslip_${
        payroll.employeeInfo.employeeId
      }_${payroll.paymentDate.getFullYear()}-${String(
        payroll.paymentDate.getMonth() + 1
      ).padStart(2, "0")}.pdf"`
    );

    doc.pipe(res);

    // Title
    doc.fontSize(16).font("Helvetica-Bold").text("PAYROLL SLIP", {
      align: "center",
    });
    doc.fontSize(10).text("", { align: "center" });

    // Employee Information
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

    // Payroll Period
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

    // Earnings
    doc.fontSize(11).font("Helvetica-Bold").text("EARNINGS", {
      underline: true,
    });
    doc.fontSize(8).font("Helvetica");

    const earningsRows = [
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
      earningsRows.push([
        "Absences",
        payroll.earnings.absences.unit,
        `₱${payroll.earnings.absences.rate.toFixed(2)}`,
        `₱${payroll.earnings.absences.amount.toFixed(2)}`,
      ]);
    }

    earningsRows.forEach((row) => {
      doc.text(row[0], 50, null, { width: 100 });
      doc.moveUp().text(row[1], 150, null, { width: 60, align: "right" });
      doc.moveUp().text(row[2], 210, null, { width: 70, align: "right" });
      doc.moveUp().text(row[3], 280, null, { width: 80, align: "right" });
      doc.moveDown();
    });

    doc.moveDown();

    // Deductions
    doc.fontSize(11).font("Helvetica-Bold").text("DEDUCTIONS", {
      underline: true,
    });
    doc.fontSize(8).font("Helvetica");

    const deductionsRows = [
      ["SSS", `₱${payroll.deductions.sss.deducted.toFixed(2)}`],
      ["PhilHealth", `₱${payroll.deductions.philhealth.deducted.toFixed(2)}`],
      ["Pag-IBIG", `₱${payroll.deductions.pagIbig.deducted.toFixed(2)}`],
      [
        "Withholding Tax",
        `₱${payroll.deductions.withholdingTax.deducted.toFixed(2)}`,
      ],
    ];

    deductionsRows.forEach((row) => {
      doc.text(row[0], 50, null, { width: 200 });
      doc.moveUp().text(row[1], 300, null, { width: 80, align: "right" });
      doc.moveDown();
    });

    doc.moveDown();

    // Summary
    doc.fontSize(11).font("Helvetica-Bold").text("SUMMARY", {
      underline: true,
    });
    doc.fontSize(9).font("Helvetica");

    const summaryRows = [
      ["Gross Pay", `₱${payroll.summary.grossThisPay.toFixed(2)}`],
      [
        "Total Deductions",
        `₱${payroll.summary.totalDeductionsThisPay.toFixed(2)}`,
      ],
      ["Net Pay", `₱${payroll.summary.netPayThisPay.toFixed(2)}`],
    ];

    summaryRows.forEach(([label, value]) => {
      doc
        .font("Helvetica-Bold")
        .text(label, 50, null, { width: 200, align: "left" })
        .moveUp()
        .font("Helvetica")
        .text(value, 300, null, { width: 80, align: "right" });
    });

    doc.moveDown(2);

    // Leave Balance
    doc.fontSize(11).font("Helvetica-Bold").text("LEAVE BALANCE", {
      underline: true,
    });
    doc.fontSize(8).font("Helvetica");

    const leaveRows = [
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

    leaveRows.forEach((row) => {
      doc.text(row[0], 50, null, { width: 100 });
      doc.moveUp().text(row[1], 150, null, { width: 50, align: "right" });
      doc.moveUp().text(row[2], 200, null, { width: 50, align: "right" });
      doc.moveUp().text(row[3], 250, null, { width: 50, align: "right" });
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
 * Generate bulk payslips
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

    const payrolls = await Payroll.find({ _id: { $in: payrollIds } }).populate(
      "employee"
    );

    if (payrolls.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Payrolls not found",
      });
    }

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

// ==================== PAYROLL RETRIEVAL ====================

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
    console.error("Error fetching payroll:", error);
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
    console.error("Error fetching payroll history:", error);
    return res.status(500).json({
      success: false,
      message: "Error fetching payroll history",
      error: error.message,
    });
  }
};

/**
 * Get employee payrolls
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
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalRecords: total,
      },
    });
  } catch (error) {
    console.error("Error fetching employee payrolls:", error);
    return res.status(500).json({
      success: false,
      message: "Error fetching employee payrolls",
      error: error.message,
    });
  }
};

/**
 * Get payrolls by period
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
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalRecords: total,
      },
    });
  } catch (error) {
    console.error("Error fetching payrolls by period:", error);
    return res.status(500).json({
      success: false,
      message: "Error fetching payrolls",
      error: error.message,
    });
  }
};

// ==================== PAYROLL MANAGEMENT ====================

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
    console.error("Error updating payroll status:", error);
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
    console.error("Error approving payroll:", error);
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
    console.error("Error rejecting payroll:", error);
    return res.status(500).json({
      success: false,
      message: "Error rejecting payroll",
      error: error.message,
    });
  }
};

/**
 * Delete payroll
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
    console.error("Error deleting payroll:", error);
    return res.status(500).json({
      success: false,
      message: "Error deleting payroll",
      error: error.message,
    });
  }
};

module.exports = exports;
