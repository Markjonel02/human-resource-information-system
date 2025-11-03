import React, { useState, useEffect } from "react";
import {
  Box,
  Flex,
  Heading,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Avatar,
  Text,
  Tag,
  HStack,
  Tooltip,
  useBreakpointValue,
  Spacer,
  Spinner,
  useToast,
} from "@chakra-ui/react";
import { CalendarIcon } from "@chakra-ui/icons";
import axiosInstance from "../lib/axiosInstance"; // Update this path

const EmployeeStatus = () => {
  const [employees, setEmployees] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const toast = useToast();
  const isMobile = useBreakpointValue({ base: true, md: false });
  const isLarge = useBreakpointValue({ base: false, lg: true });

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    setLoading(true);
    try {
      const response = await axiosInstance.get("/employees");
      setEmployees(response.data);
      toast({
        title: "Success",
        description: "Employees loaded successfully",
        status: "success",
        duration: 3,
        isClosable: true,
      });
    } catch (error) {
      console.error("Error fetching employees:", error);
      toast({
        title: "Error",
        description:
          error.response?.data?.message ||
          "Failed to fetch employees. Please check your permissions.",
        status: "error",
        duration: 5,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredEmployees = employees
    .filter((employee) => {
      const fullName = `${employee.firstname || ""} ${
        employee.lastname || ""
      }`.toLowerCase();
      return (
        fullName.includes(searchTerm.toLowerCase()) ||
        employee.employeeEmail
          ?.toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        employee.department?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    })
    .slice(0, 10);

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

  const formatFullName = (firstname, lastname) => {
    const fullName = `${firstname} ${lastname}`;
    return isMobile && fullName.length > 12
      ? `${fullName.substring(0, 12)}...`
      : fullName;
  };

  const formatEmail = (email) => {
    return isMobile && email?.length > 10
      ? `${email.substring(0, 10)}...`
      : email;
  };

  const formatDate = (date) => {
    if (!date) return "N/A";
    const d = new Date(date);
    if (isMobile || !isLarge) {
      return d.toLocaleDateString("en-US", { year: "2-digit", month: "short" });
    }
    return d.toLocaleDateString();
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
        {loading ? (
          <Flex justify="center" align="center" minH="400px">
            <Spinner size="lg" color="blue.500" />
          </Flex>
        ) : filteredEmployees.length === 0 ? (
          <Flex justify="center" align="center" minH="200px">
            <Text color="gray.500">No employees found</Text>
          </Flex>
        ) : (
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
                <Tr key={employee._id || employee.id}>
                  <Td>
                    <Flex align="center">
                      <Avatar
                        size="md"
                        name={`${employee.firstname} ${employee.lastname}`}
                        src={employee.avatar}
                      />
                      <Box ml={4}>
                        <Tooltip
                          label={`${employee.firstname} ${employee.lastname}`}
                          bg="transparent"
                        >
                          <Text
                            fontSize="sm"
                            fontWeight="medium"
                            color="gray.900"
                          >
                            {formatFullName(
                              employee.firstname,
                              employee.lastname
                            )}
                          </Text>
                        </Tooltip>

                        <Text fontSize="sm" color="gray.500">
                          {formatEmail(employee.employeeEmail)}
                        </Text>
                      </Box>
                    </Flex>
                  </Td>
                  <Td display={{ base: "none", md: "table-cell" }}>
                    <Text fontSize="sm" color="gray.900">
                      {employee.department || "N/A"}
                    </Text>
                  </Td>
                  <Td display={{ base: "none", md: "none", lg: "table-cell" }}>
                    <HStack spacing={1}>
                      <CalendarIcon w={3} h={3} color="gray.500" />
                      <Tooltip label={formatDate(employee.createdAt)}>
                        <Text fontSize="sm" color="gray.900">
                          {formatDate(employee.createdAt)}
                        </Text>
                      </Tooltip>
                    </HStack>
                  </Td>
                  <Td display="table-cell">
                    <Tag
                      size="md"
                      variant="subtle"
                      colorScheme={getStatusColorScheme(
                        employee.employeeStatus === 1 ? "Active" : "Inactive"
                      )}
                    >
                      {employee.employeeStatus === 1 ? "Active" : "Inactive"}
                    </Tag>
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        )}
      </Box>
    </Box>
  );
};

export default EmployeeStatus;
