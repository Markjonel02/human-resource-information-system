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
} from "@chakra-ui/react";
import axiosInstance from "../../../lib/axiosInstance";

const EditOffenseModal = ({ isOpen, onClose, item, onUpdate }) => {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    employeeName: "",
    employeeDepartment: "",
    severity: "minor",
    date: "",
    employeeId: "",
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
        date: item.date ? new Date(item.date).toISOString().split("T")[0] : "",
        employeeId: item.employee?._id || item.employeeId || "",
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
        date: formData.date || new Date().toISOString(),
      };

      const response = await axiosInstance.put(
        `/offense/${offenseId}`,
        updatePayload
      );

      toast({
        title: "Success",
        description: "Offense record updated successfully.",
        status: "success",
        duration: 3000,
        isClosable: true,
      });

      // Call the parent callback to update the list
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
      date: "",
      employeeId: "",
    });
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} size="lg">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Edit Offense Record</ModalHeader>
        <ModalCloseButton />
        <ModalBody pb={6}>
          <VStack spacing={4}>
            <FormControl isRequired>
              <FormLabel>Title</FormLabel>
              <Input
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                placeholder="Enter offense title"
              />
            </FormControl>

            <FormControl>
              <FormLabel>Employee Name</FormLabel>
              <Input
                name="employeeName"
                value={formData.employeeName}
                onChange={handleInputChange}
                placeholder="Enter employee name"
                isReadOnly
              />
            </FormControl>

            <FormControl>
              <FormLabel>Department</FormLabel>
              <Input
                name="employeeDepartment"
                value={formData.employeeDepartment}
                onChange={handleInputChange}
                placeholder="Enter department"
                isReadOnly
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
                  <option value="major">Major</option>
                  <option value="critical">Critical</option>
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
              <FormLabel>Description</FormLabel>
              <Textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Enter offense details"
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
