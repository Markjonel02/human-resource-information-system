const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const dotenv = require("dotenv");
const cookieParser = require("cookie-parser");
const connectDB = require("./config/connection.js");
const userRoutes = require("./routes/userRoutes.js");
const testRoutes = require("./routes/testRoutes.js");
const employeeLeave = require("./routes/employee/employeeLeaveRoutes.js");
const employeeAttendance = require("./routes/employee/employeeRoutes.js");
// ...existing code...

dotenv.config();
const app = express();
const port = process.env.PORT;

/* middlewares */
app.use(express.json());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(
  cors({
    origin: process.env.CLIENT_ORIGIN || "http://localhost:5173", // Adjust this to your client's origin
    credentials: true, // Allow cookies to be sent
  })
);
/* routes */
// All routes defined in routes.js will now be accessible from the root path '/'
app.use("/api", userRoutes);
app.use("/api/attendanceRoutes", testRoutes);
app.use("/api/employeeAttendance", employeeAttendance);
app.use("/api/employeeLeave", employeeLeave);
// Basic root route (can be removed if all routes are in routes.js)
app.get("/", (req, res) => {
  res.send("API is running!");
});

//
// Error handling middleware (optional, but good practice)
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send("Something broke!");
});
/* running node environtment  */
connectDB()
  .then(() => {
    app.listen(port, () => console.log(`localhost is running on port ${port}`));
  })
  .catch((err) => {
    console.error("Error connecting to mongodb", err);
  });
