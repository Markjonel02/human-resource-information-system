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
  Box,
  VStack,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
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

  const [submitting, setSubmitting] = useState(false);
  const [userRole, setUserRole] = useState(null);
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

      // Get user role from localStorage
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      setUserRole(user.role || null);
    }
  }, [isOpen, item]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    // If HR user tries to edit fields other than status, show warning
    if (userRole === "hr" && name !== "status") {
      toast({
        title: "Edit Restricted",
        description: "HR users can only edit the Status field.",
        status: "warning",
        duration: 2000,
        isClosable: true,
      });
      return;
    }

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
      let payload;
      let endpoint;

      if (userRole === "hr") {
        // HR can only update status
        payload = { status: formData.status };
        endpoint = `/Suspension/update/${item._id}`;
      } else {
        // Admin can update all fields
        payload = {
          title: formData.title,
          descriptions: formData.descriptions,
          employee: formData.employee,
          endDate: formData.endDate || null,
          status: formData.status,
        };
        endpoint = `/Suspension/update-full/${item._id}`;
      }

      await axiosInstance.put(endpoint, payload);
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

  const isHR = userRole === "hr";

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Edit Suspension Record</ModalHeader>
        <ModalCloseButton isDisabled={submitting} />
        <ModalBody>
          <VStack spacing={4}>
            {/* HR Permission Alert */}
            {isHR && (
              <Alert
                status="info"
                variant="subtle"
                flexDirection="column"
                alignItems="flex-start"
                borderRadius="md"
                mb={2}
              >
                <Box display="flex" alignItems="center" mb={2}>
                  <AlertIcon mr={2} />
                  <AlertTitle>HR User - Limited Access</AlertTitle>
                </Box>
                <AlertDescription>
                  As an HR user, you can only edit the <strong>Status</strong>{" "}
                  field. Other fields are read-only.
                </AlertDescription>
              </Alert>
            )}

            {/* Title */}
            <FormControl>
              <FormLabel fontWeight="600">Title</FormLabel>
              <Input
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="Suspension title"
                isReadOnly={isHR}
                bg={isHR ? "gray.100" : "white"}
                cursor={isHR ? "not-allowed" : "text"}
              />
            </FormControl>

            {/* Employee (Read-only for HR) */}
            <FormControl>
              <FormLabel fontWeight="600">Employee</FormLabel>
              <Input
                value={
                  typeof formData.employee === "object"
                    ? `${formData.employee.firstname || ""} ${
                        formData.employee.lastname || ""
                      }`.trim() || formData.employee.employeeEmail
                    : formData.employee
                }
                isReadOnly={true}
                bg="gray.100"
                cursor="not-allowed"
              />
            </FormControl>

            {/* Description (Read-only for HR) */}
            <FormControl>
              <FormLabel fontWeight="600">Description</FormLabel>
              <Textarea
                name="descriptions"
                value={formData.descriptions}
                onChange={handleChange}
                placeholder="Suspension reason"
                rows={4}
                resize="vertical"
                isReadOnly={isHR}
                bg={isHR ? "gray.100" : "white"}
                cursor={isHR ? "not-allowed" : "text"}
              />
            </FormControl>

            {/* End Date (Read-only for HR) */}
            <FormControl>
              <FormLabel fontWeight="600">End Date</FormLabel>
              <Input
                type="date"
                name="endDate"
                value={formData.endDate}
                onChange={handleChange}
                isReadOnly={isHR}
                bg={isHR ? "gray.100" : "white"}
                cursor={isHR ? "not-allowed" : "text"}
              />
            </FormControl>

            {/* Status - Editable for both HR and Admin */}
            <FormControl isRequired>
              <FormLabel fontWeight="600">
                Status{" "}
                {isHR && <span style={{ color: "green" }}>(Editable)</span>}
              </FormLabel>
              <Input
                as="select"
                name="status"
                value={formData.status}
                onChange={handleChange}
                isDisabled={submitting}
                borderColor={isHR ? "green.400" : "inherit"}
                borderWidth={isHR ? "2px" : "1px"}
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
            Update
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default EditSuspensionModal;
