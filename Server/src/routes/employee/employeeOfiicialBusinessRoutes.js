const express = require("express");
const router = express.Router();
const addofficialBusiness = require("../../controllers/employee/requests_tab/employeeOBController");

router.post("/add_OB", addofficialBusiness.addofficialBusiness);
router.get("/get_OB", addofficialBusiness.getOfficialBusiness);

module.exports = router;
