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
  console.log("Access Token inside generateTokens:", accessToken); // Is it generated here?
  const refreshToken = jwt.sign(payload, process.env.JWT_REFRESH_SECRET, {
    expiresIn: process.env.JWT_REFRESH_TOKEN_EXPIRATION || "7d",
  });
  console.log("Refresh Token inside generateTokens:", refreshToken);

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
    role = "employee", // Default role to 'employee'
    ...fields // All other fields from the request body
  } = req.body;

  // Required field validation (employeeId is now auto-generated, so it's removed from here)
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

  // Check for missing required fields (excluding employeeId)
  const missingField = requiredFields.find((field) => !fields[field]);
  if (!username || !employeeEmail || !password || missingField) {
    return res.status(400).json({
      message: `Missing required field: ${
        missingField || "username/employeeEmail/password"
      }`,
    });
  }

  try {
    // 1. Centralized Duplicate Check Function:
    //    This function checks for existing username or employeeEmail.
    const checkDuplicate = async (field, value, message) => {
      const query = {};
      query[field] = value;
      const existingUser = await User.findOne(query).lean().exec();
      if (existingUser) {
        return res.status(409).json({ message });
      }
      return null; // No duplicate found
    };

    // 2. Perform Duplicate Checks for username and employeeEmail:
    let response = await checkDuplicate(
      "username",
      username,
      "Username already exists!"
    );
    if (response) return response;

    response = await checkDuplicate(
      "employeeEmail",
      employeeEmail,
      "Employee email already exists!"
    );
    if (response) return response;

    // 3. Auto-generate employeeId: EMP0001, EMP0002, etc.
    let newEmployeeId;
    const lastEmployee = await User.findOne({ employeeId: /^EMP/ }) // Find documents where employeeId starts with 'EMP'
      .sort({ employeeId: -1 }) // Sort by employeeId in descending order (to get the highest number)
      .limit(1) // Get only the latest one
      .lean()
      .exec();

    if (lastEmployee && lastEmployee.employeeId) {
      // Extract the numeric part (e.g., '0012' from 'EMP0012')
      const lastIdNum = parseInt(lastEmployee.employeeId.substring(3), 10);
      // Increment and format with leading zeros (e.g., 12 -> 13 -> '0013')
      const nextIdNum = String(lastIdNum + 1).padStart(4, "0");
      newEmployeeId = `EMP${nextIdNum}`;
    } else {
      // If no existing employee IDs found, start from EMP0001
      newEmployeeId = "EMP0001";
    }

    // 4. Create and save new user
    const newUser = new User({
      username,
      employeeEmail,
      password, // Will be hashed by pre-save middleware
      role,
      employeeId: newEmployeeId, // Assign the auto-generated ID
      ...fields, // Include all other fields from the request body
    });

    await newUser.save();

    // 5. Generate tokens and set refresh token cookie
    const { accessToken, refreshToken } = generateTokens(newUser);
    console.log("Generated Access Token in register:", accessToken);
    console.log("Generated Refresh Token in register:", refreshToken);
    setRefreshTokenCookie(res, refreshToken);

    return res.status(201).json({
      message: "User registered successfully",
      accessToken,
      user: {
        id: newUser._id,
        username: newUser.username,
        employeeEmail: newUser.employeeEmail,
        role: newUser.role,
        employeeId: newUser.employeeId, // Return the newly generated ID
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
  const { username, password, setEmployeeStatus } = req.body;

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

    // if user is inactive
    if (user.employeeStatus !== 1) {
      return res
        .status(403)
        .json({ message: "Your account is inactive. Please contact support." });
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
        firstname: user.firstname,
        employeeStatus: user.employeeStatus, // ✅ Include this for frontend check
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
