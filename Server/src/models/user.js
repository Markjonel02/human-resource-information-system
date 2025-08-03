const mongoose = require("mongoose");
const bcrypt = require("bcrypt"); // Corrected typo from bcyrpt
const { Timestamp } = require("bson");

const UserSchema = new mongoose.Schema(
  {
    firstname: { type: String, required: true },
    lastname: { type: String, required: true },
    username: { type: String, required: true, unique: true }, // Added unique constraint for username
    suffix: { type: String },
    prefix: { type: String },
    password: { type: String, required: true },
    gender: {
      type: String,
      enum: ["male", "female", "nonbinary", "prefer not to say"],
      default: "prefer not to say",
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
      enum: ["catholic", "christian", "others"], // Consider making 'others' more flexible if needed
      required: true,
    },
    age: { type: Number, required: true }, // This will be calculated in pre-save hook
    presentAddress: { type: String, required: true },
    province: { type: String, required: true },
    town: { type: String, required: true },
    city: { type: String, required: true },
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
      unique: true,
      trim: true,
      match: /^EMP\d{3,4}$/, // Accepts EMP001 or EMP0001
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
      enum: ["Probitionary", "Regular", "Full-time", "Part-time"], // Corrected spelling
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
    salaryRate: { type: Number, required: true }, // still a number
    bankAccountNumber: { type: String, required: true }, // allows dashes
    tinNumber: { type: String, required: true }, // e.g. 123-456-789
    sssNumber: { type: String, required: true }, // e.g. 01-2345678-9
    philhealthNumber: { type: String, required: true }, // e.g. 12-3456789
    shcoolName: { type: String }, // Typo: Should be schoolName
    degree: { type: String },
    educationalAttainment: { type: String },
    educationFromYear: {
      type: String,
      match: /^\d{4}$/,
    },
    educationToYear: {
      type: String,
      match: /^\d{4}$/,
    },
    achievements: { type: String },
    dependants: { type: String }, // Consider making this an array of objects for multiple dependents
    dependentsRelation: { type: String },
    dependentbirthDate: { type: Date },
    employerName: { type: String },
    employeeAddress: { type: String },
    prevPosition: { type: String },
    employmentfromDate: { type: String, match: /^\d{4}$/ },
    employmenttoDate: { type: String, match: /^\d{4}$/ },
    // Added for authorization roles
    role: {
      type: String,
      enum: ["employee", "manager", "admin"],
      default: "employee",
    },
  },
  { timestamps: true }
);

// Hash password before saving and calculate age
UserSchema.pre("save", async function (next) {
  // Calculate age based on birthday
  const today = new Date();
  let age = today.getFullYear() - this.birthday.getFullYear();
  const monthDiff = today.getMonth() - this.birthday.getMonth();
  const dayDiff = today.getDate() - this.birthday.getDate();

  if (monthDiff < 0 || (monthDiff === 0 && dayDiff < 0)) {
    age--;
  }
  this.age = age; // Set the age field

  if (this.age < 18) {
    return next(new Error("User must be at least 18 years old!"));
  }

  // Password hashing
  if (!this.isModified("password")) return next(); // Only hash if password is new or modified

  try {
    const saltRounds = 10;
    const salt = await bcrypt.genSalt(saltRounds);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (err) {
    next(err);
  }
});
UserSchema.pre("validate", function (next) {
  if (this.corporaterank) {
    const input = this.corporaterank.toLowerCase().trim();

    if (input.includes("rank") && input.includes("file")) {
      this.corporaterank = "rank-and-file employees";
    }
  }

  next();
});

// Method to compare password (for login)
UserSchema.methods.comparePassword = async function (candidatePassword) {
  try {
    return await bcrypt.compare(candidatePassword, this.password);
  } catch (error) {
    throw new Error(error);
  }
};

module.exports = mongoose.model("user", UserSchema);
