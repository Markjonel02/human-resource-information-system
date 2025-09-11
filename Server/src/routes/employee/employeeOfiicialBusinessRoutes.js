const express = require("express");
const router = express.Router();
const obController = require("../../controllers/employee/requests_tab/employeeOBController");

// IMPORTANT: Order matters! More specific routes should come BEFORE parameterized routes

// Get all official business for current user (for table display)
router.get("/get_all_OB", obController.getAllOfficialBusiness);

// Add new official business
router.post("/add_OB", obController.addOfficialBusiness);

// Get single official business by ID (this should come AFTER the specific routes)
router.get("/get_OB", obController.getOfficialBusinessById);

// Delete official business by ID
router.delete("/delete_OB/:id", obController.deleteOfficialBusiness);

module.exports = router;
