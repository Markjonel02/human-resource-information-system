// Load environment variables from .env file
require("dotenv").config();

const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const connectDB = require("./config/connection.js");
const path = require("path");

// Global uploads directory
global.uploadsDir = path.join(__dirname, "../uploads");
// Import Routes
const userRoutes = require("./routes/userRoutes.js");
const testRoutes = require("./routes/admin&hr/testRoutes.js");
const employeeLeave = require("./routes/employee/employeeLeaveRoutes.js");
const employeeAttendance = require("./routes/employee/employeeRoutes.js");
const EmployeeOvertimeRoutes = require("./routes/employee/overtimeRoutes.js");
const adminOvertimeRoute = require("./routes/admin&hr/adminovertimeRoutes.js");
const Obroutes = require("./routes/employee/employeeOfiicialBusinessRoutes.js");
const adminObroutes = require("./routes/admin&hr/OfficialBusinessRoutes.js");
const adminLeaveRoutes = require("./routes/admin&hr/leaveRoutes.js");
const calendarRoutes = require("./routes/admin&hr/calendarRoutes/upcomingEventsRoutes.js");
const employeeCalendar = require("./routes/employee/employeeCalendarRoutes.js");
const PolicyRoutes = require("./routes/admin&hr/document-routes/PoliciesMemosRoutes.js");
const OffenseRoutes = require("./routes/admin&hr/document-routes/offenseRoutes.js");
const SuspensionRoutes = require("./routes/admin&hr/document-routes/suspendedRoutes");
const EmployeeOffenses = require("./routes/employee/documents/employeeoffenseRoutes.js");
const EmployeeSuspendedRoutes = require("./routes/employee/documents/employeesuspendedRoutes.js");
const Announcement = require("./routes/admin&hr/announcements/announcementsRoutes.js");
const payrollRoutes = require("./routes/payrollRoutes/payrollRoutes.js");
// =======================
//   INITIALIZATION
// =======================
const app = express();
const port = process.env.PORT || 5000;

// =======================
//   MIDDLEWARES
// =======================

// CORS configuration
const corsOptions = {
  origin: process.env.CLIENT_ORIGIN || "*",
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
  optionsSuccessStatus: 200,
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Serve static uploads
app.use(
  "/uploads",
  (req, res, next) => {
    res.header(
      "Access-Control-Allow-Origin",
      process.env.CLIENT_ORIGIN || "http://localhost:5173"
    );
    res.header("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS");
    res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
    next();
  },
  express.static(global.uploadsDir)
);

// =======================
//   ROUTES
// =======================
app.get("/", (req, res) => {
  res.send("API is running!");
});

app.use("/api", userRoutes);
app.use("/api/attendanceRoutes", testRoutes);
app.use("/api/employeeAttendance", employeeAttendance);
app.use("/api/employeeLeave", employeeLeave);
app.use("/api/adminLeave", adminLeaveRoutes);
app.use("/api/overtime", EmployeeOvertimeRoutes);
app.use("/api/admin/overtime", adminOvertimeRoute);
app.use("/api/officialBusiness", Obroutes);
app.use("/api/adminOfficialBusiness", adminObroutes);
app.use("/api/calendar", calendarRoutes);
app.use("/api/employeeCalendar", employeeCalendar);
app.use("/api/policy", PolicyRoutes);
app.use("/api/offense", OffenseRoutes);
app.use("/api/Suspension", SuspensionRoutes);
app.use("/api/employeeOffenses", EmployeeOffenses);
app.use("/api/employeeSuspended", EmployeeSuspendedRoutes);
app.use("/api/announcements", Announcement);
app.use("/api/payroll", payrollRoutes);

// =======================
//   ERROR HANDLING
// =======================
app.use((req, res, next) => {
  res.status(404).json({ message: "404 Not Found" });
});

app.use((err, req, res, next) => {
  console.error("Global Error:", err.stack);
  res.status(500).json({
    message: "Something went wrong on the server!",
    error: err.message,
  });
});

// =======================
//   DATABASE CONNECTION & SERVER START
// =======================
connectDB()
  .then(() => {
    app.listen(port, () => {
      console.log(`✅ Server running on port ${port}`);
      console.log(`✅ Database connected successfully.`);
      console.log(`✅ Uploads directory: ${global.uploadsDir}`);
    });
  })
  .catch((err) => {
    console.error("❌ Database connection failed:", err);
    process.exit(1);
  });
