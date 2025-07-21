const User = require("../models/User");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");

dotenv.config(); // Load environment variables

// Utility function to generate JWT tokens
const generateTokens = (user) => {
  const accessToken = jwt.sign(
    {
      UserInfo: {
        id: user._id,
        username: user.username,
        role: user.role,
      },
    },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_ACCESS_TOKEN_EXPIRATION || "15m" } // Default 15 minutes
  );

  const refreshToken = jwt.sign(
    {
      UserInfo: {
        id: user._id,
        username: user.username,
        role: user.role,
      },
    },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: process.env.JWT_REFRESH_TOKEN_EXPIRATION || "7d" } // Default 7 days
  );
  return { accessToken, refreshToken };
};

// @desc Register a new user
// @route POST /auth/register
// @access Public
const register = async (req, res) => {
  const { username, employeeEmail, password, role, ...otherFields } = req.body;

  // Basic validation
  if (
    !username ||
    !employeeEmail ||
    !password ||
    !otherFields.firstname ||
    !otherFields.lastname ||
    !otherFields.nationality ||
    !otherFields.civilStatus ||
    !otherFields.religion ||
    !otherFields.presentAddress ||
    !otherFields.province ||
    !otherFields.town ||
    !otherFields.city ||
    !otherFields.mobileNumber ||
    !otherFields.companyName ||
    !otherFields.employeeId ||
    !otherFields.jobposition ||
    !otherFields.corporaterank ||
    !otherFields.jobStatus ||
    !otherFields.location ||
    !otherFields.businessUnit ||
    !otherFields.department ||
    !otherFields.head ||
    otherFields.employeeStatus === undefined ||
    !otherFields.salaryRate ||
    !otherFields.bankAccountNumber ||
    !otherFields.tinNumber ||
    !otherFields.sssNumber ||
    !otherFields.philhealthNumber
  ) {
    return res
      .status(400)
      .json({ message: "All required fields are necessary for registration." });
  }

  try {
    // Check for duplicate username or email
    const duplicateUser = await User.findOne({ username }).lean().exec();
    if (duplicateUser) {
      return res.status(409).json({ message: "Username already exists." });
    }
    const duplicateEmail = await User.findOne({ employeeEmail }).lean().exec();
    if (duplicateEmail) {
      return res
        .status(409)
        .json({ message: "Employee email already exists." });
    }
    const duplicateEmployeeId = await User.findOne({
      employeeId: otherFields.employeeId,
    })
      .lean()
      .exec();
    if (duplicateEmployeeId) {
      return res.status(409).json({ message: "Employee ID already exists." });
    }

    // Create new user
    const newUser = new User({
      username,
      employeeEmail,
      password, // Password will be hashed by the pre-save hook
      role: role || "employee", // Default role to 'employee' if not provided
      ...otherFields,
    });

    await newUser.save(); // This will trigger the pre-save hook for password hashing and age calculation

    // Generate tokens for immediate login after registration
    const { accessToken, refreshToken } = generateTokens(newUser);

    // Set refresh token as httpOnly cookie
    res.cookie("jwt", refreshToken, {
      httpOnly: true, // Accessible only by web server
      secure: process.env.NODE_ENV === "production", // Use HTTPS in production
      sameSite: "Strict", // CSRF protection
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    res.status(201).json({
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
    console.error(error);
    if (error.name === "ValidationError") {
      return res.status(400).json({ message: error.message });
    }
    res.status(500).json({ message: "Server error during registration." });
  }
};

// @desc Authenticate user & get token
// @route POST /auth/login
// @access Public
const login = async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res
      .status(400)
      .json({ message: "Username and password are required." });
  }

  try {
    const foundUser = await User.findOne({ username }).exec();

    if (!foundUser) {
      return res.status(401).json({ message: "Invalid credentials." });
    }

    const isMatch = await foundUser.comparePassword(password);

    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials." });
    }

    const { accessToken, refreshToken } = generateTokens(foundUser);

    // Set refresh token as httpOnly cookie
    res.cookie("jwt", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "Strict",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    res.status(200).json({
      message: "Login successful",
      accessToken,
      user: {
        id: foundUser._id,
        username: foundUser.username,
        employeeEmail: foundUser.employeeEmail,
        role: foundUser.role,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error during login." });
  }
};

// @desc Refresh JWT token
// @route GET /auth/refresh
// @access Public (but requires refresh token cookie)
const refreshToken = (req, res) => {
  const cookies = req.cookies;

  if (!cookies?.jwt) {
    return res.status(401).json({ message: "Unauthorized: No refresh token." });
  }

  const refreshToken = cookies.jwt;

  jwt.verify(
    refreshToken,
    process.env.JWT_REFRESH_SECRET,
    async (err, decoded) => {
      if (err) {
        // Clear cookie if token is invalid or expired
        res.clearCookie("jwt", {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "Strict",
        });
        return res
          .status(403)
          .json({ message: "Forbidden: Invalid refresh token." });
      }

      try {
        const foundUser = await User.findById(decoded.UserInfo.id).exec();

        if (!foundUser) {
          return res
            .status(401)
            .json({ message: "Unauthorized: User not found." });
        }

        const { accessToken: newAccessToken, refreshToken: newRefreshToken } =
          generateTokens(foundUser);

        // Set new refresh token as httpOnly cookie
        res.cookie("jwt", newRefreshToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "Strict",
          maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        });

        res.status(200).json({
          message: "Token refreshed successfully",
          accessToken: newAccessToken,
          user: {
            id: foundUser._id,
            username: foundUser.username,
            employeeEmail: foundUser.employeeEmail,
            role: foundUser.role,
          },
        });
      } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error during token refresh." });
      }
    }
  );
};

// @desc Logout user & clear cookie
// @route POST /auth/logout
// @access Public
const logout = (req, res) => {
  const cookies = req.cookies;
  if (!cookies?.jwt) {
    return res
      .status(204)
      .json({ message: "No content: No refresh token to clear." }); // No content to send back
  }
  res.clearCookie("jwt", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "Strict",
  });
  res.status(200).json({ message: "Logout successful: Cookie cleared." });
};

module.exports = {
  register,
  login,
  refreshToken,
  logout,
};
