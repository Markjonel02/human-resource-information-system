const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const UserSchema = new mongoose.Schema(
  {
    firstname: { type: String, required: true },
    lastname: { type: String, required: true },
    username: { type: String, required: true, unique: true },
    suffix: { type: String },
    prefix: { type: String },
    password: { type: String, required: true },

    gender: {
      type: String,
      enum: ["male", "female", "nonbinary", "prefer not to say"],
      required: true,
    },
    birthday: { type: Date, required: true },
    nationality: { type: String, required: true },
    civilStatus: {
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
    province: { type: String, required: true },
    town: { type: String, required: true },
    city: { type: String, required: true },

    mobileNumber: {
      type: String,
      required: true,
      match: /^09\d{9}$/,
    },
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
      unique: true,
      trim: true,
      match: /^EMP\d{3,4}$/,
    },

    jobposition: { type: String, required: true },
    corporaterank: {
      type: String,
      required: true,
      enum: [
        "managerial employees",
        "managerial staff",
        "supervisory employees",
        "rank-and-file employees",
      ],
    },
    jobStatus: {
      type: String,
      required: true,
      enum: ["probitionary", "regular"],
    },
    location: { type: String, required: true },
    businessUnit: { type: String, required: true },
    department: { type: String, required: true },
    head: { type: String, required: true },

    employeeStatus: {
      type: Number,
      required: true,
      enum: [0, 1],
    },

    salaryRate: { type: Number, required: true },
    bankAccountNumber: { type: String, required: true },
    tinNumber: { type: String, required: true },
    sssNumber: { type: String, required: true },
    philhealthNumber: { type: String, required: true },
    pagibigNumber: { type: String, required: true },

    schoolName: { type: String },
    degree: { type: String },
    educationalAttainment: { type: String },
    educationFromYear: { type: String, match: /^\d{4}$/ },
    educationToYear: { type: String, match: /^\d{4}$/ },
    achievements: { type: String },

    dependentsName: { type: String },
    dependentsRelation: { type: String },
    dependentbirthDate: { type: Date },

    employerName: { type: String },
    employeeAddress: { type: String },
    prevPosition: { type: String },
    employmentfromDate: { type: Date },
    employmenttoDate: { type: Date },

    role: {
      type: String,
      enum: ["employee", "manager", "admin", "hr"],
    },
  },
  { timestamps: true }
);

// 🔄 Normalize corporaterank input before validation
UserSchema.pre("validate", function (next) {
  if (this.corporaterank) {
    const input = this.corporaterank.toLowerCase().trim();
    if (input.includes("rank") && input.includes("file")) {
      this.corporaterank = "rank-and-file employees";
    }
  }
  next();
});

// 🔐 Pre-save: calculate age + hash password if changed
UserSchema.pre("save", async function (next) {
  // Age calculation
  if (this.birthday) {
    const today = new Date();
    let age = today.getFullYear() - this.birthday.getFullYear();
    const monthDiff = today.getMonth() - this.birthday.getMonth();
    const dayDiff = today.getDate() - this.birthday.getDate();
    if (monthDiff < 0 || (monthDiff === 0 && dayDiff < 0)) age--;

    this.age = age;

    if (this.age < 18) {
      return next(new Error("User must be at least 18 years old."));
    }
  }

  // Password hashing
  if (!this.isModified("password")) return next();

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    return next();
  } catch (err) {
    return next(err);
  }
});

// ✅ Instance method: compare plaintext with hashed password
UserSchema.methods.comparePassword = function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model("user", UserSchema);
