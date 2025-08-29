const mongoose = require("mongoose");
const { Schema } = mongoose;

const LeaveSchema = new Schema(
  {
    employee: {
      type: Schema.Types.ObjectId,
      ref: "user", // Link to the employee who is requesting the leave
      required: true,
    },
    leaveType: {
      type: String,
      enum: ["VL", "SL", "LWOP", "BL", "CL"],
      required: true,
    },
    dateFrom: {
      type: Date,
      required: true,
    },
    dateTo: {
      type: Date,
      required: true,
    },
    totalLeaveDays: {
      type: Number,
      required: true,
    },
    notes: {
      type: String, // Reason for the leave
      trim: true,
      required: true,
    },
    leaveStatus: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },

    approvedBy: {
      type: Schema.Types.ObjectId,
      ref: "user", // Link to the admin/manager who approved/rejected
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
  },
  {
    timestamps: true,
  }
);

// This prevents an employee from submitting the exact same leave request twice
LeaveSchema.index({ employee: 1, dateFrom: 1, dateTo: 1 }, { unique: true });
module.exports = mongoose.model("Leave", LeaveSchema);
