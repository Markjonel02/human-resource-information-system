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
  useToast,
  Spinner,
  Box,
  VStack,
  List,
  ListItem,
  FormHelperText,
} from "@chakra-ui/react";
import axiosInstance from "../../../lib/axiosInstance";

const EditSuspensionModal = ({ isOpen, onClose, item, onUpdate }) => {
  const [formData, setFormData] = useState({
    title: "",
    descriptions: "",
    employee: "",
    endDate: "",
    status: "active",
  });

  const [search, setSearch] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const toast = useToast();

  useEffect(() => {
    if (isOpen && item && item._id) {
      setFormData({
        title: item.title || "",
        descriptions: item.descriptions || "",
        employee: item.employee?._id || item.employee || "",
        endDate: item.endDate ? item.endDate.split("T")[0] : "",
        status: item.status || "active",
      });

      // Set selected employee for display
      if (item.employee && typeof item.employee === "object") {
        const empName = `${item.employee.firstname || ""} ${
          item.employee.lastname || ""
        }`.trim();
        setSearch(empName || item.employee.employeeEmail || "");
        setSelectedEmployee(item.employee);
      }
    } else {
      setFormData({
        title: "",
        descriptions: "",
        employee: "",
        endDate: "",
        status: "active",
      });
      setSearch("");
      setSelectedEmployee(null);
    }
  }, [isOpen, item]);

  // Search employees with debounce
  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      if (search.trim().length >= 2) {
        fetchEmployees(search);
      } else {
        setSearchResults([]);
      }
    }, 400);

    return () => clearTimeout(delayDebounce);
  }, [search]);

  const fetchEmployees = async (query) => {
    setLoading(true);
    try {
      const response = await axiosInstance.get(
        `/Suspension/search-employees?q=${encodeURIComponent(query)}`
      );
      const employees = response.data.data || [];
      setSearchResults(employees);
      setShowResults(true);
    } catch (error) {
      console.error("Failed to fetch employees:", error);
      if (error.response?.status !== 404) {
        toast({
          title: "Error",
          description: "Failed to search employees.",
          status: "error",
          duration: 3000,
          isClosable: true,
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleEmployeeSelect = (employee) => {
    setFormData((prev) => ({
      ...prev,
      employee: employee._id,
    }));
    setSelectedEmployee(employee);
    const empName =
      `${employee.firstname || ""} ${employee.lastname || ""}`.trim() ||
      employee.employeeEmail;
    setSearch(empName);
    setSearchResults([]); // Clear results after selection
    setShowResults(false);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async () => {
    if (!item || !item._id) {
      toast({
        title: "Error",
        description: "No suspension record to update.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    // Validate required fields
    if (!formData.status) {
      toast({
        title: "Validation Error",
        description: "Please select a status.",
        status: "warning",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    setSubmitting(true);
    try {
      // Admin can update all fields, HR only status
      const payload = {
        title: formData.title,
        descriptions: formData.descriptions,
        employee: formData.employee,
        endDate: formData.endDate || null,
        status: formData.status,
      };

      // Try admin endpoint first, fallback to HR endpoint
      try {
        await axiosInstance.put(`/Suspension/update-full/${item._id}`, payload);
      } catch (error) {
        if (error.response?.status === 403) {
          // If admin endpoint fails, try HR status-only endpoint
          await axiosInstance.put(`/Suspension/update/${item._id}`, {
            status: formData.status,
          });
        } else {
          throw error;
        }
      }

      toast({
        title: "Success",
        description: "Suspension record updated successfully.",
        status: "success",
        duration: 3000,
        isClosable: true,
      });

      if (onUpdate) await onUpdate();
      onClose();
    } catch (error) {
      console.error("Operation failed:", error);
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Failed to update suspension.";

      toast({
        title: "Error",
        description: errorMessage,
        status: "error",
        duration: 4000,
        isClosable: true,
      });
    } finally {
      setSubmitting(false);
    }
  };

  const isEditMode = item && item._id;
  const modalTitle = isEditMode
    ? "Edit Suspension Record"
    : "Add New Suspension";

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>{modalTitle}</ModalHeader>
        <ModalCloseButton isDisabled={submitting} />
        <ModalBody>
          <VStack spacing={4}>
            {/* Title */}
            <FormControl isRequired>
              <FormLabel fontWeight="600">Title</FormLabel>
              <Input
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="Enter suspension title"
                isDisabled={submitting}
              />
            </FormControl>

            {/* Employee Search */}
            <FormControl isRequired position="relative">
              <FormLabel fontWeight="600">Employee</FormLabel>
              <Input
                placeholder="Search employee by name or email"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onFocus={() => {
                  setShowResults(true);
                  if (search.trim().length >= 2) {
                    fetchEmployees(search);
                  }
                }}
                isDisabled={submitting}
              />
              {loading && (
                <Box position="absolute" top="32px" right="12px">
                  <Spinner size="sm" />
                </Box>
              )}
              {showResults && searchResults.length > 0 && (
                <Box
                  position="absolute"
                  zIndex="1000"
                  bg="white"
                  borderWidth="1px"
                  borderRadius="md"
                  mt={1}
                  width="100%"
                  maxH="200px"
                  overflowY="auto"
                  boxShadow="md"
                  top="100%"
                >
                  <List spacing={0}>
                    {searchResults.map((emp) => (
                      <ListItem
                        key={emp._id}
                        px={3}
                        py={2}
                        _hover={{ bg: "gray.100", cursor: "pointer" }}
                        onClick={() => handleEmployeeSelect(emp)}
                        borderBottom="1px solid"
                        borderColor="gray.200"
                      >
                        <strong>
                          {`${emp.firstname || ""} ${
                            emp.lastname || ""
                          }`.trim() || emp.employeeEmail}
                        </strong>
                        <Box as="div" fontSize="sm" color="gray.600">
                          {emp.employeeEmail}
                        </Box>
                        <Box as="div" fontSize="xs" color="gray.500">
                          {emp.department && `Dept: ${emp.department}`}
                          {emp.jobposition && ` | Position: ${emp.jobposition}`}
                        </Box>
                      </ListItem>
                    ))}
                  </List>
                </Box>
              )}
              {showResults &&
                searchResults.length === 0 &&
                !loading &&
                search.trim().length >= 2 && (
                  <Box
                    position="absolute"
                    zIndex="1000"
                    bg="white"
                    borderWidth="1px"
                    borderRadius="md"
                    mt={1}
                    width="100%"
                    px={3}
                    py={2}
                    boxShadow="md"
                    fontSize="sm"
                    color="gray.500"
                    top="100%"
                  >
                    No employees found
                  </Box>
                )}
              {selectedEmployee && (
                <FormHelperText>
                  Selected: {selectedEmployee.firstname}{" "}
                  {selectedEmployee.lastname}
                </FormHelperText>
              )}
            </FormControl>

            {/* Description */}
            <FormControl isRequired>
              <FormLabel fontWeight="600">Description</FormLabel>
              <Textarea
                name="descriptions"
                value={formData.descriptions}
                onChange={handleChange}
                placeholder="Enter suspension reason/description"
                rows={4}
                resize="vertical"
                isDisabled={submitting}
              />
            </FormControl>

            {/* End Date */}
            <FormControl>
              <FormLabel fontWeight="600">End Date</FormLabel>
              <Input
                type="date"
                name="endDate"
                value={formData.endDate}
                onChange={handleChange}
                isDisabled={submitting}
              />
            </FormControl>

            {/* Status */}
            <FormControl isRequired>
              <FormLabel fontWeight="600">Status</FormLabel>
              <Input
                as="select"
                name="status"
                value={formData.status}
                onChange={handleChange}
                isDisabled={submitting}
              >
                <option value="active">Active</option>
                <option value="pending">Pending</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </Input>
            </FormControl>
          </VStack>
        </ModalBody>

        <ModalFooter>
          <Button
            variant="ghost"
            mr={3}
            onClick={onClose}
            isDisabled={submitting}
          >
            Cancel
          </Button>
          <Button
            colorScheme="blue"
            onClick={handleSubmit}
            isLoading={submitting}
            loadingText="Saving..."
          >
            {isEditMode ? "Update" : "Create"}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default EditSuspensionModal;
