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
    // Optional: A reference to the leave request that resulted in this 'on_leave' status
    leaveRequest: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Leave",
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// This crucial index ensures one attendance record per employee per day.
AttendanceSchema.index({ employee: 1, date: 1 }, { unique: true });

module.exports =
  mongoose.models.Attendance || mongoose.model("Attendance", AttendanceSchema);
