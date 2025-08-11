const user = require("../../models/user");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
// @desc Create a new employee (admin only)
// @route POST /employees
// @access Private (Admin)
const createEmployee = async (req, res) => {
  // 1. Authorization Check: Ensure only administrators and HR can create employees.
  if (req.user.role !== "admin" && req.user.role !== "hr") {
    return res.status(403).json({
      message: "Forbidden: Only administrators and HR can create employees.",
    });
  }

  // 2. Destructure Request Body: Extract necessary fields.
  //    employeeId is removed from here as it will be auto-generated.
  const { username, employeeEmail, password, role, ...otherFields } = req.body;

  // 3. Role-based restrictions: HR users cannot create admin or hr_manager roles
  if (req.user.role === "hr") {
    const restrictedRoles = ["admin", "hr_manager"];
    if (role && restrictedRoles.includes(role.toLowerCase())) {
      return res.status(403).json({
        message: "Forbidden: HR users can only create employee and hr roles.",
      });
    }
  }

  try {
    // 4. Centralized Duplicate Check Function:
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

    // 5. Perform Duplicate Checks for username and employeeEmail:
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

    // 6. Auto-generate employeeId: EMP0001, EMP0002, etc.
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

    // 7. Set default role based on user permissions
    let assignedRole;
    if (req.user.role === "hr") {
      // HR users can only assign 'employee' or 'hr' roles, default to 'employee'
      assignedRole = role && role.toLowerCase() === "hr" ? "hr" : "employee";
    } else {
      // Admin users can assign any role, default to 'employee'
      assignedRole = role || "employee";
    }

    // 8. Create New Employee:
    const newEmployee = new user({
      username,
      employeeEmail,
      password, // Password will be hashed by the pre-save hook
      role: assignedRole,
      employeeId: newEmployeeId, // Assign the auto-generated ID
      ...otherFields, // Include any other fields from the request body
    });

    // 9. Save Employee and Respond:
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
    // 10. Error Handling: Differentiate between validation errors and other server errors.
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
// @desc Update an employee (admin/hr only)
// @route PUT /employees/:id
// @access Private (Admin, HR)

/* const updateEmployee = async (req, res) => {
  const { id } = req.params;
  const updates = req.body;

  // Check if any updates were provided
  if (!updates || Object.keys(updates).length === 0) {
    return res.status(400).json({ message: "No update data provided." });
  }

  // Authorization check
  if (req.user.role !== "admin" && req.user.role !== "hr") {
    return res
      .status(403)
      .json({ message: "Unauthorized: insufficient permissions." });
  }

  // Date validation helper
  const parseDateSafely = (dateString) => {
    const parsed = new Date(dateString);
    return isNaN(parsed.getTime()) ? null : parsed;
  };

  const dateFields = [
    "employmentfromDate",
    "employmenttoDate",
    "dependentbirthDate",
    "birthday",
  ];

  for (const field of dateFields) {
    if (updates[field]) {
      const parsedDate = parseDateSafely(updates[field]);
      if (!parsedDate) {
        return res
          .status(400)
          .json({ message: `Invalid date format for ${field}` });
      }
      updates[field] = parsedDate;
    }
  }

  try {
    const employee = await user.findById(id);
    if (!employee) {
      return res.status(404).json({ message: "Employee not found." });
    }

    // Prevent deactivating last active admin
    if (
      updates.employeeStatus === 0 &&
      employee.role === "admin" &&
      employee.employeeStatus === 1
    ) {
      const activeAdmins = await user.countDocuments({
        _id: { $ne: employee._id },
        role: "admin",
        employeeStatus: 1,
      });

      if (activeAdmins < 1) {
        return res
          .status(400)
          .json({ message: "At least one active admin must remain." });
      }
    }

    const allowedFields = [
      "firstname",
      "lastname",
      "username",
      "suffix",
      "prefix",
      "gender",
      "birthday",
      "nationality",
      "civilStatus",
      "religion",
      "age",
      "presentAddress",
      "province",
      "town",
      "city",
      "mobileNumber",
      "employeeEmail",
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
      "role",
      "salaryRate",
      "bankAccountNumber",
      "tinNumber",
      "sssNumber",
      "philhealthNumber",
      "schoolName",
      "degree",
      "educationalAttainment",
      "educationFromYear",
      "educationToYear",
      "achievements",
      "dependantsName",
      "dependentsRelation",
      "dependentbirthDate",
      "employerName",
      "employeeAddress",
      "prevPosition",
      "employmentfromDate",
      "employmenttoDate",
      "password",
    ];

    let hasChanges = false;

    for (const field of allowedFields) {
      if (!(field in updates)) continue;

      // Role update restrictions
      if (field === "role" && req.user.role !== "admin") {
        return res
          .status(403)
          .json({ message: "Only admins can update roles." });
      }

      // Password update restrictions
      if (field === "password") {
        // Admins can update any employee's password (including their own)
        // HR users can update their own password and other employees' passwords
        // Regular employees can only update their own password
        if (
          req.user.role !== "admin" &&
          req.user.role !== "hr" &&
          req.user.id !== id
        ) {
          return res
            .status(403)
            .json({ message: "You can only update your own password." });
        }

        employee.password = updates.password;
        hasChanges = true;
        continue;
      }

      // Salary rate update restrictions
      if (field === "salaryRate" && (field === "salaryRate".length) === 0) {
        // HR users cannot modify their own salary rate
        if (req.user.role === "hr" && req.user.id === id) {
          return res.status(403).json({
            message: "HR users cannot modify their own salary rate and cannot be 0 ",
          });
        }

        // Only admins and HR can modify salary rates
        if (req.user.role !== "admin" && req.user.role !== "hr") {
          return res.status(403).json({
            message: "Only admins and HR can modify salary rates.",
          });
        }
      }

      const newVal = updates[field];
      const oldVal = employee[field];

      const changed =
        (newVal instanceof Date &&
          oldVal instanceof Date &&
          newVal.getTime() !== oldVal.getTime()) ||
        (typeof newVal === "number" && Number(newVal) !== Number(oldVal)) ||
        (typeof newVal === "string" &&
          String(newVal || "") !== String(oldVal || "")) ||
        (typeof newVal === "object" &&
          JSON.stringify(newVal || {}) !== JSON.stringify(oldVal || {}));

      if (changed) {
        employee[field] = newVal;
        hasChanges = true;
      }
    }

    if (!hasChanges) {
      return res.status(400).json({ message: "No changes detected." });
    }

    await employee.save();

    return res.status(200).json({
      message: "Employee updated successfully.",
      employee: {
        id: employee._id,
        username: employee.username,
        employeeEmail: employee.employeeEmail,
        role: employee.role,
        employeeStatus: employee.employeeStatus,
        employeeId: employee.employeeId,
      },
    });
  } catch (error) {
    console.error("Update error:", error);
    return res
      .status(500)
      .json({ message: "Server error while updating employee." });
  }
}; */

const updateEmployee = async (req, res) => {
  const { id } = req.params;
  const updates = req.body;

  // Check if any updates were provided
  if (!updates || Object.keys(updates).length === 0) {
    return res.status(400).json({ message: "No update data provided." });
  }

  // Authorization check
  if (req.user.role !== "admin" && req.user.role !== "hr") {
    return res
      .status(403)
      .json({ message: "Unauthorized: insufficient permissions." });
  }

  // Date validation helper
  const parseDateSafely = (dateString) => {
    const parsed = new Date(dateString);
    return isNaN(parsed.getTime()) ? null : parsed;
  };

  const dateFields = [
    "employmentfromDate",
    "employmenttoDate",
    "dependentbirthDate",
    "birthday",
  ];

  for (const field of dateFields) {
    if (updates[field]) {
      const parsedDate = parseDateSafely(updates[field]);
      if (!parsedDate) {
        return res
          .status(400)
          .json({ message: `Invalid date format for ${field}` });
      }
      updates[field] = parsedDate;
    }
  }

  try {
    const employee = await user.findById(id);
    if (!employee) {
      return res.status(404).json({ message: "Employee not found." });
    }

    // Prevent deactivating last active admin
    if (
      updates.employeeStatus === 0 &&
      employee.role === "admin" &&
      employee.employeeStatus === 1
    ) {
      const activeAdmins = await user.countDocuments({
        _id: { $ne: employee._id },
        role: "admin",
        employeeStatus: 1,
      });

      if (activeAdmins < 1) {
        return res
          .status(400)
          .json({ message: "At least one active admin must remain." });
      }
    }

    const allowedFields = [
      "firstname",
      "lastname",
      "username",
      "suffix",
      "prefix",
      "gender",
      "birthday",
      "nationality",
      "civilStatus",
      "religion",
      "age",
      "presentAddress",
      "province",
      "town",
      "city",
      "mobileNumber",
      "employeeEmail",
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
      "role",
      "salaryRate",
      "bankAccountNumber",
      "tinNumber",
      "sssNumber",
      "philhealthNumber",
      "pagibigNumber",
      "schoolName",
      "degree",
      "educationalAttainment",
      "educationFromYear",
      "educationToYear",
      "achievements",
      "dependantsName",
      "dependentsRelation",
      "dependentbirthDate",
      "employerName",
      "employeeAddress",
      "prevPosition",
      "employmentfromDate",
      "employmenttoDate",
      "password",
    ];

    let hasChanges = false;

    for (const field of allowedFields) {
      if (!(field in updates)) continue;

      // Role update restrictions
      if (field === "role" && req.user.role !== "admin") {
        return res
          .status(403)
          .json({ message: "Only admins can update roles." });
      }

      // Password update restrictions
      if (field === "password") {
        // Admins can update any employee's password (including their own)
        // HR users can update their own password and other employees' passwords
        // Regular employees can only update their own password
        if (
          req.user.role !== "admin" &&
          req.user.role !== "hr" &&
          req.user.id !== id
        ) {
          return res
            .status(403)
            .json({ message: "You can only update your own password." });
        }

        employee.password = updates.password;
        hasChanges = true;
        continue;
      }

      // Salary rate update restrictions
      if (field === "salaryRate") {
        // Only admins and HR can modify salary rates
        if (req.user.role !== "admin" && req.user.role !== "hr") {
          return res.status(403).json({
            message: "Only admins and HR can modify salary rates.",
          });
        }

        // HR users cannot modify their own salary rate
        if (req.user.role === "hr" && req.user.id === id) {
          console.log("HR users cannot modify their own salary rate.");
          /*  return res.status(403).json({
            message: "HR users cannot modify their own salary rate.",
          }); */
        }

        // Check if salary rate is zero or negative only if it's actually changing
        const newSalaryRate = Number(updates[field]);
        const oldSalaryRate = Number(employee[field] || 0);

        if (newSalaryRate !== oldSalaryRate && newSalaryRate <= 0) {
          return res.status(400).json({
            message: "Salary rate must be greater than zero.",
          });
        }
      }

      const newVal = updates[field];
      const oldVal = employee[field];

      const changed =
        (newVal instanceof Date &&
          oldVal instanceof Date &&
          newVal.getTime() !== oldVal.getTime()) ||
        (typeof newVal === "number" && Number(newVal) !== Number(oldVal)) ||
        (typeof newVal === "string" &&
          String(newVal || "") !== String(oldVal || "")) ||
        (typeof newVal === "object" &&
          JSON.stringify(newVal || {}) !== JSON.stringify(oldVal || {}));

      if (changed) {
        employee[field] = newVal;
        hasChanges = true;
      }
    }

    if (!hasChanges) {
      return res.status(400).json({ message: "No changes detected." });
    }

    await employee.save();

    return res.status(200).json({
      message: "Employee updated successfully.",
      employee: {
        id: employee._id,
        username: employee.username,
        employeeEmail: employee.employeeEmail,
        role: employee.role,
        employeeStatus: employee.employeeStatus,
        employeeId: employee.employeeId,
      },
    });
  } catch (error) {
    console.error("Update error:", error);
    return res
      .status(500)
      .json({ message: "Server error while updating employee." });
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
  const userId = req.user?.id;

  // Basic validation
  if (!userId) return res.status(401).json({ message: "Unauthorized" });
  if (!Array.isArray(ids))
    return res.status(400).json({ message: "Invalid IDs" });

  try {
    // Get active admins being deactivated
    const activeAdmins = await user.find({
      _id: { $in: ids },
      role: "admin",
      employeeStatus: 1,
    });

    // Count other active admins not being deactivated
    const otherActiveAdmins = await user.countDocuments({
      role: "admin",
      employeeStatus: 1,
      _id: { $nin: ids },
    });

    // Block if this would deactivate all admins
    if (activeAdmins.length > 0 && otherActiveAdmins === 0) {
      return res.status(400).json({
        message: "Must keep at least one active admin",
      });
    }

    // Deactivate the users
    const result = await user.updateMany(
      { _id: { $in: ids }, employeeStatus: 1 },
      { $set: { employeeStatus: 0 } }
    );

    return res.json({
      message: `Deactivated ${result.modifiedCount} users`,
      deactivated: result.modifiedCount,
    });
  } catch (error) {
    console.error("Deactivation error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  createEmployee,
  getAllEmployees,
  getEmployeeById,
  updateEmployee,

  deactiveSingle,
  deactivateBulk,
};
