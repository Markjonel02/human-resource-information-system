const mongoose = require("mongoose");

const leaveLogSchema = new mongoose.Schema(
  {
    leaveId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Leave",
      required: true,
    },
    employeeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    action: {
      type: String,
      enum: ["LEAVE_REQUESTED", "UPDATED", "CANCELLED", "APPROVED", "REJECTED"],
      required: true,
    },
    description: {
      type: String,
      default: "",
    },
    performedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user", // HR/Admin/Employee who performed the action
      required: true,
    },
    changes: {
      type: Object, // snapshot of what was changed
      default: {},
    },
    metadata: {
      type: Object, // extra context (role, department, IP, device, etc.)
      default: {},
    },
    ipAddress: { type: String, default: "N/A" },
    userAgent: { type: String, default: "N/A" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("LeaveLog", leaveLogSchema);
