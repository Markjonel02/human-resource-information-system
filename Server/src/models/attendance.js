const mongoose = require("mongoose");

const AttendanceSchema = new mongoose.Schema(
  {
    employee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user", // Link to employee
      required: true,
    },
    date: {
      type: Date,
      required: true,
      index: true,
    },
    status: {
      type: String,
      enum: ["present", "absent", "late", "on_leave"],
      required: true,
    },
    checkIn: {
      type: Date,
      default: null,
    },
    checkOut: {
      type: Date,
      default: null,
    },
    hoursRendered: {
      type: Number, // in minutes
      default: 0,
    },
    tardinessMinutes: {
      type: Number, // total minutes late
      default: 0,
    },
    leaveType: {
      type: String,
      enum: ["VL", "SL", "LWOP", "BL", "OS", "CL", null],
      default: null,
    },
    notes: {
      type: String,
      trim: true,
    },
    // New fields for leave management
    isApproved: {
      type: Boolean,
      default: null, // null for non-leave records, true/false for leaves
    },
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      default: null,
    },
    approvedAt: {
      type: Date,
      default: null,
    },
    rejectionReason: {
      type: String,
      trim: true,
      default: null,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
    },
    // Leave date range fields
    dateFrom: {
      type: Date,
      default: null,
    },
    dateTo: {
      type: Date,
      default: null,
    },

    leaveStatus: {
      type: String,
      enum: ["pending", "approved", "rejected", null],
      default: null,
    },
    totalLeaveDays: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Ensure only one attendance per employee per date
AttendanceSchema.index({ employee: 1, date: 1 }, { unique: true });

module.exports = mongoose.model("Attendance", AttendanceSchema);
