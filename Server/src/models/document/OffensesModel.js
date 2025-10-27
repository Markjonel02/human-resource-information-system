const mongoose = require("mongoose");

const OffensesSchema = new mongoose.Schema(
  {
    employee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    severity: {
      type: String,
      enum: ["minor", "moderate", "major", "critical"],
      required: true,
      default: "minor",
    },
    date: {
      type: Date,
      required: true,
      default: Date.now,
    },
    description: {
      type: String,
      trim: true,
    },
    recordedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: false,
    },
    status: {
      type: String,
      enum: ["pending", "acknowledged", "resolved"],
      default: "pending",
    },
    category: {
      type: String,
      enum: [
        "attendance",
        "conduct",
        "performance",
        "insubordination",
        "other",
      ],
    },
    actionTaken: {
      type: String,
      trim: true,
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

// Index for faster queries
OffensesSchema.index({ employee: 1, date: -1 });
OffensesSchema.index({ severity: 1 });
OffensesSchema.index({ status: 1 });

module.exports = mongoose.model("Offenses", OffensesSchema);
