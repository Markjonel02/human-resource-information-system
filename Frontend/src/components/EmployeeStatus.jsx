import React, { useState } from "react";
import {
  Box,
  Flex,
  Heading,
  Input,
  InputGroup,
  InputLeftElement,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Checkbox,
  Avatar,
  Text,
  Tag,
  IconButton,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  VStack,
  HStack,
  Tooltip,
  useBreakpointValue,
  Spacer,
} from "@chakra-ui/react";
import { SearchIcon, ChevronDownIcon, CalendarIcon } from "@chakra-ui/icons";

const employeesData = [
  {
    id: 1,
    name: "Floyd Miles",
    email: "floydmiles@pagedone.io",
    department: "Design",
    joinDate: "Jun. 24, 2023",
    status: "Active",
    avatar:
      "https://images.unsplash.com/photo-1534528736733-d922e9643640?q=80&w=2940&auto=format&fit=crop",
  },
  {
    id: 2,
    name: "Savannah Nguyen",
    email: "savannahng@pagedone.io",
    department: "Research",
    joinDate: "Feb. 23, 2023",
    status: "Inactive",
    avatar:
      "https://images.unsplash.com/photo-1580489944761-15a19d654956?q=80&w=2861&auto=format&fit=crop",
  },
  {
    id: 3,
    name: "Cameron Williamson",
    email: "cameron@pagedone.io",
    department: "Development",
    joinDate: "Oct. 23, 2023",
    status: "Onboarding",
    avatar:
      "https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=2876&auto=format&fit=crop",
  },
  {
    id: 4,
    name: "Darrell Steward",
    email: "darrellstew@pagedone.io",
    department: "AI & ML",
    joinDate: "Jul. 12, 2023",
    status: "Inactive",
    avatar:
      "https://images.unsplash.com/photo-1568602471122-7832951cc4c5?q=80&w=2940&auto=format&fit=crop",
  },
  {
    id: 5,
    name: "Laura Bran",
    email: "laurabran@pagedone.io",
    department: "Design",
    joinDate: "Sep. 29, 2023",
    status: "Active",
    avatar:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29329?q=80&w=2874&auto=format&fit=crop",
  },
  {
    id: 6,
    name: "Alfred Frook",
    email: "alfredfrook@pagedone.io",
    department: "Design",
    joinDate: "Dec. 02, 2023",
    status: "Active",
    avatar:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=2874&auto=format&fit=crop",
  },
];

const EmployeeStatus = () => {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredEmployees = employeesData
    .filter(
      (employee) =>
        employee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        employee.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        employee.department.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .slice(0, 4);

  const getStatusColorScheme = (status) => {
    switch (status) {
      case "Active":
        return "green";
      case "Inactive":
        return "red";
      case "Onboarding":
        return "orange";
      default:
        return "gray";
    }
  };

  return (
    <Box p={{ base: 4, sm: 2, lg: 0 }} fontFamily="sans-serif">
      <Spacer border="1px" color="blue.500" mt={8} mb={8} />
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
          Employees Status
        </Heading>
      </Flex>

      <Box bg="white" borderRadius="lg" shadow="md" overflowX="auto">
        <Table variant="simple" minW="full">
          <Thead bg="gray.50">
            <Tr>
              <Th>Full Name</Th>
              <Th display={{ base: "none", md: "table-cell" }}>Department</Th>
              <Th display={{ base: "none", md: "none", lg: "table-cell" }}>
                Join Date
              </Th>
              <Th display="table-cell">Status</Th>
            </Tr>
          </Thead>
          <Tbody bg="white">
            {filteredEmployees.map((employee) => (
              <Tr key={employee.id}>
                <Td>
                  <Flex align="center">
                    <Avatar
                      size="md"
                      name={employee.name}
                      src={employee.avatar}
                    />
                    <Box ml={4}>
                      <Tooltip label={employee.name} bg="transparent">
                        <Text
                          fontSize="sm"
                          fontWeight="medium"
                          color="gray.900"
                        >
                          {useBreakpointValue({
                            base:
                              employee.name.length > 5
                                ? `${employee.name.substring(0, 5)}...`
                                : employee.name,
                            md: employee.name,
                          })}
                        </Text>
                      </Tooltip>

                      <Text fontSize="sm" color="gray.500">
                        {useBreakpointValue({
                          base:
                            employee.email.length > 10
                              ? `${employee.email.substring(0, 10)}...`
                              : employee.email, // Mobile
                          md: employee.email, // Medium and up shows full name
                        })}
                      </Text>
                    </Box>
                  </Flex>
                </Td>
                <Td display={{ base: "none", md: "table-cell" }}>
                  <Text fontSize="sm" color="gray.900">
                    {employee.department}
                  </Text>
                </Td>
                <Td display={{ base: "none", md: "none", lg: "table-cell" }}>
                  <HStack spacing={1}>
                    <CalendarIcon w={3} h={3} color="gray.500" />
                    <Tooltip label={employee.joinDate}>
                      <Text fontSize="sm" color="gray.900">
                        {useBreakpointValue({
                          lg:
                            employee.joinDate.length > 5
                              ? `${employee.joinDate.substring(0, 5)}...`
                              : employee.joinDate, // Mobile
                          md: employee.joinDate, // Medium and up shows full name
                        })}
                      </Text>
                    </Tooltip>
                  </HStack>
                </Td>
                <Td display="table-cell">
                  <Tag
                    size="md"
                    variant="subtle"
                    colorScheme={getStatusColorScheme(employee.status)}
                  >
                    {employee.status}
                  </Tag>
                </Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      </Box>
    </Box>
  );
};

export default EmployeeStatus;
