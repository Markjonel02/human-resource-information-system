// components/ScheduleCalendar.jsx
import React from "react";
import { Box, Heading, Text } from "@chakra-ui/react";

const ScheduleCalendar = () => {
  return (
    <Box p={8}>
      <Heading fontSize="2xl" color="gray.800" mb={4}>
        Schedule Calendar
      </Heading>
      <Text fontSize="md" color="gray.700" mb={6}>
        Manage and view employee work schedules on a comprehensive calendar.
        Easily assign shifts, track availability, and ensure optimal staffing
        levels for all operational periods.
      </Text>
      <Box
        p={6}
        bg="blue.50"
        borderRadius="lg"
        border="1px"
        borderColor="gray.200"
      >
        <Text fontSize="sm" color="gray.600">
          [An interactive calendar for managing and viewing detailed work
          schedules, including shift assignments and employee availability.]
        </Text>
      </Box>
    </Box>
  );
};

export default ScheduleCalendar;
