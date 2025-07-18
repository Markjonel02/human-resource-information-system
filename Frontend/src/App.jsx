import { Box, Flex } from "@chakra-ui/react";
import { lazy, Suspense } from "react";
import { Routes, Route } from "react-router-dom";

// Layout
const Maincomponent = lazy(() => import("./components/Maincomponent"));
const SideNavigation = lazy(() => import("./components/SideNavigation"));
const TopNavigations = lazy(() => import("./components/TopNavigations"));

// Routes
const Dashboard = lazy(() => import("./routes/Dashboard"));
const EmployeeStatus = lazy(() => import("./components/EmployeeStatus"));
const Employees = lazy(() => import("./routes/Employees"));
const Attendances = lazy(() => import("./routes/monitoring/Attendances"));
const Calendar = lazy(() => import("./routes/Calendar"));
const Request = lazy(() => import("./routes/request/Request"));
const Payroll = lazy(() => import("./routes/payroll/Payroll"));
const Documents = lazy(() => import("./routes/Documents"));
const Monitoring = lazy(() => import("./routes/Monitoring"));
const TimeIn = lazy(() => import("../src/routes/user/TimeIn"));
const Settings = lazy(() => import("../src/routes/user/Settings"));
/*const AppsAndIntegration = lazy(() => import("./routes/AppsAndIntegration"));
const Settings = lazy(() => import("./routes/Settings"));
const HelpAndSupport = lazy(() => import("./routes/HelpAndSupport")); */

const App = () => {
  return (
    <Box>
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
                "::-webkit-scrollbar-track": { background: "transparent" },
                "::-webkit-scrollbar-thumb": {
                  backgroundColor: "rgba(100, 100, 100, 0.4)",
                  borderRadius: "4px",
                  display: "none !important",
                },
              }}
            >
              <Suspense
                fallback={
                  <div id="wifi-loader">
                    <svg class="circle-outer" viewBox="0 0 86 86">
                      <circle class="back" cx="43" cy="43" r="40"></circle>
                      <circle class="front" cx="43" cy="43" r="40"></circle>
                      <circle class="new" cx="43" cy="43" r="40"></circle>
                    </svg>
                    <svg class="circle-middle" viewBox="0 0 60 60">
                      <circle class="back" cx="30" cy="30" r="27"></circle>
                      <circle class="front" cx="30" cy="30" r="27"></circle>
                    </svg>
                    <svg class="circle-inner" viewBox="0 0 34 34">
                      <circle class="back" cx="17" cy="17" r="14"></circle>
                      <circle class="front" cx="17" cy="17" r="14"></circle>
                    </svg>
                    <div class="text" data-text="Loading..."></div>
                  </div>
                }
              >
                <Routes>
                  <Route path="/" element={<Dashboard />} />
                  <Route path="/employees" element={<Employees />} />
                  <Route path="/attendances" element={<Attendances />} />
                  <Route path="/calendar" element={<Calendar />} />
                  <Route path="/request" element={<Request />} />
                  <Route path="/payroll" element={<Payroll />} />
                  <Route path="/documents" element={<Documents />} />
                  <Route path="/monitoring" element={<Monitoring />} />
                  <Route path="/timein" element={<TimeIn />} />
                  <Route path="/settings/*" element={<Settings />} />
                </Routes>
              </Suspense>
            </Box>
          </Box>
        </Flex>
      </Maincomponent>
    </Box>
  );
};

export default App;
