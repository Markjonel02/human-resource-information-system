const mongoose = require("mongoose");

const policySchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  filePath: { type: String, required: true },
  uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: "user" },
  uploadedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Policy", policySchema);
