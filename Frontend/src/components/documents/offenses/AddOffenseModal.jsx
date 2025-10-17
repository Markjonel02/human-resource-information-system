import React, { useState, useEffect } from "react";
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Button,
  FormControl,
  FormLabel,
  Input,
  Textarea,
  VStack,
  Select,
  useToast,
  Box,
  Text,
  HStack,
  Badge,
  Divider,
  Spinner,
  Center,
} from "@chakra-ui/react";
import axiosInstance from "../../../lib/axiosInstance";

const AddOffenseModal = ({ isOpen, onClose, onSuccess }) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [employeeId, setEmployeeId] = useState("");
  const [employeeName, setEmployeeName] = useState("");
  const [employeeDepartment, setEmployeeDepartment] = useState("");
  const [severity, setSeverity] = useState("minor");
  const [date, setDate] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // For employee search
  const [employees, setEmployees] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);

  // For late records
  const [lateRecords, setLateRecords] = useState([]);
  const [isLoadingLate, setIsLoadingLate] = useState(false);

  const toast = useToast();

  // Search employees
  useEffect(() => {
    const searchEmployees = async () => {
      if (searchQuery.length < 2) {
        setEmployees([]);
        return;
      }

      setIsSearching(true);
      try {
        const response = await axiosInstance.get(
          `/employee/search?q=${searchQuery}`
        );
        setEmployees(response.data.employees || []);
        setShowSuggestions(true);
      } catch (error) {
        console.error("Search failed:", error);
      } finally {
        setIsSearching(false);
      }
    };

    const debounce = setTimeout(searchEmployees, 300);
    return () => clearTimeout(debounce);
  }, [searchQuery]);

  // Fetch late records when employee is selected
  const fetchLateRecords = async (empId) => {
    setIsLoadingLate(true);
    try {
      const response = await axiosInstance.get(`/attendance/late/${empId}`);
      setLateRecords(response.data.lateRecords || []);
    } catch (error) {
      console.error("Failed to fetch late records:", error);
      setLateRecords([]);
    } finally {
      setIsLoadingLate(false);
    }
  };

  const handleSelectEmployee = (employee) => {
    setEmployeeId(employee._id);
    setEmployeeName(
      employee.name || `${employee.firstName} ${employee.lastName}`
    );
    setEmployeeDepartment(employee.department || "");
    setSearchQuery(
      employee.name || `${employee.firstName} ${employee.lastName}`
    );
    setShowSuggestions(false);
    fetchLateRecords(employee._id);
  };

  const handleSubmit = async () => {
    if (!title.trim()) {
      toast({
        title: "Validation Error",
        description: "Title is required.",
        status: "warning",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    if (!employeeId) {
      toast({
        title: "Validation Error",
        description: "Please select an employee.",
        status: "warning",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    setIsLoading(true);
    try {
      await axiosInstance.post("/offense/create", {
        title: title.trim(),
        description: description.trim(),
        employeeId,
        employeeName: employeeName.trim(),
        employeeDepartment: employeeDepartment.trim(),
        severity,
        date: date || new Date().toISOString(),
      });

      toast({
        title: "Success",
        description: "Offense record created successfully.",
        status: "success",
        duration: 3000,
        isClosable: true,
      });

      if (onSuccess) {
        onSuccess();
      }

      handleClose();
    } catch (error) {
      console.error("Create failed:", error);
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Failed to create offense record.";

      toast({
        title: "Create failed",
        description: errorMessage,
        status: "error",
        duration: 4000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setTitle("");
    setDescription("");
    setEmployeeId("");
    setEmployeeName("");
    setEmployeeDepartment("");
    setSeverity("minor");
    setDate("");
    setSearchQuery("");
    setEmployees([]);
    setLateRecords([]);
    setShowSuggestions(false);
    onClose();
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  const formatTime = (dateString) => {
    return new Date(dateString).toLocaleTimeString();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      size="xl"
      scrollBehavior="inside"
    >
      <ModalOverlay />
      <ModalContent maxH="90vh">
        <ModalHeader>Add Offense Record</ModalHeader>
        <ModalCloseButton />
        <ModalBody pb={6}>
          <VStack spacing={4} align="stretch">
            <FormControl isRequired>
              <FormLabel>Search Employee</FormLabel>
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Type employee name..."
                autoComplete="off"
              />
              {isSearching && <Spinner size="sm" mt={2} />}

              {showSuggestions && employees.length > 0 && (
                <Box
                  mt={2}
                  maxH="200px"
                  overflowY="auto"
                  borderWidth="1px"
                  borderRadius="md"
                  bg="white"
                >
                  {employees.map((emp) => (
                    <Box
                      key={emp._id}
                      p={3}
                      cursor="pointer"
                      _hover={{ bg: "gray.50" }}
                      onClick={() => handleSelectEmployee(emp)}
                      borderBottomWidth="1px"
                    >
                      <Text fontWeight="medium">
                        {emp.name || `${emp.firstName} ${emp.lastName}`}
                      </Text>
                      <Text fontSize="sm" color="gray.600">
                        {emp.department || "No department"}
                      </Text>
                    </Box>
                  ))}
                </Box>
              )}
            </FormControl>

            {employeeId && (
              <>
                <Box p={3} bg="blue.50" borderRadius="md">
                  <Text fontSize="sm" fontWeight="medium">
                    Selected Employee:
                  </Text>
                  <Text>{employeeName}</Text>
                  {employeeDepartment && (
                    <Text fontSize="sm" color="gray.600">
                      {employeeDepartment}
                    </Text>
                  )}
                </Box>

                <Divider />

                {/* Late Records Section */}
                <Box>
                  <Text fontWeight="bold" mb={2}>
                    Late Records ({lateRecords.length})
                  </Text>
                  {isLoadingLate ? (
                    <Center py={4}>
                      <Spinner />
                    </Center>
                  ) : lateRecords.length === 0 ? (
                    <Text fontSize="sm" color="gray.500">
                      No late records found for this employee.
                    </Text>
                  ) : (
                    <Box
                      maxH="200px"
                      overflowY="auto"
                      borderWidth="1px"
                      borderRadius="md"
                      p={2}
                    >
                      {lateRecords.map((record, idx) => (
                        <Box
                          key={idx}
                          p={2}
                          mb={2}
                          bg="orange.50"
                          borderRadius="md"
                        >
                          <HStack justify="space-between">
                            <Text fontSize="sm" fontWeight="medium">
                              {formatDate(record.date)}
                            </Text>
                            <Badge colorScheme="orange">
                              {record.tardinessMinutes} min late
                            </Badge>
                          </HStack>
                          {record.checkIn && (
                            <Text fontSize="xs" color="gray.600">
                              Check-in: {formatTime(record.checkIn)}
                            </Text>
                          )}
                        </Box>
                      ))}
                    </Box>
                  )}
                </Box>

                <Divider />
              </>
            )}

            <FormControl isRequired>
              <FormLabel>Offense Title</FormLabel>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., Multiple Late Arrivals"
              />
            </FormControl>

            <FormControl isRequired>
              <FormLabel>Severity</FormLabel>
              <Select
                value={severity}
                onChange={(e) => setSeverity(e.target.value)}
              >
                <option value="minor">Minor</option>
                <option value="major">Major</option>
                <option value="critical">Critical</option>
              </Select>
            </FormControl>

            <FormControl>
              <FormLabel>Date</FormLabel>
              <Input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </FormControl>

            <FormControl>
              <FormLabel>Description / Details</FormLabel>
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Enter offense details..."
                rows={4}
                resize="vertical"
              />
            </FormControl>
          </VStack>
        </ModalBody>

        <ModalFooter>
          <Button variant="ghost" mr={3} onClick={handleClose}>
            Cancel
          </Button>
          <Button
            colorScheme="blue"
            onClick={handleSubmit}
            isLoading={isLoading}
            loadingText="Creating..."
          >
            Create Offense
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default AddOffenseModal;
