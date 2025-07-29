import React, { useEffect, useState } from "react";
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
  Spinner,
  useToast,
} from "@chakra-ui/react";
import { SearchIcon, ChevronDownIcon } from "@chakra-ui/icons";
import { FiMoreVertical } from "react-icons/fi";
import axiosInstance from "../lib/axiosInstance"; // Adjust the path if needed
import { useAuth } from "../context/AuthContext"; // Assuming you have an AuthContext for authentication
const Employees = () => {
  // Local state for employees and loading state
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(false);
  const toast = useToast();

  // Fetch employees from API on mount
  useEffect(() => {
    fetchingEmployees();
  }, []);

  // API call to fetch employee data
  const fetchingEmployees = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("accessToken");
      const response = await axiosInstance.get("/employees", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = response.data;

      // Format response data to match table structure
      const formattedData = data.map((emp) => ({
        id: emp._id,
        name: `${emp.firstname} ${emp.lastname}`,
        email: emp.employeeEmail,
        department: emp.department || "Not Set",
        joinDate: emp.joinDate
          ? new Date(emp.joinDate).toLocaleDateString("en-US", {
              year: "numeric",
              month: "short",
              day: "2-digit",
            })
          : "N/A",
        status: emp.employeeStatus === 1 ? "Active" : "Inactive",
        avatar: `https://ui-avatars.com/api/?name=${emp.firstname}+${emp.lastname}&background=random`,
      }));

      setEmployees(formattedData);
    } catch (error) {
      console.error("Error fetching employees:", error);
      toast({
        title: "Failed to load employees",
        description: "Check your network or server.",
        status: "error",
        duration: 4000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box p={6}>
      <Flex justify="space-between" mb={6}>
        <Heading size="lg">Employee List</Heading>
        <InputGroup w="300px">
          <InputLeftElement
            pointerEvents="none"
            children={<SearchIcon color="gray.400" />}
          />
          <Input placeholder="Search employees..." />
        </InputGroup>
      </Flex>

      {loading ? (
        <Flex justify="center" py={10}>
          <Spinner size="xl" color="blue.500" />
        </Flex>
      ) : (
        <Box bg="white" borderRadius="lg" shadow="md" overflowX="auto">
          <Table variant="simple">
            <Thead bg="gray.100">
              <Tr>
                <Th>
                  <Checkbox />
                </Th>
                <Th>Employee</Th>
                <Th>Email</Th>
                <Th>Department</Th>
                <Th>Join Date</Th>
                <Th>Status</Th>
                <Th>Actions</Th>
              </Tr>
            </Thead>
            <Tbody>
              {employees.map((employee) => (
                <Tr key={employee.id}>
                  <Td>
                    <Checkbox />
                  </Td>
                  <Td>
                    <HStack spacing={3}>
                      <Avatar
                        size="sm"
                        src={employee.avatar}
                        name={employee.name}
                      />
                      <Text>{employee.name}</Text>
                    </HStack>
                  </Td>
                  <Td>{employee.email}</Td>
                  <Td>{employee.department}</Td>
                  <Td>{employee.joinDate}</Td>
                  <Td>
                    <Tag
                      size="sm"
                      variant="subtle"
                      colorScheme={
                        employee.status === "Active" ? "green" : "red"
                      }
                    >
                      {employee.status}
                    </Tag>
                  </Td>
                  <Td>
                    <Menu>
                      <MenuButton
                        as={IconButton}
                        icon={<FiMoreVertical />}
                        variant="ghost"
                        size="sm"
                      />
                      <MenuList>
                        <MenuItem>Edit</MenuItem>
                        <MenuItem>Deactivate</MenuItem>
                      </MenuList>
                    </Menu>
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </Box>
      )}
    </Box>
  );
};

export default Employees;
