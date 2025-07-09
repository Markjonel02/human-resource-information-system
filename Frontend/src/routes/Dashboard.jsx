import React from "react";
import { Flex, Box } from "@chakra-ui/react";
import { lazy } from "react";
const EmployeeTracker = lazy(() => import("../components/EmployeeTracker"));
const UpcomingSchcedule = lazy(() => import("../components/UpcomingSchcedule"));
const Announcements = lazy(() => import("../components/Announcements"));
const EmployeeStatus = lazy(() => import("../components/EmployeeStatus"));
const Dashboard = () => {
  return (
    <Flex direction={{ base: "column", lg: "row" }} align="flex-start" gap={6}>
      {/* Employee Tracker always comes first */}
      <Box w={{ base: "100%", md: "75%" }}>
        <EmployeeTracker />
        <EmployeeStatus />
      </Box>

      {/* Right-side content */}
      <Box
        width={{ base: "100%", md: "auto", lg: "30%" }}
        mt={{ base: 4, lg: 4 }}
      >
        <Announcements />
        <Box mt={4}>
          <UpcomingSchcedule />
        </Box>
      </Box>
    </Flex>
  );
};

export default Dashboard;
