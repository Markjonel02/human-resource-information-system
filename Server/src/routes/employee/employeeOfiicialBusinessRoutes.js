const express = require("express");
const router = express.Router();
const obController = require("../../controllers/employee/requests_tab/employeeOBController");
const verifyJWT = require("../../middlewares/verifyJWT");
const authorizeRoles = require("../../middlewares/authorizeRole");

// IMPORTANT: Order matters! More specific routes should come BEFORE parameterized routes

router.use(verifyJWT);
// Get all official business for current user (for table display)
router.get(
  "/getOfficialBusiness",
  authorizeRoles("employee"),
  obController.getAllOfficialBusinesss
);

// Add new official business
router.post(
  "/addOfficialBusiness",
  authorizeRoles("employee"),
  obController.addOfficialBusiness
);

// Get single official business by ID (this should come AFTER the specific routes)
router.get(
  "/getOB",
  authorizeRoles("employee"),
  obController.getOfficialBusinessById
);

// Delete official business by ID
router.delete(
  "/delete_OB/:id",
  authorizeRoles("employee"),
  obController.deleteOfficialBusiness
);

router.put(
  "/edit_OB/:id",
  authorizeRoles("employee"),
  obController.updateOfficialBusiness
);

module.exports = router;
