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
/* const Attendances = lazy(() => import("./routes/Attendances"));
const Calendar = lazy(() => import("./routes/Calendar"));
const Leaves = lazy(() => import("./routes/Leaves"));
const Payroll = lazy(() => import("./routes/Payroll"));
const Documents = lazy(() => import("./routes/Documents"));
const AppsAndIntegration = lazy(() => import("./routes/AppsAndIntegration"));
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
              <Suspense fallback={<div>Loading...</div>}>
                <Routes>
                  <Route path="/" element={<Dashboard />} />
                  <Route path="/employees" element={<EmployeeStatus />} />
                  {/*   <Route path="/attendances" element={<Attendances />} />
                    <Route path="/calendar" element={<Calendar />} />
                    <Route path="/leaves" element={<Leaves />} />
                    <Route path="/payroll" element={<Payroll />} />
                    <Route path="/documents" element={<Documents />} />
                    <Route path="/apps" element={<AppsAndIntegration />} />
                    <Route path="/settings" element={<Settings />} />
                    <Route path="/help" element={<HelpAndSupport />} /> */}
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
