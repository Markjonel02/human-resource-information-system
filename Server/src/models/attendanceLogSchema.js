const mongoose = require("mongoose");

const attendanceLogSchema = new mongoose.Schema(
  {
    employeeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: false, // Some logs might be system-wide
      index: true,
    },
    attendanceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Attendance",
      required: false, // Some logs might not be tied to specific attendance records
      index: true,
    },
    action: {
      type: String,
      required: true,
      enum: [
        "CREATED",
        "UPDATED",
        "DELETED",
        "AUTO_STATUS_CHANGE",
        "CREATE_FAILED",
        "CREATE_DUPLICATE_ATTEMPT",
        "UPDATE_FAILED",
        "DELETE_FAILED",
        "CREATE_ERROR",
        "UPDATE_ERROR",
        "DELETE_ERROR",
        "BULK_ACCESS",
        "VIEW_DETAILS",
        "EXPORT",
        "IMPORT",
      ],
      index: true,
    },
    description: {
      type: String,
      required: true,
      maxlength: 500,
    },
    performedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: false, // System actions won't have a user
      index: true,
    },
    changes: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    timestamp: {
      type: Date,
      default: Date.now,
      index: true,
    },
    ipAddress: {
      type: String,
      required: false,
    },
    userAgent: {
      type: String,
      required: false,
    },
  },
  {
    timestamps: true,
    collection: "attendancelogs",
  }
);

// Indexes for better performance
attendanceLogSchema.index({ timestamp: -1 });
attendanceLogSchema.index({ employeeId: 1, timestamp: -1 });
attendanceLogSchema.index({ attendanceId: 1, timestamp: -1 });
attendanceLogSchema.index({ action: 1, timestamp: -1 });
attendanceLogSchema.index({ performedBy: 1, timestamp: -1 });

// Compound indexes
attendanceLogSchema.index({ employeeId: 1, action: 1, timestamp: -1 });
attendanceLogSchema.index({ performedBy: 1, action: 1, timestamp: -1 });

// Auto-delete old logs after 1 year (optional)
attendanceLogSchema.index(
  { timestamp: 1 },
  { expireAfterSeconds: 365 * 24 * 60 * 60 }
);

// Virtual for human-readable timestamp
attendanceLogSchema.virtual("formattedTimestamp").get(function () {
  return this.timestamp.toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });
});

// Method to get log summary
attendanceLogSchema.methods.getSummary = function () {
  return {
    id: this._id,
    action: this.action,
    description: this.description,
    timestamp: this.formattedTimestamp,
    performedBy: this.performedBy,
    hasChanges: Object.keys(this.changes).length > 0,
  };
};

// Static method to get logs for specific employee
attendanceLogSchema.statics.getEmployeeLogs = function (
  employeeId,
  limit = 10
) {
  return this.find({ employeeId })
    .populate("performedBy", "firstname lastname employeeId")
    .sort({ timestamp: -1 })
    .limit(limit);
};

// Static method to get recent activity
attendanceLogSchema.statics.getRecentActivity = function (limit = 20) {
  return this.find({})
    .populate("employeeId", "firstname lastname employeeId")
    .populate("performedBy", "firstname lastname employeeId")
    .sort({ timestamp: -1 })
    .limit(limit);
};

// Static method to get activity by action type
attendanceLogSchema.statics.getLogsByAction = function (action, limit = 50) {
  return this.find({ action: action.toUpperCase() })
    .populate("employeeId", "firstname lastname employeeId")
    .populate("performedBy", "firstname lastname employeeId")
    .sort({ timestamp: -1 })
    .limit(limit);
};

// Pre-save middleware to capture additional request info
attendanceLogSchema.pre("save", function (next) {
  // You can add additional processing here if needed
  next();
});

module.exports = mongoose.model("AttendanceLog", attendanceLogSchema);
