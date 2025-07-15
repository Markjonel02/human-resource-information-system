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
  useToast, // Import useToast for notifications
  Button, // Import Button for the new actions
  // Removed Spacer as it's replaced by Box for the line
  Modal, // Import Modal components for individual actions
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  useDisclosure, // Import useDisclosure for modal control
  FormControl,
  FormLabel,
  Select, // Import Select component
  // Removed Option import as it's not a Chakra UI component
} from "@chakra-ui/react";
import {
  SearchIcon,
  ChevronDownIcon,
  CalendarIcon,
  Trash2,
  UserX,
  Edit, // Lucide icon for Edit
  Eye, // Lucide icon for View
} from "lucide-react"; // Using lucide-react for new icons
import AddEmployeeButton from "../components/AddemployeeButton"; // Assuming this path is correct

// Initial data for employees
const initialEmployeesData = [
  {
    id: 1,
    name: "Floyd Miles",
    email: "floydmiles@pagedone.io",
    department: "Design",
    joinDate: "Jun. 24, 2023",
    status: "Active",
    avatar:
      "https://images.unsplash.com/photo-1534528736733-d922e9643640?q=80&w=2940&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  },
  {
    id: 2,
    name: "Savannah Nguyen",
    email: "savannahng@pagedone.io",
    department: "Research",
    joinDate: "Feb. 23, 2023",
    status: "Inactive",
    avatar:
      "https://images.unsplash.com/photo-1580489944761-15a19d654956?q=80&w=2861&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  },
  {
    id: 3,
    name: "Cameron Williamson",
    email: "cameron@pagedone.io",
    department: "Development",
    joinDate: "Oct. 23, 2023",
    status: "Onboarding",
    avatar:
      "https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=2876&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  },
  {
    id: 4,
    name: "Darrell Steward",
    email: "darrellstew@pagedone.io",
    department: "AI & ML",
    joinDate: "Jul. 12, 2023",
    status: "Inactive",
    avatar:
      "https://images.unsplash.com/photo-1568602471122-7832951cc4c5?q=80&w=2940&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  },
  {
    id: 5,
    name: "Laura Bran",
    email: "laurabran@pagedone.io",
    department: "Design",
    joinDate: "Sep. 29, 2023",
    status: "Active",
    avatar:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29329?q=80&w=2874&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  },
  {
    id: 6,
    name: "Alfred Frook",
    email: "alfredfrook@pagedone.io",
    department: "Design",
    joinDate: "Dec. 02, 2023",
    status: "Active",
    avatar:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=2874&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  },
  {
    id: 7,
    name: "Biren Singh",
    email: "birensingh@pagedone.io",
    department: "Design",
    joinDate: "Dec. 02, 2023",
    status: "Active",
    avatar:
      "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=2874&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  },
];

const Employees = () => {
  const [searchTerm, setSearchTerm] = useState("");
  // State to hold the mutable list of employees
  const [employees, setEmployees] = useState(initialEmployeesData);
  // State to hold the IDs of selected employees for bulk actions
  const [selectedEmployeeIds, setSelectedEmployeeIds] = useState([]);
  const toast = useToast(); // Initialize useToast

  // Modals for individual row actions
  const {
    isOpen: isEditModalOpen,
    onOpen: onOpenEditModal,
    onClose: onCloseEditModal,
  } = useDisclosure();
  const {
    isOpen: isViewModalOpen,
    onOpen: onOpenViewModal,
    onClose: onCloseViewModal,
  } = useDisclosure();
  const {
    isOpen: isDeleteConfirmModalOpen,
    onOpen: onOpenDeleteConfirmModal,
    onClose: onCloseDeleteConfirmModal,
  } = useDisclosure();

  const [employeeToEdit, setEmployeeToEdit] = useState(null);
  const [employeeToView, setEmployeeToView] = useState(null);
  const [employeeToDelete, setEmployeeToDelete] = useState(null);

  // Filter employees based on search term
  const filteredEmployees = employees.filter(
    (employee) =>
      employee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.department.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Function to get status styling for Chakra Tag
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

  // Handle individual checkbox change for bulk actions
  const handleCheckboxChange = (employeeId) => {
    setSelectedEmployeeIds((prevSelected) =>
      prevSelected.includes(employeeId)
        ? prevSelected.filter((id) => id !== employeeId)
        : [...prevSelected, employeeId]
    );
  };

  // Handle "select all" checkbox change for bulk actions
  const handleSelectAllChange = (event) => {
    if (event.target.checked) {
      setSelectedEmployeeIds(filteredEmployees.map((employee) => employee.id));
    } else {
      setSelectedEmployeeIds([]);
    }
  };

  // Check if all filtered employees are selected for bulk actions
  const isAllSelected =
    filteredEmployees.length > 0 &&
    selectedEmployeeIds.length === filteredEmployees.length &&
    filteredEmployees.every((employee) =>
      selectedEmployeeIds.includes(employee.id)
    );

  // Handle Delete Selected Employees (Bulk Action)
  const handleDeleteSelected = () => {
    if (selectedEmployeeIds.length === 0) {
      toast({
        title: "No employees selected",
        description: "Please select employees to delete.",
        status: "warning",
        duration: 3000,
        isClosable: true,
        position: "top",
      });
      return;
    }

    const newEmployees = employees.filter(
      (employee) => !selectedEmployeeIds.includes(employee.id)
    );
    setEmployees(newEmployees);
    setSelectedEmployeeIds([]); // Clear selection after deletion

    toast({
      title: "Employees Deleted!",
      description: `${selectedEmployeeIds.length} employee(s) removed.`,
      status: "success",
      duration: 3000,
      isClosable: true,
      position: "top",
    });
  };

  // Handle Mark Inactive Selected Employees (Bulk Action)
  const handleMarkInactiveSelected = () => {
    if (selectedEmployeeIds.length === 0) {
      toast({
        title: "No employees selected",
        description: "Please select employees to mark inactive.",
        status: "warning",
        duration: 3000,
        isClosable: true,
        position: "top",
      });
      return;
    }

    const updatedEmployees = employees.map((employee) =>
      selectedEmployeeIds.includes(employee.id)
        ? { ...employee, status: "Inactive" }
        : employee
    );
    setEmployees(updatedEmployees);
    setSelectedEmployeeIds([]); // Clear selection after update

    toast({
      title: "Status Updated!",
      description: `${selectedEmployeeIds.length} employee(s) marked as Inactive.`,
      status: "info",
      duration: 3000,
      isClosable: true,
      position: "top",
    });
  };

  // --- Individual Row Action Handlers ---

  const handleEditClick = (employee) => {
    setEmployeeToEdit({ ...employee }); // Create a copy to avoid direct state mutation
    onOpenEditModal();
  };

  const handleSaveEditedEmployee = () => {
    if (employeeToEdit) {
      setEmployees((prevEmployees) =>
        prevEmployees.map((emp) =>
          emp.id === employeeToEdit.id ? employeeToEdit : emp
        )
      );
      toast({
        title: "Employee Updated!",
        description: `${employeeToEdit.name}'s details have been updated.`,
        status: "success",
        duration: 3000,
        isClosable: true,
        position: "top",
      });
      onCloseEditModal();
      setEmployeeToEdit(null);
    }
  };

  const handleViewClick = (employee) => {
    setEmployeeToView(employee);
    onOpenViewModal();
  };

  const handleDeleteIndividualClick = (employee) => {
    setEmployeeToDelete(employee);
    onOpenDeleteConfirmModal();
  };

  const handleConfirmIndividualDelete = () => {
    if (employeeToDelete) {
      setEmployees((prevEmployees) =>
        prevEmployees.filter((emp) => emp.id !== employeeToDelete.id)
      );
      toast({
        title: "Employee Deleted!",
        description: `${employeeToDelete.name} has been removed.`,
        status: "success",
        duration: 3000,
        isClosable: true,
        position: "top",
      });
      onCloseDeleteConfirmModal();
      setEmployeeToDelete(null);
    }
  };

  return (
    <>
      <Box
        minH="100vh"
        p={{ base: 4, sm: 4, lg: 8 }}
        fontFamily="Inter, sans-serif"
      >
        <HStack
          spacing={5}
          mt={{ base: 4, md: 5 }}
          mb={4}
          wrap="wrap"
          display={"flex"}
          justifyContent={"end"}
        >
          <AddEmployeeButton />
          <Button
            colorScheme="red"
            leftIcon={<Trash2 size={18} />}
            onClick={handleDeleteSelected}
            isDisabled={selectedEmployeeIds.length === 0}
            borderRadius="lg"
            size="md"
            px={4}
          >
            Delete
          </Button>
          <Button
            colorScheme="orange"
            leftIcon={<UserX size={18} />}
            onClick={handleMarkInactiveSelected}
            isDisabled={selectedEmployeeIds.length === 0}
            borderRadius="lg"
            size="md"
            px={5}
          >
            Mark Inactive
          </Button>
        </HStack>
        {/* Replaced Spacer with Box for the visual line */}
        <Box borderTop="1px solid" borderColor="blue.200" mb="5" />
        {/* Header Section */}
        <Flex
          direction={{ base: "column", md: "row" }}
          justify="space-between"
          align={{ base: "flex-start", md: "center" }}
          mb={6}
          wrap="wrap" // Allow wrapping on smaller screens
        >
          {/* Left Section: Heading and Add Employee Button */}
          <VStack align="flex-start" spacing={4} mb={{ base: 4, md: 0 }}>
            <Heading
              as="h1"
              fontSize={{ base: "2xl", sm: "3xl" }}
              fontWeight="bold"
              color="gray.800"
            >
              Employees Status
            </Heading>
          </VStack>
          {/* Right Section: Search and Action Buttons */}
          <VStack
            align={{ base: "flex-start", md: "flex-end" }}
            spacing={4}
            flex="1"
          >
            <InputGroup w={{ base: "full", md: "300px" }}>
              <InputLeftElement pointerEvents="none">
                <SearchIcon color="gray.400" />
              </InputLeftElement>
              <Input
                type="text"
                placeholder="Search here"
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
            {/* Action Buttons */}
          </VStack>{" "}
        </Flex>
        {/* Employee Table */}
        <Box bg="white" borderRadius="lg" shadow="md" overflowX="auto">
          <Table
            variant="simple"
            minW="full"
            divideY="200"
            borderCollapse="collapse"
          >
            <Thead bg="gray.50">
              <Tr>
                <Th
                  py={3}
                  px={4}
                  textAlign="left"
                  fontSize="xs"
                  fontWeight="medium"
                  color="gray.500"
                  textTransform="uppercase"
                  letterSpacing="wider"
                >
                  <Checkbox
                    colorScheme="blue"
                    isChecked={isAllSelected}
                    onChange={handleSelectAllChange}
                    isDisabled={filteredEmployees.length === 0}
                  />
                </Th>
                <Th
                  py={3}
                  px={4}
                  textAlign="left"
                  fontSize="xs"
                  fontWeight="medium"
                  color="gray.500"
                  textTransform="uppercase"
                  letterSpacing="wider"
                >
                  Full Name & Email
                </Th>
                <Th
                  py={3}
                  px={4}
                  textAlign="left"
                  fontSize="xs"
                  fontWeight="medium"
                  color="gray.500"
                  textTransform="uppercase"
                  letterSpacing="wider"
                >
                  Department
                </Th>
                <Th
                  py={3}
                  px={4}
                  textAlign="left"
                  fontSize="xs"
                  fontWeight="medium"
                  color="gray.500"
                  textTransform="uppercase"
                  letterSpacing="wider"
                >
                  Join Date
                </Th>
                <Th
                  py={3}
                  px={4}
                  textAlign="left"
                  fontSize="xs"
                  fontWeight="medium"
                  color="gray.500"
                  textTransform="uppercase"
                  letterSpacing="wider"
                >
                  Status
                </Th>
                <Th
                  py={3}
                  px={4}
                  textAlign="left"
                  fontSize="xs"
                  fontWeight="medium"
                  color="gray.500"
                  textTransform="uppercase"
                  letterSpacing="wider"
                >
                  Actions
                </Th>
              </Tr>
            </Thead>
            <Tbody bg="white" borderBottomWidth="1px" borderColor="gray.200">
              {filteredEmployees.length > 0 ? (
                filteredEmployees.map((employee) => (
                  <Tr key={employee.id}>
                    <Td px={4} py={4} whiteSpace="nowrap">
                      <Checkbox
                        colorScheme="blue"
                        isChecked={selectedEmployeeIds.includes(employee.id)}
                        onChange={() => handleCheckboxChange(employee.id)}
                      />
                    </Td>
                    <Td px={4} py={4} whiteSpace="nowrap">
                      <Flex align="center">
                        <Avatar
                          size="md"
                          name={employee.name}
                          src={employee.avatar}
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = `https://placehold.co/100x100/aabbcc/ffffff?text=${employee.name.charAt(
                              0
                            )}`;
                          }}
                        />
                        <Box ml={4}>
                          <Text
                            fontSize="sm"
                            fontWeight="medium"
                            color="gray.900"
                          >
                            {employee.name}
                          </Text>
                          <Text fontSize="sm" color="gray.500">
                            {employee.email}
                          </Text>
                        </Box>
                      </Flex>
                    </Td>
                    <Td px={4} py={4} whiteSpace="nowrap">
                      <Text fontSize="sm" color="gray.900">
                        {employee.department}
                      </Text>
                    </Td>
                    <Td px={4} py={4} whiteSpace="nowrap">
                      <Text fontSize="sm" color="gray.900">
                        <HStack
                          spacing={1}
                          display="inline-flex"
                          alignItems="center"
                        >
                          <CalendarIcon w={3} h={3} color="gray.500" />
                          <Text>{employee.joinDate}</Text>
                        </HStack>
                      </Text>
                    </Td>
                    <Td px={4} py={4} whiteSpace="nowrap">
                      <Tag
                        size="md"
                        variant="subtle"
                        colorScheme={getStatusColorScheme(employee.status)}
                      >
                        {employee.status}
                      </Tag>
                    </Td>
                    <Td
                      px={4}
                      py={4}
                      whiteSpace="nowrap"
                      textAlign="right"
                      fontSize="sm"
                      fontWeight="medium"
                    >
                      <Menu>
                        <MenuButton
                          as={IconButton}
                          aria-label="Options"
                          icon={<ChevronDownIcon />}
                          variant="ghost"
                          colorScheme="gray"
                        />
                        <MenuList>
                          <MenuItem
                            icon={<Edit size={16} />}
                            onClick={() => handleEditClick(employee)}
                          >
                            Edit
                          </MenuItem>
                          <MenuItem
                            icon={<Eye size={16} />}
                            onClick={() => handleViewClick(employee)}
                          >
                            View
                          </MenuItem>
                          <MenuItem
                            icon={<Trash2 size={16} />}
                            onClick={() =>
                              handleDeleteIndividualClick(employee)
                            }
                          >
                            Delete
                          </MenuItem>
                        </MenuList>
                      </Menu>
                    </Td>
                  </Tr>
                ))
              ) : (
                <Tr>
                  <Td colSpan={6} textAlign="center" py={10}>
                    <Text fontSize="lg" color="gray.500">
                      No employees found.
                    </Text>
                  </Td>
                </Tr>
              )}
            </Tbody>
          </Table>
        </Box>
      </Box>

      {/* Edit Employee Modal */}
      <Modal isOpen={isEditModalOpen} onClose={onCloseEditModal} isCentered>
        <ModalOverlay />
        <ModalContent borderRadius="xl" p={4}>
          <ModalHeader fontSize="2xl" fontWeight="bold">
            Edit Employee
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {employeeToEdit && (
              <VStack spacing={4}>
                <FormControl>
                  <FormLabel>Name</FormLabel>
                  <Input
                    value={employeeToEdit.name}
                    onChange={(e) =>
                      setEmployeeToEdit({
                        ...employeeToEdit,
                        name: e.target.value,
                      })
                    }
                    borderRadius="lg"
                  />
                </FormControl>
                <FormControl>
                  <FormLabel>Email</FormLabel>
                  <Input
                    value={employeeToEdit.email}
                    onChange={(e) =>
                      setEmployeeToEdit({
                        ...employeeToEdit,
                        email: e.target.value,
                      })
                    }
                    borderRadius="lg"
                  />
                </FormControl>
                <FormControl>
                  <FormLabel>Department</FormLabel>
                  <Input
                    value={employeeToEdit.department}
                    onChange={(e) =>
                      setEmployeeToEdit({
                        ...employeeToEdit,
                        department: e.target.value,
                      })
                    }
                    borderRadius="lg"
                  />
                </FormControl>
                <FormControl>
                  <FormLabel>Status</FormLabel>
                  <Select
                    value={employeeToEdit.status}
                    onChange={(e) =>
                      setEmployeeToEdit({
                        ...employeeToEdit,
                        status: e.target.value,
                      })
                    }
                    borderRadius="lg"
                  >
                    {/* Use standard <option> tags */}
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                    <option value="Onboarding">Onboarding</option>
                  </Select>
                </FormControl>
              </VStack>
            )}
          </ModalBody>
          <ModalFooter>
            <Button
              variant="ghost"
              onClick={onCloseEditModal}
              borderRadius="lg"
              mr={3}
            >
              Cancel
            </Button>
            <Button
              colorScheme="blue"
              onClick={handleSaveEditedEmployee}
              borderRadius="lg"
            >
              Save Changes
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* View Employee Modal */}
      <Modal isOpen={isViewModalOpen} onClose={onCloseViewModal} isCentered>
        <ModalOverlay />
        <ModalContent borderRadius="xl" p={4}>
          <ModalHeader fontSize="2xl" fontWeight="bold">
            Employee Details
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {employeeToView && (
              <VStack align="flex-start" spacing={3}>
                <HStack>
                  <Text fontWeight="bold">Name:</Text>
                  <Text>{employeeToView.name}</Text>
                </HStack>
                <HStack>
                  <Text fontWeight="bold">Email:</Text>
                  <Text>{employeeToView.email}</Text>
                </HStack>
                <HStack>
                  <Text fontWeight="bold">Department:</Text>
                  <Text>{employeeToView.department}</Text>
                </HStack>
                <HStack>
                  <Text fontWeight="bold">Join Date:</Text>
                  <Text>{employeeToView.joinDate}</Text>
                </HStack>
                <HStack>
                  <Text fontWeight="bold">Status:</Text>
                  <Tag
                    size="md"
                    variant="subtle"
                    colorScheme={getStatusColorScheme(employeeToView.status)}
                  >
                    {employeeToView.status}
                  </Tag>
                </HStack>
              </VStack>
            )}
          </ModalBody>
          <ModalFooter>
            <Button onClick={onCloseViewModal} borderRadius="lg">
              Close
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={isDeleteConfirmModalOpen}
        onClose={onCloseDeleteConfirmModal}
        isCentered
      >
        <ModalOverlay />
        <ModalContent borderRadius="xl" p={4}>
          <ModalHeader fontSize="2xl" fontWeight="bold">
            Confirm Deletion
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {employeeToDelete && (
              <Text>
                Are you sure you want to delete employee{" "}
                <Text as="span" fontWeight="bold">
                  {employeeToDelete.name}
                </Text>
                ? This action cannot be undone.
              </Text>
            )}
          </ModalBody>
          <ModalFooter>
            <Button
              variant="ghost"
              onClick={onCloseDeleteConfirmModal}
              borderRadius="lg"
              mr={3}
            >
              Cancel
            </Button>
            <Button
              colorScheme="red"
              onClick={handleConfirmIndividualDelete}
              borderRadius="lg"
            >
              Delete
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};

export default Employees;
