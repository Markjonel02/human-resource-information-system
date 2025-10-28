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
  HStack,
  Box,
  Text,
} from "@chakra-ui/react";
import axiosInstance from "../../../lib/axiosInstance";

const EditOffenseModal = ({ isOpen, onClose, item, onUpdate }) => {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    employeeName: "",
    employeeDepartment: "",
    severity: "minor",
    category: "other",
    status: "pending",
    date: "",
    employeeId: "",
    actionTaken: "",
    notes: "",
    recordedBy: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const toast = useToast();

  // Update form when item changes
  useEffect(() => {
    if (item && isOpen) {
      setFormData({
        title: item.title || "",
        description: item.description || item.offenseDetails || "",
        employeeName: item.employeeName || "",
        employeeDepartment: item.employeeDepartment || "",
        severity: item.severity || "minor",
        category: item.category || "other",
        status: item.status || "pending",
        date: item.date ? new Date(item.date).toISOString().split("T")[0] : "",
        employeeId: item.employee?._id || item.employeeId || "",
        actionTaken: item.actionTaken || "",
        notes: item.notes || "",
        recordedBy: item.recordedBy || "",
      });
    }
  }, [item, isOpen]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async () => {
    const offenseId = item?._id || item?.id;

    if (!offenseId) {
      toast({
        title: "Update failed",
        description: "Offense ID not found.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    if (!formData.title.trim()) {
      toast({
        title: "Validation Error",
        description: "Title is required.",
        status: "warning",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    if (!formData.severity) {
      toast({
        title: "Validation Error",
        description: "Severity is required.",
        status: "warning",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    setIsLoading(true);
    try {
      const updatePayload = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        severity: formData.severity,
        category: formData.category,
        status: formData.status,
        actionTaken: formData.actionTaken.trim(),
        notes: formData.notes.trim(),
        date: formData.date || new Date().toISOString(),
      };

      const response = await axiosInstance.put(
        `/offense/${offenseId}`,
        updatePayload
      );

      // Call the parent callback to update the list and close modal
      if (onUpdate) {
        await onUpdate();
      }

      handleClose();
    } catch (error) {
      console.error("Update failed:", error);
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Failed to update offense record.";

      toast({
        title: "Update failed",
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
    // Reset form when closing
    setFormData({
      title: "",
      description: "",
      employeeName: "",
      employeeDepartment: "",
      severity: "minor",
      category: "other",
      status: "pending",
      date: "",
      employeeId: "",
      actionTaken: "",
      notes: "",
      recordedBy: "",
    });
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      size="lg"
      scrollBehavior="inside"
    >
      <ModalOverlay />
      <ModalContent maxH="90vh">
        <ModalHeader>Edit Offense Record</ModalHeader>
        <ModalCloseButton />
        <ModalBody pb={6}>
          <VStack spacing={4}>
            <FormControl>
              <FormLabel>Employee Information</FormLabel>
              <Box p={3} bg="blue.50" borderRadius="md">
                <Text fontWeight="600">{formData.employeeName}</Text>
                <Text fontSize="sm" color="gray.600">
                  {formData.employeeDepartment}
                </Text>
                {formData.recordedBy && (
                  <Text fontSize="xs" color="gray.500" mt={1}>
                    Recorded by: {formData.recordedBy}
                  </Text>
                )}
              </Box>
            </FormControl>

            <FormControl isRequired>
              <FormLabel>Title</FormLabel>
              <Input
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                placeholder="Enter offense title"
              />
            </FormControl>

            <HStack spacing={4} w="100%">
              <FormControl isRequired>
                <FormLabel>Severity</FormLabel>
                <Select
                  name="severity"
                  value={formData.severity}
                  onChange={handleInputChange}
                >
                  <option value="minor">Minor</option>
                  <option value="moderate">Moderate</option>
                  <option value="major">Major</option>
                  <option value="critical">Critical</option>
                </Select>
              </FormControl>

              <FormControl isRequired>
                <FormLabel>Category</FormLabel>
                <Select
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                >
                  <option value="attendance">Attendance</option>
                  <option value="conduct">Conduct</option>
                  <option value="performance">Performance</option>
                  <option value="insubordination">Insubordination</option>
                  <option value="other">Other</option>
                </Select>
              </FormControl>
            </HStack>

            <HStack spacing={4} w="100%">
              <FormControl isRequired>
                <FormLabel>Status</FormLabel>
                <Select
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                >
                  <option value="pending">Pending</option>
                  <option value="acknowledged">Acknowledged</option>
                  <option value="resolved">Resolved</option>
                </Select>
              </FormControl>

              <FormControl>
                <FormLabel>Date</FormLabel>
                <Input
                  name="date"
                  type="date"
                  value={formData.date}
                  onChange={handleInputChange}
                />
              </FormControl>
            </HStack>

            <FormControl>
              <FormLabel>Action Taken</FormLabel>
              <Input
                name="actionTaken"
                value={formData.actionTaken}
                onChange={handleInputChange}
                placeholder="e.g., Verbal warning, Written warning, Suspension"
              />
            </FormControl>

            <FormControl>
              <FormLabel>Description / Details</FormLabel>
              <Textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Enter offense details"
                rows={3}
                resize="vertical"
              />
            </FormControl>

            <FormControl>
              <FormLabel>Additional Notes</FormLabel>
              <Textarea
                name="notes"
                value={formData.notes}
                onChange={handleInputChange}
                placeholder="Any additional notes or observations..."
                rows={2}
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
            loadingText="Saving..."
          >
            Save Changes
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default EditOffenseModal;
