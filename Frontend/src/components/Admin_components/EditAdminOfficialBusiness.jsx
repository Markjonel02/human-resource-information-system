import { useState, useEffect } from "react";
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Button,
  Box,
  FormControl,
  FormLabel,
  Input,
  Textarea,
  SimpleGrid,
  useToast,
  VStack,
  useColorModeValue,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Text,
  Divider,
} from "@chakra-ui/react";
import axiosInstance from "../../lib/axiosInstance";

const EditOfficialBusinessModal = ({ isOpen, onClose, item, onSubmit }) => {
  const toast = useToast();
  const [formData, setFormData] = useState({
    dateFrom: "",
    dateTo: "",
    reason: "",
  });
  const [loading, setLoading] = useState(false);
  const [conflicts, setConflicts] = useState(null);

  // Prefill form when modal opens
  useEffect(() => {
    if (item && item._id) {
      console.log("Item received:", item); // Debug log

      // Format dates for input fields (assuming backend returns ISO strings)
      const formatDate = (dateString) => {
        if (!dateString) return "";
        const date = new Date(dateString);
        return date.toISOString().split("T")[0]; // Convert to YYYY-MM-DD format
      };

      setFormData({
        dateFrom: formatDate(item.dateFrom),
        dateTo: formatDate(item.dateTo),
        reason: item.reason || "",
      });
      setConflicts(null); // Reset conflicts when item changes
    } else if (item) {
      console.warn("Item missing _id:", item); // Debug warning
    }
  }, [item]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear conflicts when user changes dates
    if (name === "dateFrom" || name === "dateTo") {
      setConflicts(null);
    }
  };

  const validateForm = () => {
    const { dateFrom, dateTo, reason } = formData;

    if (!dateFrom || !dateTo || !reason.trim()) {
      toast({
        title: "Validation Error",
        description: "All fields are required.",
        status: "error",
        duration: 3000,
        position: "top",
        isClosable: true,
      });
      return false;
    }

    if (new Date(dateFrom) > new Date(dateTo)) {
      toast({
        title: "Validation Error",
        description: "Date From cannot be later than Date To.",
        status: "error",
        duration: 3000,
        position: "top",
        isClosable: true,
      });
      return false;
    }

    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      setLoading(true);
      setConflicts(null);

      if (!item) {
        throw new Error("No official business item provided");
      }

      if (!item._id) {
        console.error("Item structure:", item); // Debug log
        throw new Error(
          "Missing official business ID. Please refresh and try again."
        );
      }

      // Updated API endpoint to match your exact backend route
      const response = await axiosInstance.put(
        `/adminOfficialBusiness/adminedit_OB/${item._id}`,
        formData
      );

      toast({
        title: "Success",
        description:
          response.data?.message ||
          "Official business request has been updated successfully.",
        status: "success",
        duration: 3000,
        position: "top",
        isClosable: true,
      });

      onSubmit(); // Refresh parent table
      onClose(); // Close modal
    } catch (err) {
      console.error("Error updating official business:", err);

      const errorData = err.response?.data;

      // Handle specific conflict errors (pending leaves)
      if (errorData && errorData.conflicts) {
        setConflicts(errorData.conflicts);
        toast({
          title: "Conflict Detected",
          description:
            errorData.message ||
            "There are conflicts with pending leave applications.",
          status: "warning",
          duration: 5000,
          position: "top",
          isClosable: true,
        });
        return; // Don't close modal, show conflicts
      }

      // Handle other errors
      const errorMessage =
        errorData?.message ||
        err.message ||
        "Failed to update official business request.";

      toast({
        title: "Error",
        description: errorMessage,
        status: "error",
        duration: 4000,
        position: "top",
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} isCentered size="lg">
      <ModalOverlay bg="blackAlpha.600" backdropFilter="blur(6px)" />
      <ModalContent
        borderRadius="xl"
        shadow="2xl"
        bg={useColorModeValue("white", "gray.800")}
        mx={4}
        maxHeight="90vh"
        overflowY="auto"
      >
        <ModalHeader
          fontSize="xl"
          fontWeight="bold"
          bgGradient="linear(to-r, blue.500, purple.600)"
          color="white"
          borderTopRadius="xl"
          py={4}
        >
          Edit Official Business
        </ModalHeader>
        <ModalCloseButton disabled={loading} color="white" />

        <ModalBody py={6}>
          <VStack spacing={4} align="stretch">
            {/* Conflict Alert */}
            {conflicts && conflicts.length > 0 && (
              <Alert status="warning" borderRadius="md">
                <AlertIcon />
                <Box>
                  <AlertTitle>Pending Leave Conflicts!</AlertTitle>
                  <AlertDescription>
                    <Text mb={2}>
                      The following pending leave applications conflict with the
                      selected dates:
                    </Text>
                    {conflicts.map((conflict, index) => (
                      <Box
                        key={conflict.leaveId}
                        mt={2}
                        p={2}
                        bg="orange.50"
                        borderRadius="md"
                      >
                        <Text fontSize="sm">
                          <strong>Leave {index + 1}:</strong>{" "}
                          {formatDate(conflict.dateFrom)} -{" "}
                          {formatDate(conflict.dateTo)}
                        </Text>
                        <Text fontSize="sm" color="gray.600">
                          Type: {conflict.leaveType} | Status: {conflict.status}
                        </Text>
                      </Box>
                    ))}
                    <Divider my={2} />
                    <Text fontSize="sm" color="orange.700">
                      Please resolve these conflicts before updating the
                      official business dates.
                    </Text>
                  </AlertDescription>
                </Box>
              </Alert>
            )}

            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
              <FormControl isRequired>
                <FormLabel>
                  Date From{" "}
                  <Box as="span" color="red.500">
                    *
                  </Box>
                </FormLabel>
                <Input
                  type="date"
                  name="dateFrom"
                  value={formData.dateFrom}
                  onChange={handleChange}
                  borderRadius="md"
                  isDisabled={loading}
                />
              </FormControl>

              <FormControl isRequired>
                <FormLabel>
                  Date To{" "}
                  <Box as="span" color="red.500">
                    *
                  </Box>
                </FormLabel>
                <Input
                  type="date"
                  name="dateTo"
                  value={formData.dateTo}
                  onChange={handleChange}
                  borderRadius="md"
                  isDisabled={loading}
                />
              </FormControl>
            </SimpleGrid>

            <FormControl isRequired>
              <FormLabel>
                Reason{" "}
                <Box as="span" color="red.500">
                  *
                </Box>
              </FormLabel>
              <Textarea
                name="reason"
                value={formData.reason}
                onChange={handleChange}
                placeholder="Enter reason for official business"
                borderRadius="md"
                resize="none"
                rows={4}
                isDisabled={loading}
              />
            </FormControl>
          </VStack>
        </ModalBody>

        <ModalFooter gap={3} py={4}>
          <Button
            variant="ghost"
            onClick={onClose}
            isDisabled={loading}
            borderRadius="xl"
          >
            Cancel
          </Button>
          <Button
            colorScheme="blue"
            onClick={handleSubmit}
            isLoading={loading}
            loadingText="Updating..."
            borderRadius="xl"
            shadow="md"
            _hover={{
              transform: "translateY(-1px)",
              shadow: "lg",
            }}
            isDisabled={conflicts && conflicts.length > 0} // Disable if there are conflicts
          >
            Save Changes
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default EditOfficialBusinessModal;
