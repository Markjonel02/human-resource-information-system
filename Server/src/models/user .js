const mongoose = require("mongoose");
const bcyrpt = require("bcrypt");
const { MaxKey } = require("bson");
const UserSchema = new mongoose.Schema({
  firstname: { type: String, required: true },
  lastname: { type: String, required: true },
  username: { type: String, required: true },
  suffix: { type: String, required: true },
  prefix: { type: String, required: true },
  password: { type: String, required: true },
  gender: {
    type: String,
    enum: ["male", "female", "nonbinary", "prefer not to say"],
    default: "prefer not to say",
  },
  birthday: { type: Date, required: true },
  nationality: { type: String, required: true },
  sivilstatus: {
    type: String,
    enum: [
      "single",
      "married",
      "widowed",
      "divorced",
      "annulled",
      "legally separated",
    ],
    required: true,
  },
  religion: {
    type: String,
    enum: ["catholic", "christian", "others"],
    required: true,
  },
  age: { type: Number, required: true },
  presentAddress: { type: String, required: true },
  province: { type: String, rquired: true },
  city: { type: String, required: true },
  town: { type: String, rquired: true },
  mobileNumber: { type: String, required: true, match: /^09\d{9}$/ },
  employeeEmail: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  },
  companyName: { type: String, required: true },
  employeeId: {
    type: String,
    required: true,
    unique: true, // Prevent duplicate entries
    trim: true, // Removes accidental leading/trailing spaces
    match: /^EMP-\d{4}$/,
  },
  jobposition: { type: String, required: true },
  corporaterank: {
    type: String,
    required: true,
    enum: [
      "managerial employees",
      "managerial staff",
      "supervisory employees",
      "rank-and-file employee",
    ],
  },
  jobStatus: {
    type: String,
    required: true,
    enum: ["probisionary", "regular"],
  },
  location: { type: String, required: true },
  businessUnit: { type: String, required: true },
  department: { type: String, required: true },
  head: { type: String, required: true },
  employeeStatus: {
    type: Number,
    required: true,
    enum: [0, 1], // 0 = Inactive, 1 = Active
  },
  salaryRate: { type: Number, required: true },
  bankAccountNumber: { type: Number, required: true },
  tinNumber: { type: Number, required: true },
  sssNumber: { type: Number, required: true },
  philhealthNumber: { type: Number, required: true },
  shoolName: { type: String, required: true },
  degree: { type: String, required: true },
  educationalAttainment: { type: String, required: true },
  educationFromYear: {
    type: String,
    required: true,
    match: /^\d{4}$/,
  },
  educationToYear: {
    type: String,
    required: true,
    match: /^\d{4}$/,
  },
  achivements: { type: String, required: true },
  dependants: { type: String, required: true },
  dependatsRelation: { type: String, required: true },
  dependantbirthDate: { type: Date, required: true },
  employerName: { type: String, required: true },
  employeeAddress: { type: String, required: true },
  prevPosition: { type: String, required: true },
  employmentfromDate: { type: String, required: true, match: /^\d{4}$/ },
  employmenttoDate: { type: String, required: true, match: /^\d{4}$/ },
});

// Hash password before saving
UserSchema.pre("save", async function (next) {
  const today = new Date();

  // Age validation first
  const age = today.getFullYear() - this.birthday.getFullYear();
  if (age < 18) {
    return next(new Error("User must be at least 18 years old!"));
  }

  // Password hashing
  if (!this.isModified("password")) return next();

  try {
    const saltRounds = 10;
    const salt = await bcrypt.genSalt(saltRounds);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (err) {
    next(err);
  }
});

module.exports = ("User", UserSchema);
