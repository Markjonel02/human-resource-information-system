// Announcement Schema

const mongoose = require("mongoose");
const cron = require("node-cron");
const nodemailer = require("nodemailer");
const AnnouncementSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: ["general", "birthday", "system", "urgent"],
      required: true,
    },
    postedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    expiresAt: {
      type: Date,
      default: null,
    },
    priority: {
      type: Number,
      enum: [1, 2, 3], // 1: high, 2: medium, 3: low
      default: 3,
    },
  },
  {
    timestamps: true,
  }
);
module.exports =
  mongoose.models.Announcement ||
  mongoose.model("Announcement", AnnouncementSchema);
