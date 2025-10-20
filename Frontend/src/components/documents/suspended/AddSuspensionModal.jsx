// components/AddSuspensionModal.jsx
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
  Select,
  useToast,
  Spinner,
  Box,
  VStack,
  HStack,
  FormHelperText,
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

  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const toast = useToast();

  useEffect(() => {
    if (isOpen) {
      fetchEmployees();
      resetForm();
    }
  }, [isOpen]);

  const fetchEmployees = async () => {
    setLoading(true);
    try {
      const response = await axiosInstance.get("/users");
      setEmployees(response.data);
    } catch (error) {
      console.error("Failed to fetch employees:", error);
      toast({
        title: "Error",
        description: "Failed to load employees.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      title: "",
      descriptions: "",
      employee: "",
      startDate: "",
      endDate: "",
      status: "active",
    });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async () => {
    // Validation
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

      const response = await axiosInstance.post("/suspension", payload);

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
          {loading ? (
            <Box display="flex" justifyContent="center" py={8}>
              <Spinner />
            </Box>
          ) : (
            <VStack spacing={4}>
              <FormControl isRequired>
                <FormLabel fontWeight="600">Title</FormLabel>
                <Input
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="e.g., Unauthorized Absence"
                  size="md"
                  isDisabled={submitting}
                />
                <FormHelperText>Brief title for the suspension</FormHelperText>
              </FormControl>

              <FormControl isRequired>
                <FormLabel fontWeight="600">Employee</FormLabel>
                <Select
                  name="employee"
                  value={formData.employee}
                  onChange={handleChange}
                  placeholder="Select an employee"
                  isDisabled={submitting}
                >
                  {employees.map((emp) => (
                    <option key={emp._id} value={emp._id}>
                      {emp.name || emp.email} - {emp.department || "N/A"}
                    </option>
                  ))}
                </Select>
              </FormControl>

              <FormControl isRequired>
                <FormLabel fontWeight="600">Description/Reason</FormLabel>
                <Textarea
                  name="descriptions"
                  value={formData.descriptions}
                  onChange={handleChange}
                  placeholder="Describe the reason for suspension"
                  rows={4}
                  resize="vertical"
                  isDisabled={submitting}
                />
                <FormHelperText>
                  Provide detailed information about the suspension
                </FormHelperText>
              </FormControl>

              <HStack width="100%" spacing={4}>
                <FormControl>
                  <FormLabel fontWeight="600">Start Date</FormLabel>
                  <Input
                    type="date"
                    name="startDate"
                    value={formData.startDate}
                    onChange={handleChange}
                    isDisabled={submitting}
                  />
                </FormControl>

                <FormControl>
                  <FormLabel fontWeight="600">End Date</FormLabel>
                  <Input
                    type="date"
                    name="endDate"
                    value={formData.endDate}
                    onChange={handleChange}
                    isDisabled={submitting}
                  />
                  <FormHelperText>Leave empty if indefinite</FormHelperText>
                </FormControl>
              </HStack>

              <FormControl isRequired>
                <FormLabel fontWeight="600">Status</FormLabel>
                <Select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  isDisabled={submitting}
                >
                  <option value="active">Active</option>
                  <option value="pending">Pending</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </Select>
              </FormControl>
            </VStack>
          )}
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
