// ==================== FILE: models/Payroll.js ====================
const mongoose = require("mongoose");

const EarningsSchema = new mongoose.Schema(
  {
    basicRegular: {
      unit: { type: Number, default: 695 }, // days worked
      rate: { type: Number, required: true }, // daily rate
      amount: { type: Number, required: true },
    },
    sickLeave: {
      unit: { type: Number, default: 0 }, // days
      rate: { type: Number, required: true },
      amount: { type: Number, default: 0 },
    },
    generalAllowance: {
      amount: { type: Number, default: 0 },
    },
    absences: {
      unit: { type: Number, default: 0 }, // days
      rate: { type: Number, required: true },
      amount: { type: Number, default: 0 }, // negative value
    },
  },
  { _id: false }
);

const DeductionsSchema = new mongoose.Schema(
  {
    sss: {
      description: { type: String, default: "Social Security System" },
      deducted: { type: Number, default: 0 },
      balance: { type: Number, default: 0 },
    },
    philhealth: {
      description: { type: String, default: "PhilHealth" },
      deducted: { type: Number, default: 0 },
      balance: { type: Number, default: 0 },
    },
    pagIbig: {
      description: { type: String, default: "Pag-IBIG" },
      deducted: { type: Number, default: 0 },
      balance: { type: Number, default: 0 },
    },
    withholdingTax: {
      description: { type: String, default: "Withholding Tax" },
      deducted: { type: Number, default: 0 },
    },
    otherDeductions: [
      {
        description: String,
        amount: Number,
        _id: false,
      },
    ],
  },
  { _id: false }
);

const PayrollSchema = new mongoose.Schema(
  {
    employee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },
    // Employee Information (Denormalized from User for reference)
    employeeInfo: {
      employeeId: { type: String, required: true },
      firstname: { type: String, required: true },
      lastname: { type: String, required: true },
      businessUnit: { type: String, required: true },
      department: { type: String, required: true },
      jobPosition: { type: String, required: true },
      tinNumber: { type: String, required: true },
      sssNumber: { type: String, required: true },
      philhealthNumber: { type: String, required: true },
      pagibigNumber: { type: String, required: true },
    },

    payrollPeriod: {
      startDate: {
        type: Date,
        required: true,
      },
      endDate: {
        type: Date,
        required: true,
      },
    },
    paymentDate: {
      type: Date,
      required: true,
    },
    basicPay: {
      type: Number,
      required: true, // Monthly salary rate from user.salaryRate
    },

    // ========== EARNINGS ==========
    earnings: EarningsSchema,

    // ========== DEDUCTIONS ==========
    deductions: DeductionsSchema,

    // ========== TOTALS & SUMMARY ==========
    summary: {
      // Current Pay Period
      grossThisPay: {
        type: Number,
        required: true,
        description: "Total earnings for this period",
      },
      totalDeductionsThisPay: {
        type: Number,
        required: true,
        description: "Total deductions for this period",
      },
      netPayThisPay: {
        type: Number,
        required: true,
        description: "Net pay for this period",
      },

      // Year-to-Date
      grossYearToDate: { type: Number, default: 0 },
      taxYearToDate: { type: Number, default: 0 },
      sssYearToDate: { type: Number, default: 0 },
      pagIbigYearToDate: { type: Number, default: 0 },
      philhealthYearToDate: { type: Number, default: 0 },
      totalDeductionsYearToDate: { type: Number, default: 0 },
      netPayYearToDate: { type: Number, default: 0 },
    },

    // ========== LEAVE ENTITLEMENTS ==========
    // Reference to LeaveCredits model for comprehensive leave management
    leaveCredits: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "LeaveCredits",
      default: null,
    },
    leaveEntitlements: {
      VL: {
        // Vacation Leave
        total: { type: Number, default: 5 },
        used: { type: Number, default: 0 },
        balance: { type: Number, default: 5 },
      },
      SL: {
        // Sick Leave
        total: { type: Number, default: 5 },
        used: { type: Number, default: 0 },
        balance: { type: Number, default: 5 },
      },
      LWOP: {
        // Leave Without Pay
        total: { type: Number, default: 0 },
        used: { type: Number, default: 0 },
        balance: { type: Number, default: 0 },
      },
      BL: {
        // Bereavement Leave
        total: { type: Number, default: 5 },
        used: { type: Number, default: 0 },
        balance: { type: Number, default: 5 },
      },
      CL: {
        // Christmas Leave / Other Leave
        total: { type: Number, default: 5 },
        used: { type: Number, default: 0 },
        balance: { type: Number, default: 5 },
      },
    },

    // ========== ATTENDANCE SUMMARY ==========
    attendanceSummary: {
      totalWorkingDays: { type: Number, default: 0 },
      daysPresent: { type: Number, default: 0 },
      daysAbsent: { type: Number, default: 0 },
      daysLate: { type: Number, default: 0 },
      daysOnLeave: { type: Number, default: 0 },
      totalTardinessMinutes: { type: Number, default: 0 },
      totalHoursRendered: { type: Number, default: 0 }, // in minutes
    },

    // ========== PDF STORAGE ==========
    pdfFilename: {
      type: String,
      default: null,
      description: "Filename of the generated PDF payslip",
    },
    pdfPath: {
      type: String,
      default: null,
      description: "File system path to the PDF payslip",
    },
    pdfGeneratedAt: {
      type: Date,
      default: null,
      description: "Timestamp when PDF was generated",
    },

    // ========== STATUS & METADATA ==========
    status: {
      type: String,
      enum: ["draft", "pending", "approved", "processed", "paid", "cancelled"],
      default: "draft",
    },
    notes: {
      type: String,
      default: "",
    },
    approvalWorkflow: {
      submittedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user",
        default: null,
      },
      submissionDate: {
        type: Date,
        default: null,
      },
      approvedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user",
        default: null,
      },
      approvalDate: {
        type: Date,
        default: null,
      },
      rejectionReason: {
        type: String,
        default: null,
      },
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for efficient querying
PayrollSchema.index({ employee: 1, "payrollPeriod.startDate": 1 });
PayrollSchema.index({ employee: 1, paymentDate: 1 });
PayrollSchema.index({ status: 1, paymentDate: 1 });
PayrollSchema.index({ "employeeInfo.employeeId": 1 });
PayrollSchema.index({
  "payrollPeriod.startDate": 1,
  "payrollPeriod.endDate": 1,
});
PayrollSchema.index({ pdfFilename: 1 }); // Index for PDF lookups

module.exports =
  mongoose.models.Payroll || mongoose.model("Payroll", PayrollSchema);
