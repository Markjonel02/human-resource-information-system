import React, { useEffect, useState, useRef } from "react";
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
  Stack,
  HStack,
  Spinner,
  useBreakpointValue,
  Button,
  useToast,
  Tooltip,
  // Modal imports
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  // Alert Dialog imports
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
} from "@chakra-ui/react";
import {
  SearchIcon,
  DeleteIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from "@chakra-ui/icons";
import { FiMoreVertical } from "react-icons/fi";
import axiosInstance from "../lib/axiosInstance";
import AddEmployeeButton from "../components/AddEmployeeButton";
import useDebounce from "../hooks/useDebounce";

const Employees = () => {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedIds, setSelectedIds] = useState([]);
  const [allChecked, setAllChecked] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");

  // State for Modals and Dialogs
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeactivateAlertOpen, setIsDeactivateAlertOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const cancelRef = useRef();

  const toast = useToast();
  const ITEMS_PER_PAGE = 10;
  const buttonLayout = useBreakpointValue({
    base: "vertical",
    md: "horizontal",
  });
  const isMobile = useBreakpointValue({ base: true, md: true, lg: false });

  // Handlers for Modals and Dialogs
  const onOpenEditModal = (employee) => {
    setSelectedEmployee(employee);
    setIsEditModalOpen(true);
  };
  const onCloseEditModal = () => {
    setIsEditModalOpen(false);
    setSelectedEmployee(null);
  };

  const onOpenDeactivateAlert = (employee) => {
    setSelectedEmployee(employee);
    setIsDeactivateAlertOpen(true);
  };
  const onCloseDeactivateAlert = () => {
    setIsDeactivateAlertOpen(false);
    setSelectedEmployee(null);
  };

  useEffect(() => {
    fetchingEmployees(currentPage);
  }, [currentPage]);

  const handleEmployeeAdded = () => {
    fetchingEmployees(currentPage);
    setSelectedIds([]);
    setAllChecked(false);
  };

  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  const filteredEmployees = employees.filter(
    (employee) =>
      employee.name.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
      employee.email
        .toLowerCase()
        .includes(debouncedSearchTerm.toLowerCase()) ||
      employee.department
        .toLowerCase()
        .includes(debouncedSearchTerm.toLowerCase()) ||
      employee.role.toLowerCase().includes(debouncedSearchTerm.toLowerCase())
  );

  const renderPagination = () => (
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
      setAllChecked(newSelection.length === filteredEmployees.length);
      return newSelection;
    });
  };

  const handleSelectAll = () => {
    if (allChecked) {
      setSelectedIds([]);
      setAllChecked(false);
    } else {
      const allIds = filteredEmployees.map((emp) => emp.id);
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
      fetchingEmployees(currentPage);
    } catch (error) {
      console.error("Error during bulk deactivate:", error);
      toast({
        title: "Update failed",
        description: "Could not deactivate selected employees.",
        status: "error",
        duration: 4000,
        isClosable: true,
        position: "top",
      });
    }
  };

  // New handler for single employee deactivation
  const handleDeactivateEmployee = async () => {
    if (!selectedEmployee) return;

    try {
      const token = localStorage.getItem("accessToken");
      await axiosInstance.put(
        `/employees/deactivate/${selectedEmployee.id}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      toast({
        title: "Employee Deactivated",
        description: `${selectedEmployee.name} has been marked as inactive.`,
        status: "success",
        duration: 4000,
        isClosable: true,
        position: "top",
      });
      fetchingEmployees(currentPage);
      onCloseDeactivateAlert();
    } catch (error) {
      console.error("Error deactivating employee:", error);
      toast({
        title: "Deactivation failed",
        description: "Could not deactivate the employee.",
        status: "error",
        duration: 4000,
        isClosable: true,
        position: "top",
      });
      onCloseDeactivateAlert();
    }
  };

  return (
    <>
      <Box p={6}>
        <Flex justify="space-between" mb={6} flexWrap="wrap" gap={3}>
          <Heading size="lg">Employee List</Heading>
        </Flex>

        <Flex justify="space-between" mb={6} flexWrap="wrap" gap={3}>
          {buttonLayout === "vertical" ? (
            <Stack spacing={3} w="100%">
              <InputGroup>
                <InputLeftElement pointerEvents="none">
                  <SearchIcon color="gray.400" />
                </InputLeftElement>
                <Input
                  placeholder="Search employees..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </InputGroup>

              <Button
                colorScheme="red"
                onClick={handleBulkDeactivate}
                isDisabled={selectedIds.length === 0}
                leftIcon={<DeleteIcon />}
              >
                Set Inactive ({selectedIds.length})
              </Button>
            </Stack>
          ) : (
            <HStack spacing={3} w="100%">
              <InputGroup w="300px">
                <InputLeftElement pointerEvents="none">
                  <SearchIcon color="gray.400" />
                </InputLeftElement>
                <Input
                  placeholder="Search employees..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </InputGroup>

              <Flex justifyContent={"flex-end"} flexGrow={1} gap={3}>
                <AddEmployeeButton onEmployeeAdded={handleEmployeeAdded} />
                <Button
                  colorScheme="red"
                  onClick={handleBulkDeactivate}
                  isDisabled={selectedIds.length === 0}
                  leftIcon={<DeleteIcon />}
                >
                  Set Inactive ({selectedIds.length})
                </Button>
              </Flex>
            </HStack>
          )}
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
                        selectedIds.length < filteredEmployees.length
                      }
                    />
                  </Th>
                  <Th>Employee</Th>
                  <Th display={{ base: "none", md: "none", lg: "table-cell" }}>
                    Email
                  </Th>
                  <Th display={{ base: "none", md: "none", lg: "table-cell" }}>
                    Department
                  </Th>
                  <Th display={{ base: "none", md: "none", lg: "table-cell" }}>
                    Role
                  </Th>
                  <Th display={{ base: "none", md: "none", lg: "table-cell" }}>
                    Status
                  </Th>
                  <Th>Actions</Th>
                </Tr>
              </Thead>
              <Tbody>
                {filteredEmployees.map((employee) => (
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
                        <Tooltip label={employee.name}>
                          <Text>
                            {isMobile && employee.name.length > 15
                              ? `${employee.name.slice(0, 15)}...`
                              : employee.name}
                          </Text>
                        </Tooltip>
                      </HStack>
                    </Td>
                    <Td
                      display={{ base: "none", md: "none", lg: "table-cell" }}
                    >
                      <Tooltip label={employee.email}>
                        <Text>
                          {isMobile && employee.email.length > 20
                            ? `${employee.email.slice(0, 20)}...`
                            : employee.email}
                        </Text>
                      </Tooltip>
                    </Td>
                    <Td
                      display={{ base: "none", md: "none", lg: "table-cell" }}
                    >
                      {employee.department}
                    </Td>
                    <Td
                      display={{ base: "none", md: "none", lg: "table-cell" }}
                    >
                      {employee.role}
                    </Td>
                    <Td
                      display={{ base: "none", md: "none", lg: "table-cell" }}
                    >
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
                          <MenuItem onClick={() => onOpenEditModal(employee)}>
                            Edit
                          </MenuItem>
                          <MenuItem
                            onClick={() => onOpenDeactivateAlert(employee)}
                          >
                            Deactivate
                          </MenuItem>
                        </MenuList>
                      </Menu>
                    </Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>

            {filteredEmployees.length === 0 && !loading && (
              <Flex justify="center" py={10}>
                <Text color="gray.500">
                  {searchTerm
                    ? "No employees found matching your search."
                    : "No employees found."}
                </Text>
              </Flex>
            )}
          </Box>
        )}
      </Box>

      {filteredEmployees.length > 0 && renderPagination()}

      {/* Edit Employee Modal */}
      <Modal isOpen={isEditModalOpen} onClose={onCloseEditModal}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Edit Employee Details</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {selectedEmployee ? (
              <Box>
                {/* Placeholder for the edit form. You can add your form fields here. */}
                <Text>Editing: {selectedEmployee.name}</Text>
                <Text>Email: {selectedEmployee.email}</Text>
                <Text mt={4}>
                  This is where your form to edit employee details would go.
                </Text>
              </Box>
            ) : (
              <Spinner />
            )}
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="blue" mr={3} onClick={onCloseEditModal}>
              Save
            </Button>
            <Button variant="ghost" onClick={onCloseEditModal}>
              Cancel
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Deactivate Employee Alert Dialog */}
      <AlertDialog
        isOpen={isDeactivateAlertOpen}
        leastDestructiveRef={cancelRef}
        onClose={onCloseDeactivateAlert}
      >
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize="lg" fontWeight="bold">
              Deactivate Employee
            </AlertDialogHeader>

            <AlertDialogBody>
              Are you sure you want to deactivate{" "}
              <Text as="span" fontWeight="bold">
                {selectedEmployee?.name}
              </Text>
              ? This action cannot be undone.
            </AlertDialogBody>

            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={onCloseDeactivateAlert}>
                Cancel
              </Button>
              <Button
                colorScheme="red"
                onClick={handleDeactivateEmployee}
                ml={3}
              >
                Deactivate
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </>
  );
};

export default Employees;
