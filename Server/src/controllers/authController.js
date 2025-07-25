const User = require("../models/user");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");

dotenv.config(); // Load environment variables

// -------------------- Utility: Generate Tokens -------------------- //
const generateTokens = (user) => {
  const payload = {
    UserInfo: {
      id: user._id,
      username: user.username,
      role: user.role,
    },
  };

  const accessToken = jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_ACCESS_TOKEN_EXPIRATION || "15m",
  });

  const refreshToken = jwt.sign(payload, process.env.JWT_REFRESH_SECRET, {
    expiresIn: process.env.JWT_REFRESH_TOKEN_EXPIRATION || "7d",
  });

  return { accessToken, refreshToken };
};

// -------------------- Utility: Set Refresh Token Cookie -------------------- //
const setRefreshTokenCookie = (res, token) => {
  res.cookie("jwt", token, {
    httpOnly: true, // Prevents JavaScript access (XSS protection)
    secure: process.env.NODE_ENV === "production", // HTTPS only in production
    sameSite: "Strict", // CSRF protection
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });
};

// -------------------- Controller: Register -------------------- //
const register = async (req, res) => {
  const {
    username,
    employeeEmail,
    password,
    role = "employee",
    ...fields
  } = req.body;

  // Required field validation
  const requiredFields = [
    "firstname",
    "lastname",
    "nationality",
    "civilStatus",
    "religion",
    "presentAddress",
    "province",
    "town",
    "city",
    "mobileNumber",
    "companyName",
    "employeeId",
    "jobposition",
    "corporaterank",
    "jobStatus",
    "location",
    "businessUnit",
    "department",
    "head",
    "employeeStatus",
    "salaryRate",
    "bankAccountNumber",
    "tinNumber",
    "sssNumber",
    "philhealthNumber",
  ];

  const missingField = requiredFields.find((field) => !fields[field]);
  if (!username || !employeeEmail || !password || missingField) {
    return res.status(400).json({
      message: `Missing required field: ${
        missingField || "username/employeeEmail/password"
      }`,
    });
  }

  try {
    // Check for duplicates
    const duplicateChecks = [
      { username },
      { employeeEmail },
      { employeeId: fields.employeeId },
    ];

    for (const check of duplicateChecks) {
      if (await User.findOne(check).lean().exec()) {
        return res.status(409).json({
          message: `Duplicate entry: ${Object.keys(check)[0]} already exists.`,
        });
      }
    }

    // Create and save new user
    const newUser = new User({
      username,
      employeeEmail,
      password, // Will be hashed by pre-save middleware
      role,
      ...fields,
    });

    await newUser.save();

    // Generate tokens and set refresh token cookie
    const { accessToken, refreshToken } = generateTokens(newUser);
    setRefreshTokenCookie(res, refreshToken);

    return res.status(201).json({
      message: "User registered successfully",
      accessToken,
      user: {
        id: newUser._id,
        username: newUser.username,
        employeeEmail: newUser.employeeEmail,
        role: newUser.role,
      },
    });
  } catch (error) {
    console.error("Registration error:", error);
    return res.status(500).json({
      message:
        error.name === "ValidationError"
          ? error.message
          : "Server error during registration.",
    });
  }
};

// -------------------- Controller: Login -------------------- //
const login = async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res
      .status(400)
      .json({ message: "Username and password are required." });
  }

  try {
    const user = await User.findOne({ username }).exec();
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ message: "Invalid credentials." });
    }

    const { accessToken, refreshToken } = generateTokens(user);
    setRefreshTokenCookie(res, refreshToken);

    return res.status(200).json({
      message: "Login successful",
      accessToken,
      user: {
        id: user._id,
        username: user.username,
        employeeEmail: user.employeeEmail,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({ message: "Server error during login." });
  }
};

// -------------------- Controller: Refresh Token -------------------- //
const refreshToken = async (req, res) => {
  const token = req.cookies?.jwt;
  if (!token)
    return res.status(401).json({ message: "No refresh token found." });

  jwt.verify(token, process.env.JWT_REFRESH_SECRET, async (err, decoded) => {
    if (err) {
      res.clearCookie("jwt");
      return res
        .status(403)
        .json({ message: "Invalid or expired refresh token." });
    }

    try {
      const user = await User.findById(decoded.UserInfo.id).exec();
      if (!user) return res.status(401).json({ message: "User not found." });

      const { accessToken, refreshToken: newRefreshToken } =
        generateTokens(user);
      setRefreshTokenCookie(res, newRefreshToken);

      return res.status(200).json({
        message: "Token refreshed successfully",
        accessToken,
        user: {
          id: user._id,
          username: user.username,
          employeeEmail: user.employeeEmail,
          role: user.role,
        },
      });
    } catch (error) {
      console.error("Refresh token error:", error);
      return res
        .status(500)
        .json({ message: "Server error during token refresh." });
    }
  });
};

// -------------------- Controller: Logout -------------------- //
const logout = (req, res) => {
  if (!req.cookies?.jwt) {
    return res.status(204).json({ message: "No refresh token to clear." });
  }
  res.clearCookie("jwt", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "Strict",
  });
  return res.status(200).json({ message: "Logout successful." });
};

module.exports = { register, login, refreshToken, logout };
