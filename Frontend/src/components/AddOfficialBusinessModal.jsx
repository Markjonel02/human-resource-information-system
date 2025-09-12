import { useState } from "react";
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  Button,
  FormControl,
  FormLabel,
  Input,
  Textarea,
  SimpleGrid,
  useBreakpointValue,
  useToast,
} from "@chakra-ui/react";
import axiosInstance from "../lib/axiosInstance";

const AddOfficialBusinessModal = ({ isOpen, onClose, onSubmit }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    reason: "",
    dateFrom: "",
    dateTo: "",
  });
  const toast = useToast();

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Reset form when modal closes
  const handleClose = () => {
    setFormData({
      reason: "",
      dateFrom: "",
      dateTo: "",
    });
    onClose();
  };

  const handleAddOfficialBusiness = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const res = await axiosInstance.post(
        "/officialBusiness/addOfficialBusiness",
        formData,
        {
          withCredentials: true,
        }
      );

      toast({
        title: "Success",
        description:
          res.data.message || "Official Business request created successfully!",
        status: "success",
        duration: 3000,
        position: "top",
        isClosable: true,
      });

      // Call the parent's onSubmit callback if provided
      if (onSubmit) {
        onSubmit(res.data);
      }

      // Reset form and close modal
      handleClose();
    } catch (error) {
      console.error("Error adding Official Business:", error);

      const errorMessage =
        error.response?.data?.message ||
        "Failed to create Official Business request";

      toast({
        title: "Error",
        description: errorMessage,
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Responsive: on mobile, switch to 1 column
  const columns = useBreakpointValue({ base: 1, md: 2 });

  return (
    <Modal isOpen={isOpen} onClose={handleClose} isCentered size="lg">
      <ModalOverlay />
      <ModalContent
        borderRadius="xl"
        shadow="2xl"
        as="form"
        onSubmit={handleAddOfficialBusiness}
      >
        <ModalHeader>Add Official Business</ModalHeader>
        <ModalCloseButton />
        <ModalBody pb={6}>
          <SimpleGrid columns={columns} spacing={4}>
            <FormControl>
              <FormLabel>Date From</FormLabel>
              <Input
                name="dateFrom"
                type="date"
                value={formData.dateFrom}
                onChange={handleInputChange}
                required
              />
            </FormControl>

            <FormControl>
              <FormLabel>Date To</FormLabel>
              <Input
                name="dateTo"
                type="date"
                value={formData.dateTo}
                onChange={handleInputChange}
                required
              />
            </FormControl>

            <FormControl gridColumn={{ base: "span 1", md: "span 2" }}>
              <FormLabel>Reason</FormLabel>
              <Textarea
                name="reason"
                placeholder="Enter reason for official business"
                value={formData.reason}
                onChange={handleInputChange}
                required
                rows={4}
              />
            </FormControl>
          </SimpleGrid>
        </ModalBody>

        <ModalFooter>
          <Button
            type="submit"
            colorScheme="blue"
            mr={3}
            isLoading={isSubmitting}
            loadingText="Saving..."
          >
            Save
          </Button>
          <Button onClick={handleClose} isDisabled={isSubmitting}>
            Cancel
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default AddOfficialBusinessModal;
