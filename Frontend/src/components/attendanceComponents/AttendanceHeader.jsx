// components/AttendanceHeader.jsx
import React from "react";
import {
  Flex,
  Heading,
  HStack,
  InputGroup,
  InputLeftElement,
  Input,
  Select,
} from "@chakra-ui/react";
import { SearchIcon } from "@chakra-ui/icons";
import { MONTHS } from "../../constants/attendanceConstants";

const AttendanceHeader = ({
  searchTerm,
  setSearchTerm,
  selectedMonth,
  setSelectedMonth,
  selectedYear,
  setSelectedYear,
}) => {
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 5 }, (_, i) => String(currentYear - i));

  return (
    <Flex
      direction={{ base: "column", md: "row" }}
      justify="space-between"
      align={{ base: "flex-start", md: "center" }}
      mb={6}
    >
      <Heading
        as="h1"
        fontSize={{ base: "2xl", sm: "3xl" }}
        fontWeight="bold"
        color="gray.800"
        mb={{ base: 4, md: 0 }}
      >
        Attendance Tracking
      </Heading>
      <HStack
        spacing={4}
        direction={{ base: "column", sm: "row" }}
        w={{ base: "full", md: "auto" }}
      >
        <InputGroup w={{ base: "full", sm: "auto" }}>
          <InputLeftElement pointerEvents="none">
            <SearchIcon color="gray.400" />
          </InputLeftElement>
          <Input
            type="text"
            placeholder="Search employee or status"
            pl={10}
            pr={4}
            py={2}
            borderWidth="1px"
            borderColor="gray.300"
            borderRadius="lg"
            focusBorderColor="blue.500"
            _focus={{ boxShadow: "outline" }}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </InputGroup>
        <HStack spacing={2} w={{ base: "full", sm: "auto" }}>
          <Select
            placeholder="Select Month"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            borderWidth="1px"
            borderColor="gray.300"
            borderRadius="lg"
            focusBorderColor="blue.500"
            _focus={{ boxShadow: "outline" }}
          >
            {MONTHS.map((month) => (
              <option key={month.value} value={month.value}>
                {month.label}
              </option>
            ))}
          </Select>
          <Select
            placeholder="Select Year"
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value)}
            borderWidth="1px"
            borderColor="gray.300"
            borderRadius="lg"
            focusBorderColor="blue.500"
            _focus={{ boxShadow: "outline" }}
          >
            {years.map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </Select>
        </HStack>
      </HStack>
    </Flex>
  );
};

export default AttendanceHeader;
