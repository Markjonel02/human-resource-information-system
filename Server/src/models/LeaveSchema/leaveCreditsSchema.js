const mongoose = require("mongoose");

const LeaveCreditsSchema = new mongoose.Schema(
  {
    employee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: true,
      unique: true,
    },
    year: {
      type: Number,
      required: true,
      default: () => new Date().getFullYear(),
    },
    credits: {
      VL: {
        total: { type: Number, default: 5 },
        used: { type: Number, default: 0 },
        remaining: { type: Number, default: 5 },
      },
      SL: {
        total: { type: Number, default: 5 },
        used: { type: Number, default: 0 },
        remaining: { type: Number, default: 5 },
      },
      LWOP: {
        total: { type: Number, default: 5 },
        used: { type: Number, default: 0 },
        remaining: { type: Number, default: 5 },
      },
      BL: {
        total: { type: Number, default: 5 },
        used: { type: Number, default: 0 },
        remaining: { type: Number, default: 5 },
      },

      CL: {
        total: { type: Number, default: 5 },
        used: { type: Number, default: 0 },
        remaining: { type: Number, default: 5 },
      },
    },
    lastResetDate: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Create compound index for employee and year
LeaveCreditsSchema.index({ employee: 1, year: 1 }, { unique: true });

// Method to reset credits annually
LeaveCreditsSchema.methods.resetCredits = function () {
  const leaveTypes = ["VL", "SL", "LWOP", "BL", "CL"];
  leaveTypes.forEach((type) => {
    this.credits[type].used = 0;
    this.credits[type].remaining = this.credits[type].total;
  });
  this.lastResetDate = new Date();
  this.year = new Date().getFullYear();
};

// Method to use leave credit
LeaveCreditsSchema.methods.useCredit = function (leaveType) {
  if (this.credits[leaveType] && this.credits[leaveType].remaining > 0) {
    this.credits[leaveType].used += 1;
    this.credits[leaveType].remaining -= 1;
    return true;
  }
  return false;
};

// Method to restore leave credit (when leave is cancelled/rejected)
LeaveCreditsSchema.methods.restoreCredit = function (leaveType) {
  if (this.credits[leaveType] && this.credits[leaveType].used > 0) {
    this.credits[leaveType].used -= 1;
    this.credits[leaveType].remaining += 1;
    return true;
  }
  return false;
};

module.exports = mongoose.model("LeaveCredits", LeaveCreditsSchema);
