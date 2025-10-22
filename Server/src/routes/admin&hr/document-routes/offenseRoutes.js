const express = require("express");
const router = express.Router();
const verifyJWT = require("../../../middlewares/verifyJWT");
const authorizeRoles = require("../../../middlewares/authorizeRole");

const {
  createOffense,
  getAllOffenses,
  getOffenseById,
  updateOffense,
  deleteOffense,
  getEmployeesWithMultipleLates,
  getOffensesByEmployee,
  searchEmployees,
  getMyOffenses,
} = require("../../../controllers/Admin/dcuments/offenses");

// ✅ Apply JWT verification to all routes
router.use(verifyJWT);

// ✅ Always define specific routes BEFORE parameter-based routes like `/:id`

// 🔍 Search employees (must come first!)
router.get(
  "/searchEmployees",
  authorizeRoles("admin", "hr"),

  searchEmployees
);

// 🕒 Check employees with multiple late records
router.get(
  "/check-late-employees",
  authorizeRoles("admin", "hr"),
  getEmployeesWithMultipleLates
);

// 📋 Create new offense
router.post("/create", authorizeRoles("admin", "hr"), createOffense);

// 📂 Get all offenses
router.get("/", getAllOffenses);

// 👤 Get offenses for specific employee
router.get("/employee/:employeeId", getOffensesByEmployee);

// 🆔 Get offense by ID
router.get("/:id", getOffenseById);

// ✏️ Update offense
router.put("/:id", authorizeRoles("admin", "hr"), updateOffense);

// ❌ Delete offense
router.delete("/:id", authorizeRoles("admin"), deleteOffense);

router.get("/my-offenses", getMyOffenses);
module.exports = router;
