const mongoose = require("mongoose");

const PayrollHistorySchema = new mongoose.Schema(
  {
    payroll: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Payroll",
      required: true,
    },
    employee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },
    action: {
      type: String,
      enum: [
        "created",
        "updated",
        "submitted",
        "approved",
        "rejected",
        "processed",
        "paid",
      ],
      required: true,
    },
    previousValues: {
      type: Map,
      of: mongoose.Schema.Types.Mixed,
    },
    newValues: {
      type: Map,
      of: mongoose.Schema.Types.Mixed,
    },
    changedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },
    reason: String,
  },
  {
    timestamps: true,
  }
);

PayrollHistorySchema.index({ payroll: 1, createdAt: -1 });
PayrollHistorySchema.index({ employee: 1, createdAt: -1 });
PayrollHistorySchema.index({ createdAt: -1 });

module.exports =
  mongoose.models.PayrollHistory ||
  mongoose.model("PayrollHistory", PayrollHistorySchema); 
