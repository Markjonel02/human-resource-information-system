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
  // Modal imports (for Edit)
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  // Alert Dialog imports (for Deactivate)
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
  Grid,
  GridItem,
  Icon,
  // Drawer imports (for View)
  Drawer,
  DrawerOverlay,
  DrawerContent,
  DrawerHeader,
  DrawerBody,
  DrawerCloseButton,
} from "@chakra-ui/react";
import {
  SearchIcon,
  DeleteIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  EmailIcon,
  CalendarIcon,
  InfoIcon,
} from "@chakra-ui/icons";
import { FiMoreVertical } from "react-icons/fi";
import {
  FaBuilding,
  FaBriefcase,
  FaCalendarAlt,
  FaUserTie,
  FaDollarSign,
  FaIdCard,
  FaPhoneAlt,
  FaMapMarkerAlt,
  FaHome,
  FaRegListAlt,
  FaUniversity,
  FaCertificate,
  FaHeart,
  FaTransgender,
} from "react-icons/fa";
import axiosInstance from "../lib/axiosInstance";
import AddEmployeeButton from "../components/AddEmployeeButton";
import useDebounce from "../hooks/useDebounce";

// Helper function to format date
const formatDate = (dateString) => {
  if (!dateString) return "N/A";
  const date = new Date(dateString);
  if (isNaN(date)) return "N/A";
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

// Main component
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
  const [isViewDrawerOpen, setIsViewDrawerOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [fullEmployeeDetails, setFullEmployeeDetails] = useState(null);
  const [viewDetailsLoading, setViewDetailsLoading] = useState(false);

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

  // New handlers for View Drawer
  const onOpenViewDrawer = async (employee) => {
    setSelectedEmployee(employee);
    setIsViewDrawerOpen(true);
    setViewDetailsLoading(true);
    try {
      const token = localStorage.getItem("accessToken");
      const response = await axiosInstance.get(`/employees/${employee.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setFullEmployeeDetails(response.data);
    } catch (error) {
      console.error("Error fetching full employee details:", error);
      toast({
        title: "Failed to load details",
        description: "Could not fetch full employee information.",
        status: "error",
        duration: 4000,
        isClosable: true,
        position: "top",
      });
      setFullEmployeeDetails(null);
    } finally {
      setViewDetailsLoading(false);
    }
  };
  const onCloseViewDrawer = () => {
    setIsViewDrawerOpen(false);
    setSelectedEmployee(null);
    setFullEmployeeDetails(null);
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
                          <MenuItem onClick={() => onOpenViewDrawer(employee)}>
                            View
                          </MenuItem>
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

      {/* View Employee Drawer - Sliding from right */}
      <Drawer
        isOpen={isViewDrawerOpen}
        placement="right"
        onClose={onCloseViewDrawer}
        size="lg"
      >
        <DrawerOverlay />
        <DrawerContent bg="gray.100">
          <DrawerCloseButton />
          <DrawerHeader borderBottomWidth="1px" borderColor="gray.200">
            <Heading size="lg">Employee Details</Heading>
          </DrawerHeader>
          <DrawerBody>
            {viewDetailsLoading ? (
              <Flex justify="center" align="center" minHeight="200px">
                <Spinner size="xl" />
              </Flex>
            ) : !fullEmployeeDetails ? (
              <Text>Failed to load employee details.</Text>
            ) : (
              <Stack spacing={6}>
                {/* Employee Header Section (Top part of the image) */}
                <Flex
                  align="center"
                  bg="white"
                  p={6}
                  borderRadius="lg"
                  shadow="sm"
                >
                  <Avatar
                    size="xl"
                    src={`https://ui-avatars.com/api/?name=${fullEmployeeDetails.firstname}+${fullEmployeeDetails.lastname}&background=random`}
                    name={`${fullEmployeeDetails.firstname} ${fullEmployeeDetails.lastname}`}
                  />
                  <Box ml={6} flexGrow={1}>
                    <Text fontSize="md" fontWeight="bold" color="gray.600">
                      EMP ID: {fullEmployeeDetails.employeeId || "N/A"}
                    </Text>
                    <Heading size="xl">
                      {fullEmployeeDetails.firstname}{" "}
                      {fullEmployeeDetails.lastname}
                    </Heading>
                    <Text fontSize="md" color="gray.500">
                      {fullEmployeeDetails.jobposition || "N/A"} (
                      {fullEmployeeDetails.jobStatus || "N/A"})
                    </Text>
                    <Tag
                      mt={2}
                      size="md"
                      variant="solid"
                      colorScheme={
                        fullEmployeeDetails.employeeStatus === 1
                          ? "green"
                          : "red"
                      }
                    >
                      {fullEmployeeDetails.employeeStatus === 1
                        ? "Active"
                        : "Inactive"}
                    </Tag>
                  </Box>
                  <Box>
                    <Menu>
                      <MenuButton
                        as={Button}
                        rightIcon={<FiMoreVertical />}
                        variant="outline"
                      >
                        View Details
                      </MenuButton>
                      <MenuList>
                        <MenuItem>Action 1</MenuItem>
                        <MenuItem>Action 2</MenuItem>
                      </MenuList>
                    </Menu>
                  </Box>
                </Flex>

                {/* Main Details Grid (Middle of the image) */}
                <Box p={6} bg="white" borderRadius="lg" shadow="sm">
                  <Grid
                    templateColumns={{
                      base: "repeat(1, 1fr)",
                      md: "repeat(2, 1fr)",
                    }}
                    gap={6}
                  >
                    {/* The existing details from your previous code */}
                    {/* Column 1 */}
                    <Stack spacing={4}>
                      <Flex align="center">
                        <Icon as={FaBriefcase} color="blue.500" mr={3} />
                        <Text fontWeight="semibold">Department:</Text>
                        <Text ml={2}>
                          {fullEmployeeDetails.department || "N/A"}
                        </Text>
                      </Flex>
                      <Flex align="center">
                        <Icon as={FaUserTie} color="blue.500" mr={3} />
                        <Text fontWeight="semibold">Role:</Text>
                        <Text ml={2}>{fullEmployeeDetails.role || "N/A"}</Text>
                      </Flex>
                      <Flex align="center">
                        <Icon as={FaCalendarAlt} color="blue.500" mr={3} />
                        <Text fontWeight="semibold">Job Status:</Text>
                        <Text ml={2}>
                          {fullEmployeeDetails.jobStatus || "N/A"}
                        </Text>
                      </Flex>
                      <Flex align="center">
                        <Icon as={FaDollarSign} color="blue.500" mr={3} />
                        <Text fontWeight="semibold">Salary Rate:</Text>
                        <Text ml={2}>
                          {fullEmployeeDetails.salaryRate
                            ? `₱${fullEmployeeDetails.salaryRate.toLocaleString()}`
                            : "N/A"}
                        </Text>
                      </Flex>
                      <Flex align="center">
                        <Icon as={FaTransgender} color="blue.500" mr={3} />
                        <Text fontWeight="semibold">Gender:</Text>
                        <Text ml={2}>
                          {fullEmployeeDetails.gender || "N/A"}
                        </Text>
                      </Flex>
                      <Flex align="center">
                        <Icon as={CalendarIcon} color="blue.500" mr={3} />
                        <Text fontWeight="semibold">Birthday:</Text>
                        <Text ml={2}>
                          {formatDate(fullEmployeeDetails.birthday)}
                        </Text>
                      </Flex>
                      <Flex align="center">
                        <Icon as={FaPhoneAlt} color="blue.500" mr={3} />
                        <Text fontWeight="semibold">Mobile Number:</Text>
                        <Text ml={2}>
                          {fullEmployeeDetails.mobileNumber || "N/A"}
                        </Text>
                      </Flex>
                      <Flex align="center">
                        <Icon as={EmailIcon} color="blue.500" mr={3} />
                        <Text fontWeight="semibold">Email:</Text>
                        <Text ml={2}>
                          {fullEmployeeDetails.employeeEmail || "N/A"}
                        </Text>
                      </Flex>
                      <Flex align="center">
                        <Icon as={FaHeart} color="blue.500" mr={3} />
                        <Text fontWeight="semibold">Civil Status:</Text>
                        <Text ml={2}>
                          {fullEmployeeDetails.civilStatus || "N/A"}
                        </Text>
                      </Flex>
                      <Flex align="center">
                        <Icon as={FaUniversity} color="blue.500" mr={3} />
                        <Text fontWeight="semibold">
                          Educational Attainment:
                        </Text>
                        <Text ml={2}>
                          {fullEmployeeDetails.educationalAttainment || "N/A"}
                        </Text>
                      </Flex>
                    </Stack>

                    {/* Column 2 */}
                    <Stack spacing={4}>
                      <Flex align="center">
                        <Icon as={FaIdCard} color="blue.500" mr={3} />
                        <Text fontWeight="semibold">TIN Number:</Text>
                        <Text ml={2}>
                          {fullEmployeeDetails.tinNumber || "N/A"}
                        </Text>
                      </Flex>
                      <Flex align="center">
                        <Icon as={FaIdCard} color="blue.500" mr={3} />
                        <Text fontWeight="semibold">SSS Number:</Text>
                        <Text ml={2}>
                          {fullEmployeeDetails.sssNumber || "N/A"}
                        </Text>
                      </Flex>
                      <Flex align="center">
                        <Icon as={FaIdCard} color="blue.500" mr={3} />
                        <Text fontWeight="semibold">Philhealth Number:</Text>
                        <Text ml={2}>
                          {fullEmployeeDetails.philhealthNumber || "N/A"}
                        </Text>
                      </Flex>
                      <Flex align="center">
                        <Icon as={FaIdCard} color="blue.500" mr={3} />
                        <Text fontWeight="semibold">Pag-IBIG Number:</Text>
                        <Text ml={2}>
                          {fullEmployeeDetails.pagibigNumber || "N/A"}
                        </Text>
                      </Flex>
                      <Flex align="center">
                        <Icon as={FaHome} color="blue.500" mr={3} />
                        <Text fontWeight="semibold">Present Address:</Text>
                        <Text ml={2}>
                          {fullEmployeeDetails.presentAddress || "N/A"},{" "}
                          {fullEmployeeDetails.town || "N/A"},{" "}
                          {fullEmployeeDetails.city || "N/A"},{" "}
                          {fullEmployeeDetails.province || "N/A"}
                        </Text>
                      </Flex>
                      <Flex align="center">
                        <Icon as={FaMapMarkerAlt} color="blue.500" mr={3} />
                        <Text fontWeight="semibold">Location:</Text>
                        <Text ml={2}>
                          {fullEmployeeDetails.location || "N/A"}
                        </Text>
                      </Flex>
                      <Flex align="center">
                        <Icon as={FaBuilding} color="blue.500" mr={3} />
                        <Text fontWeight="semibold">Business Unit:</Text>
                        <Text ml={2}>
                          {fullEmployeeDetails.businessUnit || "N/A"}
                        </Text>
                      </Flex>
                      <Flex align="center">
                        <Icon as={FaUserTie} color="blue.500" mr={3} />
                        <Text fontWeight="semibold">Corporate Rank:</Text>
                        <Text ml={2}>
                          {fullEmployeeDetails.corporaterank || "N/A"}
                        </Text>
                      </Flex>
                      <Flex align="center">
                        <Icon as={FaRegListAlt} color="blue.500" mr={3} />
                        <Text fontWeight="semibold">Religion:</Text>
                        <Text ml={2}>
                          {fullEmployeeDetails.religion || "N/A"}
                        </Text>
                      </Flex>
                      <Flex align="center">
                        <Icon as={FaCertificate} color="blue.500" mr={3} />
                        <Text fontWeight="semibold">Achievements:</Text>
                        <Text ml={2}>
                          {fullEmployeeDetails.achievements || "N/A"}
                        </Text>
                      </Flex>
                    </Stack>
                  </Grid>
                </Box>

                {/* Attendance Summary Section (Bottom part of the image) */}
                <Box p={6} bg="white" borderRadius="lg" shadow="sm">
                  <Heading size="md" mb={4}>
                    Attendance Summary
                  </Heading>
                  <Grid
                    templateColumns={{
                      base: "repeat(2, 1fr)",
                      md: "repeat(4, 1fr)",
                    }}
                    gap={4}
                  >
                    <Box>
                      <Text color="gray.500">Year of Employment</Text>
                      <Text fontWeight="bold" fontSize="xl" color="blue.500">
                        2023
                      </Text>
                    </Box>
                    <Box>
                      <Text color="gray.500">Total Presents Days</Text>
                      <Text fontWeight="bold" fontSize="xl" color="green.500">
                        200 Days
                      </Text>
                    </Box>
                    <Box>
                      <Text color="gray.500">Total Absent Days</Text>
                      <Text fontWeight="bold" fontSize="xl" color="red.500">
                        3 Days
                      </Text>
                    </Box>
                    <Box>
                      <Text color="gray.500">Total Leave Days</Text>
                      <Text fontWeight="bold" fontSize="xl" color="blue.500">
                        7 Days
                      </Text>
                    </Box>
                  </Grid>
                </Box>

                {/* Monthly Log Section (Footer of the image) */}
                <Flex
                  justify="space-between"
                  align="center"
                  bg="white"
                  p={4}
                  borderRadius="lg"
                  shadow="sm"
                >
                  <Text fontWeight="semibold">March 2025 Log</Text>
                  <HStack spacing={2}>
                    <Button
                      /*     leftIcon={<Icon as={FiDownload} />} */
                      variant="outline"
                      colorScheme="purple"
                    >
                      Export CSV
                    </Button>
                    <Button
                      /*  leftIcon={<Icon as={FiFilter} />} */
                      variant="solid"
                      colorScheme="purple"
                    >
                      Filter
                    </Button>
                  </HStack>
                </Flex>
              </Stack>
            )}
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    </>
  );
};

export default Employees;
