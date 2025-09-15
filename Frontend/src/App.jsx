import { Box, Flex } from "@chakra-ui/react";
import { lazy, Suspense } from "react";
import { Routes, Route } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute";
import { AuthProvider } from "./context/AuthContext";
import { useLocation } from "react-router-dom";

// Layout Components
const Maincomponent = lazy(() => import("./components/Maincomponent"));
const SideNavigation = lazy(() => import("./components/SideNavigation"));
const TopNavigations = lazy(() => import("./components/TopNavigations"));

// Route Components
const Dashboard = lazy(() => import("./routes/Dashboard"));
const Employees = lazy(() => import("./routes/Employees"));
const Attendances = lazy(() =>
  import("./routes/Admin&Hr/monitoring/Attendances")
);
const Calendar = lazy(() => import("./routes/Calendar"));
const Request = lazy(() => import("./routes/request/Request"));
const Payroll = lazy(() => import("./routes/payroll/Payroll"));
const Documents = lazy(() => import("./routes/Documents"));
const Monitoring = lazy(() => import("./routes/Monitoring"));
const TimeIn = lazy(() => import("./routes/user/TimeIn"));
const Settings = lazy(() => import("./routes/user/Settings"));
const LoginPage = lazy(() => import("./pages/auth/Login"));
const EmployeeDashboard = lazy(() =>
  import("./routes/employee/employeeDashboard")
);
const EmployeeRoutes = lazy(() =>
  import("./routes/employee/EmployeeAttendance")
);
const EmployeeRequests = lazy(() =>
  import("./routes/employee/RequestTab/EmployeeRequestLayout")
);
/**
 * Loader Component
 * Displays a full-screen, centered loading spinner with a semi-transparent background.
 * Includes inline CSS for the loader's animations.
 */
const Loader = () => (
  <>
    <div
      id="wifi-loader"
      className="fixed inset-0 flex items-center justify-center bg-white bg-opacity-80 z-50"
    >
      <svg className="circle-outer" viewBox="0 0 86 86">
        <circle className="back" cx="43" cy="43" r="40"></circle>
        <circle className="front" cx="43" cy="43" r="40"></circle>
        <circle className="new" cx="43" cy="43" r="40"></circle>
      </svg>
      <svg className="circle-middle" viewBox="0 0 60 60">
        <circle className="back" cx="30" cy="30" r="27"></circle>
        <circle className="front" cx="30" cy="30" r="27"></circle>
      </svg>
      <svg className="circle-inner" viewBox="0 0 34 34">
        <circle className="back" cx="17" cy="17" r="14"></circle>
        <circle className="front" cx="17" cy="17" r="14"></circle>
      </svg>
      <div className="text" data-text="Loading..."></div>
    </div>
  </>
);

const App = () => {
  const location = useLocation(); // Retained in case you need it for other conditional rendering

  return (
    // AuthProvider must wrap the entire Routes component to provide context to all routes
    <AuthProvider>
      <Box>
        <Routes>
          {/* Public Route for Login - now wrapped with Suspense for its own loading */}
          <Route
            path="/login"
            element={
              <Suspense fallback={<Loader />}>
                <LoginPage />
              </Suspense>
            }
          />

          {/* All other routes are protected and rendered within the main layout */}
          <Route
            path="/*" // Catch all other paths
            element={
              <Maincomponent>
                <Flex minH="100vh">
                  <SideNavigation />
                  <Box flex="3" p={4}>
                    <TopNavigations />
                    <Box
                      maxH="calc(100vh - 100px)"
                      overflowY="auto"
                      className="scroll"
                      sx={{
                        scrollBehavior: "smooth",
                        "::-webkit-scrollbar": { width: "6px" },
                        "::-webkit-scrollbar-track": {
                          background: "transparent",
                        },
                        "::-webkit-scrollbar-thumb": {
                          backgroundColor: "rgba(100, 100, 100, 0.4)",
                          borderRadius: "4px",
                          display: "none !important",
                        },
                      }}
                    >
                      {/* ProtectedRoute wraps the nested Routes */}
                      <ProtectedRoute>
                        {/* Suspense here will apply to all lazy-loaded components within these nested routes */}
                        <Suspense fallback={<Loader />}>
                          <Routes>
                            {/* Nested routes for protected content */}
                            <Route path="/" element={<Dashboard />} />
                            <Route
                              path="/employee-dashboard"
                              element={<EmployeeDashboard />} // Use the employee dashboard component
                            />
                            <Route path="/employees" element={<Employees />} />
                            <Route
                              path="/employees-attendance"
                              element={<EmployeeRoutes />}
                            />
                            <Route
                              path="/employees-requests"
                              element={<EmployeeRequests />}
                            />

                            <Route
                              path="/attendances"
                              element={<Attendances />}
                            />
                            <Route path="/calendar" element={<Calendar />} />
                            <Route path="/request" element={<Request />} />
                            <Route path="/payroll" element={<Payroll />} />
                            <Route path="/documents" element={<Documents />} />
                            <Route
                              path="/monitoring"
                              element={<Monitoring />}
                            />
                            <Route path="/timein" element={<TimeIn />} />
                            <Route path="/settings/*" element={<Settings />} />
                          </Routes>
                        </Suspense>
                      </ProtectedRoute>
                    </Box>
                  </Box>
                </Flex>
              </Maincomponent>
            }
          />
        </Routes>
      </Box>
    </AuthProvider>
  );
};

export default App;
