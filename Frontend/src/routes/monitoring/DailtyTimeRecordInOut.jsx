// components/RawInOutRecord.jsx
import React from "react";
import { Box, Heading, Text } from "@chakra-ui/react";

const RawInOutRecord = () => {
  return (
    <Box p={8}>
      <Heading fontSize="2xl" color="gray.800" mb={4}>
        Raw In/Out Record
      </Heading>
      <Text fontSize="md" color="gray.700" mb={6}>
        Access the raw, unedited clock-in and clock-out data directly from the
        timekeeping system. This provides granular detail for auditing and
        troubleshooting any discrepancies.
      </Text>
      <Box
        p={6}
        bg="blue.50"
        borderRadius="lg"
        border="1px"
        borderColor="gray.200"
      >
        <Text fontSize="sm" color="gray.600">
          [Raw timestamp data, including Employee ID, exact Timestamp, recording
          Device, and Entry Type (In/Out).]
        </Text>
      </Box>
    </Box>
  );
};

export default RawInOutRecord;
