const mongoose = require("mongoose");

// ==================== USER ACTIVITY LOG SCHEMA ====================
const UserActivityLogSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },
    username: { type: String, required: true },
    employeeId: { type: String, required: true },

    action: {
      type: String,
      required: true,
      enum: [
        "login",
        "logout",
        "login_failed",
        "password_change",
        "password_reset_request",
        "password_reset_complete",
        "profile_update",
        "profile_view",
        "account_locked",
        "account_unlocked",
        "session_expired",
      ],
    },

    description: { type: String },

    ipAddress: { type: String },
    userAgent: { type: String },
    device: { type: String },
    browser: { type: String },
    os: { type: String },
    location: {
      country: { type: String },
      city: { type: String },
      region: { type: String },
    },

    status: {
      type: String,
      enum: ["success", "failed", "warning"],
      default: "success",
    },

    metadata: { type: mongoose.Schema.Types.Mixed },
    timestamp: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

// Indexes for better query performance
UserActivityLogSchema.index({ userId: 1, timestamp: -1 });
UserActivityLogSchema.index({ action: 1, timestamp: -1 });
UserActivityLogSchema.index({ timestamp: -1 });
UserActivityLogSchema.index({ employeeId: 1 });

// ==================== USER CHANGE LOG SCHEMA ====================
const UserChangeLogSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },
    changedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },
    changedByUsername: { type: String, required: true },
    changedByRole: { type: String, required: true },

    action: {
      type: String,
      required: true,
      enum: ["create", "update", "delete", "restore", "status_change"],
    },

    entity: {
      type: String,
      default: "user",
    },

    changes: [
      {
        field: { type: String, required: true },
        oldValue: { type: mongoose.Schema.Types.Mixed },
        newValue: { type: mongoose.Schema.Types.Mixed },
        dataType: { type: String }, // e.g., "string", "number", "date", "object"
      },
    ],

    reason: { type: String }, // Optional reason for the change

    ipAddress: { type: String },
    userAgent: { type: String },

    timestamp: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

// Indexes
UserChangeLogSchema.index({ userId: 1, timestamp: -1 });
UserChangeLogSchema.index({ changedBy: 1, timestamp: -1 });
UserChangeLogSchema.index({ action: 1, timestamp: -1 });
UserChangeLogSchema.index({ timestamp: -1 });

// ==================== LOGIN HISTORY SCHEMA ====================
const LoginHistorySchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },
    username: { type: String, required: true },
    employeeId: { type: String, required: true },

    loginTime: { type: Date, default: Date.now },
    logoutTime: { type: Date },
    sessionDuration: { type: Number }, // in minutes

    loginStatus: {
      type: String,
      enum: ["success", "failed"],
      required: true,
    },

    failureReason: { type: String },

    ipAddress: { type: String },
    userAgent: { type: String },
    device: { type: String },
    browser: { type: String },
    os: { type: String },

    location: {
      country: { type: String },
      city: { type: String },
      region: { type: String },
      latitude: { type: Number },
      longitude: { type: Number },
    },

    sessionToken: { type: String },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

// Indexes
LoginHistorySchema.index({ userId: 1, loginTime: -1 });
LoginHistorySchema.index({ loginTime: -1 });
LoginHistorySchema.index({ sessionToken: 1 });
LoginHistorySchema.index({ isActive: 1, userId: 1 });

// ==================== SECURITY EVENT LOG SCHEMA ====================
const SecurityEventLogSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
    },
    username: { type: String },

    eventType: {
      type: String,
      required: true,
      enum: [
        "suspicious_login",
        "multiple_failed_attempts",
        "account_locked",
        "account_unlocked",
        "unusual_activity",
        "unauthorized_access_attempt",
        "permission_denied",
        "data_breach_attempt",
        "password_policy_violation",
      ],
    },

    severity: {
      type: String,
      required: true,
      enum: ["low", "medium", "high", "critical"],
    },

    description: { type: String, required: true },

    ipAddress: { type: String },
    userAgent: { type: String },

    affectedResource: { type: String },
    requestedAction: { type: String },

    resolved: { type: Boolean, default: false },
    resolvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
    },
    resolvedAt: { type: Date },
    resolutionNotes: { type: String },

    metadata: { type: mongoose.Schema.Types.Mixed },
    timestamp: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

// Indexes
SecurityEventLogSchema.index({ timestamp: -1 });
SecurityEventLogSchema.index({ userId: 1, timestamp: -1 });
SecurityEventLogSchema.index({ severity: 1, resolved: 1 });
SecurityEventLogSchema.index({ eventType: 1, timestamp: -1 });

// ==================== ADMIN ACTION LOG SCHEMA ====================
const AdminActionLogSchema = new mongoose.Schema(
  {
    adminId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },
    adminUsername: { type: String, required: true },
    adminRole: { type: String, required: true },

    action: {
      type: String,
      required: true,
      enum: [
        "user_created",
        "user_updated",
        "user_deleted",
        "user_activated",
        "user_deactivated",
        "role_changed",
        "permission_changed",
        "bulk_action",
        "data_export",
        "system_config_change",
        "report_generated",
      ],
    },

    targetUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
    },
    targetUsername: { type: String },

    details: { type: String, required: true },

    changes: { type: mongoose.Schema.Types.Mixed },

    affectedCount: { type: Number, default: 1 }, // For bulk actions

    ipAddress: { type: String },
    userAgent: { type: String },

    timestamp: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

// Indexes
AdminActionLogSchema.index({ adminId: 1, timestamp: -1 });
AdminActionLogSchema.index({ targetUserId: 1, timestamp: -1 });
AdminActionLogSchema.index({ action: 1, timestamp: -1 });
AdminActionLogSchema.index({ timestamp: -1 });

// ==================== DATA ACCESS LOG SCHEMA ====================
const DataAccessLogSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },
    username: { type: String, required: true },
    role: { type: String, required: true },

    accessType: {
      type: String,
      required: true,
      enum: ["read", "export", "print", "download"],
    },

    resourceType: {
      type: String,
      required: true,
      enum: [
        "user_profile",
        "employee_data",
        "salary_info",
        "personal_info",
        "report",
        "document",
      ],
    },

    resourceId: {
      type: mongoose.Schema.Types.ObjectId,
    },

    resourceOwner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
    },

    purpose: { type: String }, // Why they accessed the data

    ipAddress: { type: String },
    userAgent: { type: String },

    timestamp: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

// Indexes
DataAccessLogSchema.index({ userId: 1, timestamp: -1 });
DataAccessLogSchema.index({ resourceOwner: 1, timestamp: -1 });
DataAccessLogSchema.index({ resourceType: 1, accessType: 1 });
DataAccessLogSchema.index({ timestamp: -1 });

// ==================== EXPORT ALL MODELS ====================
module.exports = {
  UserActivityLog: mongoose.model("UserActivityLog", UserActivityLogSchema),
  UserChangeLog: mongoose.model("UserChangeLog", UserChangeLogSchema),
  LoginHistory: mongoose.model("LoginHistory", LoginHistorySchema),
  SecurityEventLog: mongoose.model("SecurityEventLog", SecurityEventLogSchema),
  AdminActionLog: mongoose.model("AdminActionLog", AdminActionLogSchema),
  DataAccessLog: mongoose.model("DataAccessLog", DataAccessLogSchema),
};
