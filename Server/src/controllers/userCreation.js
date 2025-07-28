const user = require("../models/user");

// @desc Create a new employee (admin only)
// @route POST /employees
// @access Private (Admin)
const createEmployee = async (req, res) => {
  // 1. Authorization Check: Ensure only administrators can create employees.
  if (req.user.role !== "admin") {
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
      const existingUser = await User.findOne(query).lean().exec();
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

    // 6. Create New Employee:
    const newEmployee = new User({
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

const createAdmin = async (req, res) => {
  const { username, employeeEmail, employeeId, password, ...otherFields } =
    req.body;

  if (req.user.role === "admin") {
    // Admin-specific logic here
    try {
      // Check for duplicates
      const duplicateChecks = [{ username }, { employeeEmail }, { employeeId }];

      for (const check of duplicateChecks) {
        if (await User.findOne(check).lean().exec()) {
          return res.status(409).json({
            message: `Duplicate entry: ${
              Object.keys(check)[0]
            } already exists.`,
          });
        }
      }

      // Create and save new user
      const newUser = new User({
        username,
        employeeEmail,
        password, // Will be hashed by pre-save middleware
        role: "admin", // Set role to admin
        ...otherFields,
      });

      await newUser.save();

      // Generate tokens and set refresh token cookie
      const { accessToken, refreshToken } = generateTokens(newUser);
      setRefreshTokenCookie(res, refreshToken);

      return res.status(201).json({
        message: "Admin registered successfully",
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
      console.log("Error details:", error);
      return res.status(500).json({
        message:
          error.name === "ValidationError"
            ? error.message
            : "Server error during registration.",
      });
    }
  }
};

// @desc Get all employees (admin/manager only)
// @route GET /employees
// @access Private (Admin, Manager)
const getAllEmployees = async (req, res) => {
  if (req.user.role !== "admin" && req.user.role !== "manager") {
    return res.status(403).json({
      message: "Forbidden: You do not have a permission to view all employees",
    });
  }
  try {
    const employees = await User.find().select("-password").lean().exec(); //exclue password
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

  // Allow admin/manager to view any employee, or  employee to view  their own profile
  if (
    req.user.role !== "admin" &&
    req.user.role !== "manager" &&
    req.user.id !== id
  ) {
    return res.status(403).json({
      message:
        "Forbidden: You do not have permision to view this employees profile ",
    });
  }
  try {
    const employee = await User.findById(id).select("-password").lean().exect(); //exclue || ignore finding
    if (!employee) {
      return res.status(404).json({ message: "Employee not found" });
    }
    res.status(200).json({ message: `found employee: ${emeployee}` });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .josn({ message: "Server error while fetching the employee" });
  }
};

// @desc Update an employee (admin/manager only)
// @route PUT /employees/:id
// @access Private (Admin, Manager)
const updateEmployee = async (req, res) => {
  const { id } = req.params;
  const { password, role, ...updates } = req.body; // Exclude password from direct updates here

  // Only admins and managers can update employee profiles
  if (req.user.role !== "admin" && req.user.role !== "manager") {
    return res.status(403).json({
      message:
        "Forbidden: You do not have permission to update employee profiles.",
    });
  }

  try {
    const employee = await User.findById(id).exec();
    if (!employee) {
      return res.status(404).json({ message: "Employee not found." });
    }

    // Prevent non-admins from changing roles
    if (
      req.user.role !== "admin" &&
      updates.role &&
      updates.role !== employee.role
    ) {
      return res.status(403).json({
        message: "Forbidden: Only administrators can change employee roles.",
      });
    }
    // If an admin is updating the role, apply it
    if (req.user.role === "admin" && role) {
      employee.role = role;
    }
    // Define allowed fields for update
    const allowedFields = [
      "firstname",
      "lastname",
      "employeeEmail",
      "department",
      "employeeStatus",
    ];
    // Apply updates
    Object.keys(updates).forEach((key) => {
      if (allowedFields.includes(key)) {
        employee[key] = updates[key];
      }
    });

    // If password is provided, hash it
    if (password) {
      employee.password = password; // The pre-save hook will hash this
    }

    await employee.save(); // This will trigger the pre-save hook for password hashing and age calculation

    res
      .status(200)
      .json({ message: "Employee updated successfully", employee });
  } catch (error) {
    console.error(error);
    if (error.name === "ValidationError") {
      return res.status(400).json({ message: error.message });
    }
    res.status(500).json({ message: "Server error while updating employee." });
  }
};

module.exports = {
  createEmployee,
  getAllEmployees,
  getEmployeeById,
  updateEmployee,
  createAdmin,
};
