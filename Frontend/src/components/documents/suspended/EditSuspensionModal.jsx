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
  Select,
} from "@chakra-ui/react";
import axiosInstance from "../../../lib/axiosInstance";

const EditSuspensionModal = ({ isOpen, onClose, item, onUpdate }) => {
  const [formData, setFormData] = useState({
    title: "",
    descriptions: "",
    employee: "",
  });

  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const toast = useToast();

  useEffect(() => {
    if (isOpen) {
      fetchEmployees();
      if (item && item._id) {
        setFormData({
          title: item.title || "",
          descriptions: item.descriptions || "",
          employee: item.employee?._id || item.employee || "",
        });
      } else {
        setFormData({
          title: "",
          descriptions: "",
          employee: "",
        });
      }
    }
  }, [isOpen, item]);

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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async () => {
    if (
      !formData.title.trim() ||
      !formData.descriptions.trim() ||
      !formData.employee
    ) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields.",
        status: "warning",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        title: formData.title,
        descriptions: formData.descriptions,
        employee: formData.employee,
      };

      if (item && item._id) {
        // Update existing suspension
        await axiosInstance.put(`/suspension/${item._id}`, payload);
        toast({
          title: "Success",
          description: "Suspension record updated successfully.",
          status: "success",
          duration: 3000,
          isClosable: true,
        });
      } else {
        // Create new suspension
        await axiosInstance.post("/suspension", payload);
        toast({
          title: "Success",
          description: "Suspension record created successfully.",
          status: "success",
          duration: 3000,
          isClosable: true,
        });
      }

      if (onUpdate) await onUpdate();
      onClose();
    } catch (error) {
      console.error("Operation failed:", error);
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Failed to save suspension record.";

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
    <Modal isOpen={isOpen} onClose={onClose} size="md">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>{modalTitle}</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          {loading ? (
            <Box display="flex" justifyContent="center" py={8}>
              <Spinner />
            </Box>
          ) : (
            <Box space={4}>
              <FormControl isRequired mb={4}>
                <FormLabel>Title</FormLabel>
                <Input
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="Enter suspension title"
                  size="md"
                />
              </FormControl>

              <FormControl isRequired mb={4}>
                <FormLabel>Employee</FormLabel>
                <Select
                  name="employee"
                  value={formData.employee}
                  onChange={handleChange}
                  placeholder="Select an employee"
                >
                  {employees.map((emp) => (
                    <option key={emp._id} value={emp._id}>
                      {emp.name || emp.email} ({emp.department || "N/A"})
                    </option>
                  ))}
                </Select>
              </FormControl>

              <FormControl isRequired>
                <FormLabel>Description</FormLabel>
                <Textarea
                  name="descriptions"
                  value={formData.descriptions}
                  onChange={handleChange}
                  placeholder="Enter suspension reason/description"
                  rows={4}
                  resize="vertical"
                />
              </FormControl>
            </Box>
          )}
        </ModalBody>

        <ModalFooter>
          <Button variant="ghost" mr={3} onClick={onClose}>
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
