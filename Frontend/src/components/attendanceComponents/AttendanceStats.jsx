// components/AttendanceStats.jsx
import React from "react";
import {
  SimpleGrid,
  Box,
  Heading,
  VStack,
  Stat,
  StatLabel,
  StatNumber,
} from "@chakra-ui/react";

const AttendanceStats = ({ stats }) => {
  const { totalMinLate, numLate, numAbsent, leaveCounts } = stats;

  return (
    <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6} mb={6}>
      <Box bg="white" p={6} borderRadius="lg" shadow="md">
        <Heading size="md" mb={4} color="gray.700">
          Tardiness
        </Heading>
        <VStack align="flex-start" spacing={3}>
          <Stat>
            <StatLabel color="gray.600">Min/Hrs Late</StatLabel>
            <StatNumber fontSize="xl" fontWeight="bold">
              {Math.floor(totalMinLate / 60)}h {totalMinLate % 60}m
            </StatNumber>
          </Stat>
          <Stat>
            <StatLabel color="gray.600">Number of Late Entries</StatLabel>
            <StatNumber fontSize="xl" fontWeight="bold">
              {numLate}
            </StatNumber>
          </Stat>
          <Stat>
            <StatLabel color="gray.600">Number of Absences</StatLabel>
            <StatNumber fontSize="xl" fontWeight="bold">
              {numAbsent}
            </StatNumber>
          </Stat>
        </VStack>
      </Box>

      <Box bg="white" p={6} borderRadius="lg" shadow="md">
        <Heading size="md" mb={4} color="gray.700">
          Leave
        </Heading>
        <SimpleGrid columns={{ base: 1, sm: 2, lg: 3 }} spacing={3}>
          <Stat>
            <StatLabel color="gray.600">Vacation Leave (VL)</StatLabel>
            <StatNumber fontSize="xl" fontWeight="bold">
              {leaveCounts.VL}
            </StatNumber>
          </Stat>
          <Stat>
            <StatLabel color="gray.600">Sick Leave (SL)</StatLabel>
            <StatNumber fontSize="xl" fontWeight="bold">
              {leaveCounts.SL}
            </StatNumber>
          </Stat>
          <Stat>
            <StatLabel color="gray.600">Leave Without Pay (LWOP)</StatLabel>
            <StatNumber fontSize="xl" fontWeight="bold">
              {leaveCounts.LWOP}
            </StatNumber>
          </Stat>
          <Stat>
            <StatLabel color="gray.600">Bereavement Leave (BL)</StatLabel>
            <StatNumber fontSize="xl" fontWeight="bold">
              {leaveCounts.BL}
            </StatNumber>
          </Stat>
          <Stat>
            <StatLabel color="gray.600">Offset (OS)</StatLabel>
            <StatNumber fontSize="xl" fontWeight="bold">
              {leaveCounts.OS}
            </StatNumber>
          </Stat>
          <Stat>
            <StatLabel color="gray.600">Calamity Leave (CL)</StatLabel>
            <StatNumber fontSize="xl" fontWeight="bold">
              {leaveCounts.CL}
            </StatNumber>
          </Stat>
        </SimpleGrid>
      </Box>
    </SimpleGrid>
  );
};

export default AttendanceStats;
