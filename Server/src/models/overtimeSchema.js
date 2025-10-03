const mongoose = require("mongoose");

const OverTimeScheme = new mongoose.Schema(
  {
    employee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
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
    totalOvertimeDays: {
      type: Number,
      required: true,
      default: 1,
    },
    hours: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
    reason: {
      type: String,
      required: true,
    },
    overtimeType: {
      type: String,
      enum: ["regular", "holiday", "weekend", "other"],
      default: "regular",
    },
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      default: null,
    },
    rejectedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      default: null,
    },
    rejectedAt: {
      type: Date,
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
  { timestamps: true }
);

// Prevent duplicate overtime requests for the same period
OverTimeScheme.index({ employee: 1, dateFrom: 1, dateTo: 1 }, { unique: true });

// Pre-save middleware to calculate total overtime days
OverTimeScheme.pre("save", function (next) {
  if (this.dateFrom && this.dateTo) {
    const timeDiff = this.dateTo - this.dateFrom;
    this.totalOvertimeDays = Math.ceil(timeDiff / (1000 * 60 * 60 * 24)) + 1;
  }
  next();
});

module.exports = mongoose.model("OverTime", OverTimeScheme);
