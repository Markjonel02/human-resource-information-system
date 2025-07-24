const User = require("../models/user");

const CreateEmployee = async (req, res) => {
  try {
    const { username, password, employeeEmail, ...otherFields } = req.body;

    // Required fields
    const requiredMain = ["username", "password", "employeeEmail"];
    const requiredFields = [
      "firstname",
      "lastname",
      "birthday",
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

    // Validate required main fields
    if (!username || !password || !employeeEmail) {
      return res
        .status(400)
        .json({ message: "Username, email, and password are required." });
    }

    // Validate other required fields
    for (const field of requiredFields) {
      if (otherFields[field] === undefined || otherFields[field] === "") {
        return res
          .status(400)
          .json({ message: `Field '${field}' is required.` });
      }
    }

    // Check duplicates in parallel
    const [emailExists, idExists, usernameExists] = await Promise.all([
      User.findOne({ employeeEmail }).lean(),
      User.findOne({ employeeId: otherFields.employeeId }).lean(),
      User.findOne({ username }).lean(),
    ]);

    if (emailExists)
      return res.status(409).json({ message: "Email is already taken." });
    if (idExists)
      return res.status(409).json({ message: "Employee ID is already taken." });
    if (usernameExists)
      return res.status(409).json({ message: "Username is already taken." });

    // Create new employee
    const newEmployee = new User({
      username,
      password,
      employeeEmail,
      ...otherFields,
    });
    await newEmployee.save();

    return res.status(200).json({
      message: {
        id: newEmployee._id,
        username: newEmployee.username,
        employeeEmail: newEmployee.employeeEmail,
        employeeId: newEmployee.employeeId,
      },
    });
    console.log(`successfully created:${newEmployee}`);
  } catch (error) {
    console.error("CreateEmployee Error:", error);
    return res
      .status(500)
      .json({ message: "Server error during employee creation." });
  }
};


const getEmployee = async(req,res)=>{
  
}
module.exports = { CreateEmployee };
