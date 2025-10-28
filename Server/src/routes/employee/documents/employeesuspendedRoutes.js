// employeeRoutes.js
const express = require('express');
const router = express.Router();
const authorizeRoles = require('../../../middlewares/authorizeRole');
const verifyJWT = require('../../../middlewares/verifyJWT');
const { 
  getEmployeeSuspensions, 
  getEmployeeSuspensionById, 
  getActiveSuspensions 
} = require('../../../controllers/employee/documents/employeesuspendedController');

router.use(verifyJWT);
router.get('/suspensions', authorizeRoles("admin","employee"), getEmployeeSuspensions);
router.get('/suspensions/active', authorizeRoles("admin","employee"), getActiveSuspensions);
router.get('/suspensions/:suspensionId', authorizeRoles("admin","employee"), getEmployeeSuspensionById);

module.exports = router;