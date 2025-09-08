const OvertimeRoutes = require("../../controllers/Admin/adminovertimeController");
const express = require("express");
const route = express.Router();

route.put("/adminApprove/:id", OvertimeRoutes.approveOvertimeRequest);
route.get("/getAllOvertimeRequests", OvertimeRoutes.getAllOvertimeRequests);
route.put("/bulkApprove/:id", OvertimeRoutes.bulkApproveOvertimeRequests);

module.exports = route;
