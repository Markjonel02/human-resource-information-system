const mongoose = require("mongoose");

const upcomingEventsSchema = new mongoose.Schema({
  employee: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "user",
  },
  title: { type: String, required: true },
  description: { type: String },
  date: { type: String, required: true },
  time: { type: String, required: true },
  duration: { type: Number, default: 60 },
  type: {
    type: String,
    enum: ["meeting", "call", "review", "task"],
    default: "meeting",
  },
  priority: {
    type: String,
    enum: ["low", "medium", "high"],
    default: "medium",
  },
  participants: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
    },
  ],
  createdAt: { type: Date, default: Date.now },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "user",
    required: true,
  },
  done: { type: Boolean, default: false },
  markDoneBy: { type: mongoose.Schema.Types.ObjectId, ref: "user" },
  markDoneAt: { type: Date },
});

const upcomingEvents = mongoose.model("upcomingEvent", upcomingEventsSchema);
module.exports = upcomingEvents;
