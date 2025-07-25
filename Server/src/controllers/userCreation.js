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

  // 2. Destructure Request Body: Extract necessary fields for clarity.
  const { username, employeeEmail, password, role, ...otherFields } = req.body;

  try {
    // 3. Centralized Duplicate Check Function:
    //    This function checks for existing username, employeeEmail, or employeeId.
    const checkDuplicate = async (field, value, message) => {
      const query = {};
      query[field] = value;
      const existingUser = await User.findOne(query).lean().exec();
      if (existingUser) {
        return res.status(409).json({ message });
      }
      return null; // No duplicate found
    };

    // 4. Perform Duplicate Checks:
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

    response = await checkDuplicate(
      "employeeId",
      otherFields.employeeId,
      "Employee ID already exists!"
    );
    if (response) return response;

    // 5. Create New Employee:
    const newEmployee = new User({
      username,
      employeeEmail,
      password, // Password will be hashed by the pre-save hook
      role: role || "employee", // Admin can specify role, default to 'employee'
      ...otherFields,
    });

    // 6. Save Employee and Respond:
    await newEmployee.save(); // This will trigger the pre-save hook for password hashing

    res.status(201).json({
      message: "Employee created successfully!", // More user-friendly success message
      employee: {
        // Use a more descriptive key than 'message' for the employee data
        id: newEmployee._id,
        username: newEmployee.username,
        employeeEmail: newEmployee.employeeEmail,
        role: newEmployee.role,
        employeeId: newEmployee.employeeId,
      },
    });
  } catch (error) {
    // 7. Error Handling: Differentiate between validation errors and other server errors.
    console.error("Error creating employee:", error); // More specific error logging

    if (error.name === "ValidationError") {
      return res.status(400).json({ message: error.message });
    }
    res.status(500).json({ message: "Server error during employee creation." });
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
};
