const user = require("../../models/user");
const jwt = require("jsonwebtoken");
// @desc Create a new employee (admin only)
// @route POST /employees
// @access Private (Admin)
const createEmployee = async (req, res) => {
  // 1. Authorization Check: Ensure only administrators can create employees.
  if (req.user.role !== "admin" && req.user.role !== "hr") {
    return res.status(403).json({
      message: "Forbidden: Only administrators can create employees.",
    });
  }

  // 2. Destructure Request Body: Extract necessary fields.
  //    employeeId is removed from here as it will be auto-generated.
  const { username, employeeEmail, password, role, ...otherFields } = req.body;

  try {
    // 3. Centralized Duplicate Check Function:
    //    This function checks for existing username or employeeEmail.
    const checkDuplicate = async (field, value, message) => {
      const query = {};
      query[field] = value;
      const existingUser = await user.findOne(query).lean().exec();
      if (existingUser) {
        return res.status(409).json({ message });
      }
      return null; // No duplicate found
    };

    // 4. Perform Duplicate Checks for username and employeeEmail:
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

    // 5. Auto-generate employeeId: EMP0001, EMP0002, etc.
    let newEmployeeId;
    const lastEmployee = await user
      .findOne({ employeeId: /^EMP/ }) // Find documents where employeeId starts with 'EMP'
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

    // 6. Create New Employee:
    const newEmployee = new user({
      username,
      employeeEmail,
      password, // Password will be hashed by the pre-save hook
      role: role || "employee", // Admin can specify role, default to 'employee'
      employeeId: newEmployeeId, // Assign the auto-generated ID
      ...otherFields, // Include any other fields from the request body
    });

    // 7. Save Employee and Respond:
    await newEmployee.save(); // This will trigger the pre-save hook for password hashing

    res.status(201).json({
      message: "Employee created successfully!", // More user-friendly success message
      employee: {
        id: newEmployee._id,
        username: newEmployee.username,
        employeeEmail: newEmployee.employeeEmail,
        role: newEmployee.role,
        employeeId: newEmployee.employeeId, // Return the newly generated ID
      },
    });
  } catch (error) {
    // 8. Error Handling: Differentiate between validation errors and other server errors.
    console.error("Error creating employee:", error); // More specific error logging

    if (error.name === "ValidationError") {
      return res.status(400).json({ message: error.message });
    }
    res.status(500).json({ message: "Server error during employee creation." });
  }
};

// Assuming 'User' is your Mongoose User model, and 'generateTokens' and 'setRefreshTokenCookie' are defined elsewhere.

const createAdmin = async (req, res) => {
  // 1. Authorization Check: Ensure only administrators can create other administrators.
  if (req.user.role !== "admin") {
    return res.status(403).json({
      message:
        "Forbidden: Only administrators can create other administrators.",
    });
  }

  // 2. Destructure Request Body: employeeId is removed as it will be auto-generated.
  //    Ensure only expected fields are destructured to prevent unexpected data insertion.
  const { username, employeeEmail, password, ...otherFields } = req.body;

  try {
    // Helper function to check for duplicates and throw a custom error if found.
    // This allows the main try-catch block to handle all error responses.
    const checkDuplicate = async (field, value, message) => {
      const query = {};
      query[field] = value;
      const existingUser = await User.findOne(query).lean().exec();
      if (existingUser) {
        // Create a custom error with a status code property
        const error = new Error(message);
        error.statusCode = 409; // Conflict status code
        throw error;
      }
    };

    // 3. Perform Duplicate Checks for username and employeeEmail:
    await checkDuplicate(
      "username",
      username,
      "Username already exists! Please choose a different username."
    );

    await checkDuplicate(
      "employeeEmail",
      employeeEmail,
      "Employee email already exists! Please use a different email address."
    );

    // 4. Auto-generate employeeId: EMP0001, EMP0002, etc.
    let newEmployeeId;
    // Find the last employee with an ID starting with 'EMP' to determine the next sequential ID.
    const lastEmployee = await User.findOne({ employeeId: /^EMP/ })
      .sort({ employeeId: -1 }) // Sort in descending order to get the highest numeric ID
      .limit(1) // Get only one document
      .lean()
      .exec();

    if (lastEmployee && lastEmployee.employeeId) {
      // Extract the numeric part (e.g., '0012' from 'EMP0012')
      const lastIdNum = parseInt(lastEmployee.employeeId.substring(3), 10);
      // Increment the number and format it back with leading zeros (e.g., 12 -> 13 -> '0013')
      const nextIdNum = String(lastIdNum + 1).padStart(4, "0");
      newEmployeeId = `EMP${nextIdNum}`;
    } else {
      // If no existing employee IDs found, start from EMP0001
      newEmployeeId = "EMP0001";
    }

    // 5. Create new Admin user instance.
    const newUser = new User({
      username,
      employeeEmail,
      password, // Password will be hashed by a pre-save Mongoose middleware (assumed to be in place)
      role: "admin", // Explicitly set the role to 'admin'
      employeeId: newEmployeeId, // Assign the auto-generated ID
      ...otherFields, // Include any other fields passed in the request body
    });

    // Save the new user to the database.
    await newUser.save();

    // 6. Generate authentication tokens and set the refresh token cookie.
    // These functions are assumed to be defined and handle token creation and cookie setting.
    const { accessToken, refreshToken } = generateTokens(newUser);
    setRefreshTokenCookie(res, refreshToken);

    // 7. Send a successful response with the new admin's details and access token.
    return res.status(201).json({
      message: "Admin registered successfully",
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
    // Centralized error handling for all potential errors during the process.
    console.error("Admin registration error:", error); // Log the full error for debugging
    console.log("Error details:", error.message); // Log specific error message

    // Handle custom errors (like duplicates) with their specific status codes.
    if (error.statusCode) {
      return res.status(error.statusCode).json({ message: error.message });
    }
    // Handle Mongoose validation errors.
    if (error.name === "ValidationError") {
      return res.status(400).json({ message: error.message }); // 400 Bad Request for validation errors
    }
    // Handle any other unexpected server errors.
    return res.status(500).json({
      message:
        "Server error during admin registration. Please try again later.",
    });
  }
};

// @desc Get all employees (admin/manager only)
// @route GET /employees
// @access Private (Admin, Manager)
const getAllEmployees = async (req, res) => {
  if (req.user.role !== "admin" && req.user.role !== "hr") {
    return res.status(403).json({
      message: "Forbidden: You do not have a permission to view all employees",
    });
  }
  try {
    const employees = await user.find().select("-password").lean().exec(); //exclue password
    if (!employees?.length) {
      return res.status(404).json({ message: "No Employees found!" });
    }
    res.status(200).json(employees);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server error while fetching employees!" });
  }
};
// @desc Get a single employee by ID (admin/manager/self)
// @route GET /employees/:id
// @access Private (Admin, Manager, Employee - self)

const getEmployeeById = async (req, res) => {
  const { id } = req.params;

  if (
    req.user.role !== "admin" &&
    req.user.role !== "hr" &&
    req.user.id !== id
  ) {
    return res.status(403).json({
      message:
        "Forbidden: You do not have permision to view this employees profile ",
    });
  }
  try {
    const employee = await user.findById(id).select("-password").lean().exec();

    if (!employee) {
      return res.status(404).json({ message: "Employee not found" });
    }

    // this reander the full data of employee
    res.status(200).json(employee);
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Server error while fetching the employee" });
  }
};

// @desc Update an employee (admin/manager only)
// @route PUT /employees/:id
// @access Private (Admin, Manager)
const updateEmployee = async (req, res) => {
  const { id } = req.params;
  const { password, role, ...updates } = req.body;

  const isAdmin = req.user.role === "admin";
  const isHR = req.user.role === "hr";

  if (!isAdmin && !isHR) {
    return res.status(403).json({
      message: "Forbidden: No permission to update employee profiles.",
    });
  }

  try {
    const employee = await user.findById(id).exec();
    if (!employee)
      return res.status(404).json({ message: "Employee not found." });

    const changedFields = [];
    const unchangedFields = [];
    let hasChanges = false;

    const isDifferent = (a, b) => {
      if (a instanceof Date && b instanceof Date) {
        return a.getTime() !== b.getTime();
      }
      if (
        typeof a === "object" &&
        a !== null &&
        typeof b === "object" &&
        b !== null
      ) {
        return JSON.stringify(a) !== JSON.stringify(b);
      }
      return String(a) !== String(b);
    };

    // Check regular fields first
    for (const [key, newValue] of Object.entries(updates)) {
      const currentValue = employee[key];
      if (isDifferent(currentValue, newValue)) {
        changedFields.push(key);
        hasChanges = true;
      } else {
        unchangedFields.push(key);
      }
    }

    // Check role separately
    if (role !== undefined) {
      if (!isAdmin && role !== employee.role) {
        return res
          .status(403)
          .json({ message: "Only administrators can change roles." });
      }

      if (role !== employee.role) {
        changedFields.push("role");
        hasChanges = true;
      } else {
        unchangedFields.push("role");
      }
    }

    // Check password separately
    if (password !== undefined) {
      const isSamePassword = await employee.comparePassword(password);
      if (!isSamePassword) {
        changedFields.push("password");
        hasChanges = true;
      } else {
        unchangedFields.push("password");
      }
    }

    if (!hasChanges) {
      return res.status(200).json({
        message: "No changes detected. Employee data remains unchanged.",
        changedFields: [],
        unchangedFields,
      });
    }

    // Apply changes
    for (const field of changedFields) {
      if (field === "password") {
        employee.password = password;
      } else if (field === "role") {
        employee.role = role;
      } else {
        employee[field] = updates[field];
      }
    }

    const updatedEmployee = await employee.save();

    return res.status(200).json({
      message: "Employee updated successfully",
      changedFields,
      unchangedFields,
      employee: {
        _id: updatedEmployee._id,
        firstname: updatedEmployee.firstname,
        lastname: updatedEmployee.lastname,
        employeeEmail: updatedEmployee.employeeEmail,
        role: updatedEmployee.role,
        employeeStatus: updatedEmployee.employeeStatus,
      },
    });
  } catch (error) {
    console.error(error);

    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      return res
        .status(400)
        .json({ message: `${field} already exists`, field });
    }

    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((val) => val.message);
      return res
        .status(400)
        .json({ message: "Validation error", errors: messages });
    }

    return res.status(500).json({
      message: "Server error while updating employee.",
      error: error.message,
    });
  }
};

const deactiveSingle = async (req, res) => {
  const { id } = req.params;

  // Authorization check
  if (req.user.role !== "admin" && req.user.role !== "hr") {
    return res
      .status(401)
      .json({ message: "Unauthorized: insufficient permissions." });
  }

  try {
    const userToDeactivate = await user.findById(id).exec();
    if (!userToDeactivate) {
      return res.status(404).json({ message: "User not found." });
    }

    if (userToDeactivate.employeeStatus === 0) {
      return res.status(400).json({
        message: "Warning: User is already inactive.",
      });
    }

    // If the user being deactivated is an admin, check how many active admins are left
    if (userToDeactivate.role === "admin") {
      const activeAdmins = await user.countDocuments({
        role: "admin",
        employeeStatus: 1, // active
        _id: { $ne: userToDeactivate._id }, // exclude the one being deactivated
      });

      if (activeAdmins < 1) {
        return res.status(400).json({
          message: "Cannot deactivate. At least one active admin must remain.",
        });
      }
    }

    // Deactivate user
    userToDeactivate.employeeStatus = 0;
    await userToDeactivate.save();

    return res.status(200).json({ message: "User deactivated successfully." });
  } catch (error) {
    console.error("Error during deactivation:", error);
    return res
      .status(500)
      .json({ message: "Server error while deactivating user." });
  }
};

const deactivateBulk = async (req, res) => {
  const { ids } = req.body;
  const userId = req.user.id;

  if (req.user.role !== "admin" && req.user.role !== "hr") {
    return res.status(401).json({
      message:
        "Forbidden: you do not have permission to deactivate these users.",
    });
  }

  if (!userId || !Array.isArray(ids) || ids.length === 0) {
    return res
      .status(400)
      .json({ message: "Invalid request. Expected non-empty array of IDs." });
  }

  try {
    const users = await user.find({ _id: { $in: ids } });

    const activeIds = users
      .filter((u) => u.employeeStatus === 1)
      .map((u) => u._id);

    const alreadyInactive = users.length - activeIds.length;

    // 🛡 Check if this would remove all active admins
    const activeAdminCount = await user.countDocuments({
      role: "admin",
      employeeStatus: 1,
      _id: { $nin: ids }, // Ensure we exclude those being deactivated
    });

    if (activeAdminCount === 0) {
      return res.status(400).json({
        message: "Operation blocked: must keep at least one active admin.",
      });
    }

    const result = await user.updateMany(
      { _id: { $in: activeIds } },
      { $set: { employeeStatus: 0 } }
    );

    return res.status(200).json({
      message: `${result.modifiedCount} employee(s) deactivated. ${alreadyInactive} already inactive.`,
    });
  } catch (error) {
    console.error("Bulk deactivation error:", error);
    return res.status(500).json({ message: "Server error. Please try again." });
  }
};

module.exports = {
  createEmployee,
  getAllEmployees,
  getEmployeeById,
  updateEmployee,
  createAdmin,
  deactiveSingle,
  deactivateBulk,
};
