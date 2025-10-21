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
  HStack,
  FormHelperText,
  List,
  ListItem,
} from "@chakra-ui/react";
import axiosInstance from "../../../lib/axiosInstance";

const AddSuspensionModal = ({ isOpen, onClose, onSuspensionAdded }) => {
  const [formData, setFormData] = useState({
    title: "",
    descriptions: "",
    employee: "",
    startDate: "",
    endDate: "",
    status: "active",
  });

  const [search, setSearch] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const toast = useToast();

  // Reset when modal opens
  useEffect(() => {
    if (isOpen) {
      resetForm();
    }
  }, [isOpen]);

  const resetForm = () => {
    setFormData({
      title: "",
      descriptions: "",
      employee: "",
      startDate: "",
      endDate: "",
      status: "active",
    });
    setSearch("");
    setSearchResults([]);
  };

  // Fetch matching employees dynamically
  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      if (search.trim().length >= 2) {
        fetchEmployees(search);
      } else {
        setSearchResults([]);
      }
    }, 400); // debounce search 400ms

    return () => clearTimeout(delayDebounce);
  }, [search]);

  const fetchEmployees = async (query) => {
    setLoading(true);
    try {
      const response = await axiosInstance.get(
        `/Suspension/searchEmployees?q=${query}`
      );
      setSearchResults(response.data.data || []); // Access 'data' property from API
      setShowResults(true);
    } catch (error) {
      console.error("Failed to search employees:", error);
      toast({
        title: "Error",
        description: "Failed to search employees.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEmployeeSelect = (employee) => {
    setFormData((prev) => ({
      ...prev,
      employee: employee._id,
    }));
    setSearch(employee.name || employee.email);
    setShowResults(false);
  };

  const handleSubmit = async () => {
    if (
      !formData.title.trim() ||
      !formData.descriptions.trim() ||
      !formData.employee
    ) {
      toast({
        title: "Validation Error",
        description:
          "Please fill in all required fields (Title, Description, Employee).",
        status: "warning",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    if (formData.startDate && formData.endDate) {
      const start = new Date(formData.startDate);
      const end = new Date(formData.endDate);
      if (start > end) {
        toast({
          title: "Validation Error",
          description: "Start date must be before end date.",
          status: "warning",
          duration: 3000,
          isClosable: true,
        });
        return;
      }
    }

    setSubmitting(true);
    try {
      const payload = {
        title: formData.title,
        descriptions: formData.descriptions,
        employee: formData.employee,
        startDate: formData.startDate || new Date(),
        endDate: formData.endDate || null,
        status: formData.status,
      };

      await axiosInstance.post("/suspension/create-suspension", payload);

      toast({
        title: "Success",
        description: "Suspension record created successfully.",
        status: "success",
        duration: 3000,
        isClosable: true,
      });

      if (onSuspensionAdded) await onSuspensionAdded();
      resetForm();
      onClose();
    } catch (error) {
      console.error("Create suspension error:", error);
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Failed to create suspension record.";
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

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Create New Suspension Record</ModalHeader>
        <ModalCloseButton isDisabled={submitting} />
        <ModalBody>
          <VStack spacing={4}>
            {/* Title */}
            <FormControl isRequired>
              <FormLabel fontWeight="600">Title</FormLabel>
              <Input
                name="title"
                value={formData.title}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, title: e.target.value }))
                }
                placeholder="e.g., Unauthorized Absence"
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
                onFocus={() => setShowResults(true)}
                isDisabled={submitting}
              />
              {loading && (
                <Box position="absolute" top="12px" right="12px">
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
                  maxH="150px"
                  overflowY="auto"
                  boxShadow="md"
                >
                  <List spacing={1}>
                    {searchResults.map((emp) => (
                      <ListItem
                        key={emp._id}
                        px={3}
                        py={2}
                        _hover={{ bg: "gray.100", cursor: "pointer" }}
                        onClick={() => handleEmployeeSelect(emp)}
                      >
                        <strong>{emp.name || emp.email}</strong>{" "}
                        <Box as="span" fontSize="sm" color="gray.600">
                          {emp.department ? `(${emp.department})` : ""}
                        </Box>
                      </ListItem>
                    ))}
                  </List>
                </Box>
              )}
            </FormControl>

            {/* Description */}
            <FormControl isRequired>
              <FormLabel fontWeight="600">Description/Reason</FormLabel>
              <Textarea
                name="descriptions"
                value={formData.descriptions}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    descriptions: e.target.value,
                  }))
                }
                placeholder="Describe the reason for suspension"
                rows={4}
                resize="vertical"
                isDisabled={submitting}
              />
            </FormControl>

            {/* Dates */}
            <HStack width="100%">
              <FormControl>
                <FormLabel fontWeight="600">Start Date</FormLabel>
                <Input
                  type="date"
                  name="startDate"
                  value={formData.startDate}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      startDate: e.target.value,
                    }))
                  }
                  isDisabled={submitting}
                />
              </FormControl>

              <FormControl>
                <FormLabel fontWeight="600">End Date</FormLabel>
                <Input
                  type="date"
                  name="endDate"
                  value={formData.endDate}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      endDate: e.target.value,
                    }))
                  }
                  isDisabled={submitting}
                />
              </FormControl>
            </HStack>

            {/* Status */}
            <FormControl isRequired>
              <FormLabel fontWeight="600">Status</FormLabel>
              <Input
                as="select"
                value={formData.status}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, status: e.target.value }))
                }
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
            colorScheme="red"
            onClick={handleSubmit}
            isLoading={submitting}
            loadingText="Creating..."
          >
            Create Suspension
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default AddSuspensionModal;
