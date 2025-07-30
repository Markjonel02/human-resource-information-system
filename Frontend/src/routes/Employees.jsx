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
  HStack,
  Spinner,
  Button,
  useToast,
} from "@chakra-ui/react";
import {
  SearchIcon,
  DeleteIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from "@chakra-ui/icons";
import { FiMoreVertical } from "react-icons/fi";
import axiosInstance from "../lib/axiosInstance";

const Employees = () => {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(false);
  //checkbox state
  const [selectedIds, setSelectedIds] = useState([]);
  const [allChecked, setAllChecked] = useState(false);
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const toast = useToast();

  const ITEMS_PER_PAGE = 2;
  useEffect(() => {
    fetchingEmployees(currentPage);
  }, [currentPage]);

  const rederPagination = () => (
    <Flex justify="center" align="center" mt={6} gap={2}>
      <Button
        onClick={() => setCurrentPage(1)}
        isDisabled={currentPage === 1}
        colorScheme="blue"
        variant="outline"
      >
        First
      </Button>
      <IconButton
        icon={<ChevronLeftIcon />}
        onClick={() => setCurrentPage((prev) => prev - 1)}
        isDisabled={currentPage === 1}
        colorScheme="blue"
        variant="outline"
      />
      {[...Array(totalPages)].map((_, i) => {
        const page = i + 1;
        return (
          <Button
            key={page}
            onClick={() => setCurrentPage(page)}
            colorScheme={currentPage === page ? "blue" : "gray"}
            variant={currentPage === page ? "solid" : "outline"}
          >
            {page}
          </Button>
        );
      })}
      <IconButton
        icon={<ChevronRightIcon />}
        onClick={() => setCurrentPage((prev) => prev + 1)}
        isDisabled={currentPage === totalPages}
        colorScheme="blue"
        variant="outline"
      />
      <Button
        onClick={() => setCurrentPage(totalPages)}
        isDisabled={currentPage === totalPages}
        colorScheme="blue"
        variant="outline"
      >
        Last
      </Button>
    </Flex>
  );
  const fetchingEmployees = async (page) => {
    setLoading(true);
    try {
      const token = localStorage.getItem("accessToken");
      const response = await axiosInstance.get("/employees", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = response.data;

      //pagination Logic

      const start = (page - 1) * ITEMS_PER_PAGE;
      const end = start + ITEMS_PER_PAGE;
      setTotalPages(Math.ceil(data.length / ITEMS_PER_PAGE));
      const formattedData = data.map((emp) => ({
        id: emp._id,
        name: `${emp.firstname} ${emp.lastname}`,
        email: emp.employeeEmail,
        department: emp.department || "Not Set",
        role: emp.role || "Not Set",
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
        position: "top",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCheckboxChange = (id) => {
    setSelectedIds((prev) => {
      const isSelected = prev.includes(id);
      const newSelection = isSelected
        ? prev.filter((sid) => sid !== id)
        : [...prev, id];

      setAllChecked(newSelection.length === employees.length);
      return newSelection;
    });
  };

  const handleSelectAll = () => {
    if (allChecked) {
      setSelectedIds([]);
      setAllChecked(false);
    } else {
      const allIds = employees.map((emp) => emp.id);
      setSelectedIds(allIds);
      setAllChecked(true);
    }
  };

  const handleBulkDeactivate = async () => {
    try {
      const token = localStorage.getItem("accessToken");
      await axiosInstance.put(
        "/employees/bulk-deactivate",
        { ids: selectedIds },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      toast({
        title: "Employees updated",
        description: "Selected employees were marked as inactive.",
        status: "success",
        duration: 4000,
        isClosable: true,
        position: "top",
      });

      setSelectedIds([]);
      setAllChecked(false);
      fetchingEmployees(currentPage); // Refresh the employee list
    } catch (error) {
      console.error("Error during bulk deactivate:", error);
      toast({
        title: "Update failed",
        description: "Could not deactivate selected employees.",
        status: "error",
        duration: 4000,
        position: "top",
        isClosable: true,
      });
    }
  };

  return (
    <>
      {" "}
      <Box p={6}>
        <Flex justify="space-between" mb={6} flexWrap="wrap" gap={3}>
          <Heading size="lg">Employee List</Heading>
          <HStack spacing={3}>
            <InputGroup w="300px">
              <InputLeftElement pointerEvents="none">
                <SearchIcon color="gray.400" />
              </InputLeftElement>
              <Input placeholder="Search employees..." />
            </InputGroup>

            <Button
              colorScheme="red"
              onClick={handleBulkDeactivate}
              isDisabled={selectedIds.length === 0}
              leftIcon={<DeleteIcon />}
            >
              Set Inactive ({selectedIds.length})
            </Button>
          </HStack>
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
                    <Checkbox
                      isChecked={allChecked}
                      onChange={handleSelectAll}
                      isIndeterminate={
                        selectedIds.length > 0 &&
                        selectedIds.length < employees.length
                      }
                    />
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
                      <Checkbox
                        isChecked={selectedIds.includes(employee.id)}
                        onChange={() => handleCheckboxChange(employee.id)}
                      />
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
                    <Td>{employee.role}</Td>
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
      {rederPagination()}
    </>
  );
};

export default Employees;
