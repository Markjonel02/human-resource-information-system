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
} from "@chakra-ui/react";
import axiosInstance from "../../lib/axiosInstance";

const EditOffenseModal = ({ isOpen, onClose, item, onUpdate }) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [employeeName, setEmployeeName] = useState("");
  const [employeeDepartment, setEmployeeDepartment] = useState("");
  const [severity, setSeverity] = useState("minor");
  const [date, setDate] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const toast = useToast();

  // Update form when item changes
  useEffect(() => {
    if (item) {
      setTitle(item.title || "");
      setDescription(item.description || item.offenseDetails || "");
      setEmployeeName(item.employeeName || "");
      setEmployeeDepartment(item.employeeDepartment || "");
      setSeverity(item.severity || "minor");
      setDate(item.date ? new Date(item.date).toISOString().split("T")[0] : "");
    }
  }, [item]);

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

    if (!employeeName.trim()) {
      toast({
        title: "Validation Error",
        description: "Employee name is required.",
        status: "warning",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    setIsLoading(true);
    try {
      const response = await axiosInstance.put(`/offense/${offenseId}`, {
        title: title.trim(),
        description: description.trim(),
        employeeName: employeeName.trim(),
        employeeDepartment: employeeDepartment.trim(),
        severity,
        date: date || new Date().toISOString(),
      });

      toast({
        title: "Success",
        description: "Offense record updated successfully.",
        status: "success",
        duration: 3000,
        isClosable: true,
      });

      // Call the parent callback to update the list
      if (onUpdate) {
        onUpdate(response.data.offense || response.data);
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
    setTitle("");
    setDescription("");
    setEmployeeName("");
    setEmployeeDepartment("");
    setSeverity("minor");
    setDate("");
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
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter offense title"
              />
            </FormControl>

            <FormControl isRequired>
              <FormLabel>Employee Name</FormLabel>
              <Input
                value={employeeName}
                onChange={(e) => setEmployeeName(e.target.value)}
                placeholder="Enter employee name"
              />
            </FormControl>

            <FormControl>
              <FormLabel>Department</FormLabel>
              <Input
                value={employeeDepartment}
                onChange={(e) => setEmployeeDepartment(e.target.value)}
                placeholder="Enter department"
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
              <FormLabel>Description</FormLabel>
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
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
