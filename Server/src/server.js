// Load environment variables from .env file
require("dotenv").config();

const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const connectDB = require("./config/connection.js");
const bodyParser = require("body-parser");
// Import Routes
const userRoutes = require("./routes/userRoutes.js");
const testRoutes = require("./routes/admin&hr/testRoutes.js");
https://github.com/Markjonel02/human-resource-information-system/pull/105/conflict?name=Server%252Fsrc%252Fserver.js&ancestor_oid=fc3040501bbd672a8b766856a5dd8340e9ec10f9&base_oid=ce398ba6e1556c50a51f500f703760b0d997f65a&head_oid=9a557012b380d9f54cd895e7c555bc060f6baad6const employeeLeave = require("./routes/employee/employeeLeaveRoutes.js");
const employeeAttendance = require("./routes/employee/employeeRoutes.js");
const EmployeeOvertimeRoutes = require("./routes/employee/overtimeRoutes.js");
const adminOvertimeRoute = require("./routes/admin&hr/adminovertimeRoutes.js");
const Obroutes = require("./routes/employee/employeeOfiicialBusinessRoutes.js");
const adminObroutes = require("./routes/admin&hr/OfficialBusinessRoutes");
const adminLeaveRoutes = require("./routes/admin&hr/leaveRoutes.js");
const calendarRoutes = require("./routes/admin&hr/calendarRoutes/upcomingEventsRoutes.js");
const employeeCalendar = require("./routes/employee/employeeCalendarRoutes.js");
const documentRoutes = require("./routes/admin&hr/document-routes/documentRoutes.js");
// Initialize the Express app
const app = express();
const port = process.env.PORT || 5000; // Use a default port if not specified

// =======================
//   MIDDLEWARES
// =======================

// CORS configuration to allow requests from the client
const corsOptions = {
  origin: process.env.CLIENT_ORIGIN || "http://localhost:5173",
  credentials: true, // Allow cookies to be sent
};
app.use(cors(corsOptions));

// Built-in Express middleware for parsing JSON and URL-encoded data
// This replaces bodyParser, as it's built-in since Express 4.16
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));
// Middleware for parsing cookies
app.use(cookieParser());

// =======================
//   ROUTES
// =======================

// Basic root route
app.get("/", (req, res) => {
  res.send("API is running!");
});

// Mount the API routes under the /api prefix
app.use("/api", userRoutes);

app.use("/api/attendanceRoutes", testRoutes);

//employeeRoutes

app.use("/api/employeeAttendance", employeeAttendance);
app.use("/api/employeeLeave", employeeLeave);
app.use("/api/adminLeave", adminLeaveRoutes);
app.use("/api/overtime", EmployeeOvertimeRoutes);
app.use("/api/admin/overtime", adminOvertimeRoute);
app.use("/api/officialBusiness", Obroutes);
app.use("/api/adminOfficialBusiness", adminObroutes);
app.use("/api/calendar", calendarRoutes);
app.use("/api/employeeCalendar", employeeCalendar);
app.use("/api/documents", documentRoutes);
// =======================
//   ERROR HANDLING
// =======================

// 404 Not Found Middleware - This should be the last middleware
app.use((req, res, next) => {
  res.status(404).json({ message: "404 Not Found" });
});

// Global Error Handling Middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    message: "Something went wrong on the server!",
    error: err.message,
  });
});

// =======================
//   DATABASE CONNECTION & SERVER START
// =======================

// Connect to the database and start the server
connectDB()
  .then(() => {
    app.listen(port, () => {
      console.log(`Server is running on port ${port}`);
      console.log(`Database connected successfully.`);
    });
  })
  .catch((err) => {
    console.error("Error connecting to the database:", err);
    process.exit(1); // Exit with a non-zero code to indicate an error
  });
