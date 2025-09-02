const mongoose = require("mongoose");
const OverTimeScheme = new mongoose.Schema(
  {
    employee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employee",
      required: true,
    },
    date: { type: Date, required: true },
    hours: { type: Number, required: true },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
    reason: { type: String, required: true },
    overtimeType: {
      type: String,
      enum: ["regular", "holiday", "weekend", "other"],
      default: "regular",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("OverTime", OverTimeScheme);
