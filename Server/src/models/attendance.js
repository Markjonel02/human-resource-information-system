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
      enum: ["VL", "SL", "LWOP", "BL", "OS", "CL", null], // matches your UI
      default: null,
    },
    notes: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

// Ensure only one attendance per employee per date
AttendanceSchema.index({ employee: 1, date: 1 }, { unique: true });

module.exports = mongoose.model("Attendance", AttendanceSchema);
