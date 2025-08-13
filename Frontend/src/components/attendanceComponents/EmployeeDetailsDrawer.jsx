// components/EmployeeDetailsDrawer.jsx
import React from "react";
import {
  Drawer,
  DrawerOverlay,
  DrawerContent,
  DrawerHeader,
  DrawerBody,
  DrawerCloseButton,
  VStack,
  Flex,
  HStack,
  Avatar,
  Text,
  Tag,
  Box,
  SimpleGrid,
  Icon,
  Divider,
  Heading,
  Stat,
  StatLabel,
  StatNumber,
} from "@chakra-ui/react";
import { FaBriefcase, FaUserTie, FaFileAlt } from "react-icons/fa";
import {
  calculateHoursRendered,
  formatDate,
} from "../../uitls/attendanceUtils";

const EmployeeDetailsDrawer = ({ isOpen, onClose, selectedEmployee }) => {
  if (!selectedEmployee) return null;

  return (
    <Drawer
      isOpen={isOpen}
      placement="right"
      onClose={onClose}
      size={{ base: "full", md: "lg", lg: "xl" }}
    >
      <DrawerOverlay bg="blackAlpha.300" />
      <DrawerContent bg="white" shadow="xl">
        <DrawerCloseButton />
        <DrawerHeader
          borderBottomWidth="1px"
          fontSize="xl"
          fontWeight="extrabold"
          color="gray.800"
          py={4}
          px={6}
        >
          EMPLOYEE ATTENDANCE DETAILS
        </DrawerHeader>

        <DrawerBody p={6}>
          <VStack align="stretch" spacing={6}>
            <Flex
              align="center"
              justify="space-between"
              pb={4}
              borderBottom="1px solid"
              borderColor="gray.200"
              flexWrap="wrap"
            >
              <HStack spacing={4} flex="1" minW="200px">
                <Avatar
                  size="xl"
                  name={`${selectedEmployee.employee?.firstname} ${selectedEmployee.employee?.lastname}`}
                  src={`https://placehold.co/100x100/A0D9B1/000000?text=${selectedEmployee.employee?.firstname?.charAt(
                    0
                  )}${selectedEmployee.employee?.lastname?.charAt(0)}`}
                />
                <VStack align="flex-start" spacing={0}>
                  <Text fontSize="md" color="gray.500" fontWeight="medium">
                    EMP ID: {selectedEmployee.employee?.employeeId || "N/A"}
                  </Text>
                  <Text fontSize="2xl" fontWeight="extrabold" color="gray.800">
                    {selectedEmployee.employee?.firstname}{" "}
                    {selectedEmployee.employee?.lastname}
                  </Text>
                  <Text fontSize="md" color="gray.600">
                    {selectedEmployee.employee?.role || "N/A"}
                  </Text>
                  <Tag
                    size="md"
                    colorScheme={
                      selectedEmployee.status === "Present" ? "green" : "red"
                    }
                    mt={2}
                    borderRadius="full"
                    px={3}
                    py={1}
                  >
                    {selectedEmployee.status === "Present"
                      ? "Active"
                      : "Inactive"}
                  </Tag>
                </VStack>
              </HStack>
            </Flex>

            <Box bg="blue.50" p={4} borderRadius="md" shadow="sm">
              <SimpleGrid columns={{ base: 1, sm: 2 }} spacing={4}>
                <HStack>
                  <Icon as={FaBriefcase} color="blue.600" />
                  <Text fontSize="sm" color="gray.700">
                    Department:{" "}
                    <Text as="span" fontWeight="semibold">
                      {selectedEmployee.employee?.department || "N/A"}
                    </Text>
                  </Text>
                </HStack>
                <HStack>
                  <Icon as={FaUserTie} color="blue.600" />
                  <Text fontSize="sm" color="gray.700">
                    Role:{" "}
                    <Text as="span" fontWeight="semibold">
                      {selectedEmployee.employee?.role || "N/A"}
                    </Text>
                  </Text>
                </HStack>
                <HStack>
                  <Icon as={FaFileAlt} color="blue.600" />
                  <Text fontSize="sm" color="gray.700">
                    Employment:{" "}
                    <Text as="span" fontWeight="semibold">
                      {selectedEmployee.employee?.employmentType || "N/A"}
                    </Text>
                  </Text>
                </HStack>
              </SimpleGrid>
            </Box>

            <Divider borderColor="gray.300" />

            <Box bg="green.50" p={4} borderRadius="md" shadow="sm">
              <Heading size="md" mb={4} color="gray.700">
                Attendance Summary
              </Heading>
              <SimpleGrid columns={{ base: 1, sm: 2, lg: 3 }} spacing={4}>
                <Stat>
                  <StatLabel color="gray.600">Date</StatLabel>
                  <StatNumber fontSize="xl" fontWeight="bold" color="green.700">
                    {formatDate(selectedEmployee.date)}
                  </StatNumber>
                </Stat>
                <Stat>
                  <StatLabel color="gray.600">Status</StatLabel>
                  <StatNumber fontSize="xl" fontWeight="bold" color="green.700">
                    {selectedEmployee.status}
                  </StatNumber>
                </Stat>
                <Stat>
                  <StatLabel color="gray.600">Hours Worked</StatLabel>
                  <StatNumber fontSize="xl" fontWeight="bold" color="green.700">
                    {calculateHoursRendered(
                      selectedEmployee.checkIn,
                      selectedEmployee.checkOut
                    )}
                  </StatNumber>
                </Stat>
              </SimpleGrid>
            </Box>
          </VStack>
        </DrawerBody>
      </DrawerContent>
    </Drawer>
  );
};

export default EmployeeDetailsDrawer;
