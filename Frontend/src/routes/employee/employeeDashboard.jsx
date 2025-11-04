import React from "react";
import { Flex, Box, Text } from "@chakra-ui/react";
import { lazy } from "react";

const AttendanceTrackingEmployee = lazy(() =>
  import("../../routes/employee/AttendanceTrackingEmployee")
);
const UpcomingSchcedule = lazy(() =>
  import("../../components/UpcomingSchcedule")
);
const Announcements = lazy(() => import("../../components/Announcements"));
const BirthdayPopup = lazy(() =>
  import("../../components/birthday_violator/BirthdayCelebrationPopup")
);
const EmployeeDashboard = () => {
  return (
    <>
      <BirthdayPopup />
      <Flex
        direction={{ base: "column", lg: "colum", xl: "row" }}
        align="flex-start"
      >
        {/* Employee Tracker always comes first */}
        <Box w={{ base: "100%", md: "100%" }}>
          <AttendanceTrackingEmployee />
        </Box>

        {/* Right-side content */}
        <Box
          width={{ base: "100%", md: "100%", lg: "100%", xl: "35%" }}
          mt={{ lg: 4 }}
        >
          <Announcements />
          <Box mt={4}>
            <UpcomingSchcedule />
          </Box>
        </Box>
      </Flex>
    </>
  );
};

export default EmployeeDashboard;
