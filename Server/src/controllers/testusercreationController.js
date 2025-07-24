const user = require("../models/user");

const CreateEmployee = async (req, res) => {
  const {
    username,
    password,
    employeeEmail, // fixed casing
    ...otherFields
  } = req.body;

  // Basic validation for required fields
  if (
    !username ||
    !employeeEmail ||
    !password ||
    !otherFields.firstname ||
    !otherFields.lastname ||
    !otherFields.birthday ||
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
    return res.status(400).json({
      message: "All required fields are necessary to create an employee.",
    });
  }

  try {
    const duplicateEmail = await user.findOne({ employeeEmail }).lean().exec();
    if (duplicateEmail) {
      return res.status(409).json({ message: "User email is already taken!" });
    }

    const duplicateEmployeeId = await user
      .findOne({ employeeId: otherFields.employeeId })
      .lean()
      .exec();
    if (duplicateEmployeeId) {
      return res.status(409).json({ message: "Employee ID is already taken!" });
    }

    const duplicateUsername = await user.findOne({ username }).lean().exec();
    if (duplicateUsername) {
      return res.status(409).json({ message: "Username already taken!" });
    }

    const newHired = new user({
      username,
      password,
      employeeEmail,
      ...otherFields,
    });

    await newHired.save();
    res.status(200).json({
      message: {
        id: newHired._id,
        username: newHired.username,
        employeeEmail: newHired.employeeEmail,
        employeeId: newHired.employeeId,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error during employee creation!" });
  }
};

module.exports = {
  CreateEmployee,
};
