// components/DTRRange.jsx
import React from "react";
import { Box, Heading, Text } from "@chakra-ui/react";

const DTRRange = () => {
  return (
    <Box p={8}>
      <Heading fontSize="2xl" color="gray.800" mb={4}>
        Daily Time Record Range
      </Heading>
      <Text fontSize="md" color="gray.700" mb={6}>
        Generate and view comprehensive daily time records for a specified date
        range. This feature is essential for payroll processing, compliance, and
        generating summary reports for specific periods.
      </Text>
      <Box
        p={6}
        bg="blue.50"
        borderRadius="lg"
        border="1px"
        borderColor="gray.200"
      >
        <Text fontSize="sm" color="gray.600">
          [Interactive date range selector and aggregated data for the selected
          period, such as total hours, overtime, and absences.]
        </Text>
      </Box>
    </Box>
  );
};

export default DTRRange;
