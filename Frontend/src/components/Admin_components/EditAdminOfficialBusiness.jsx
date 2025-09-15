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

  // Prefill form when modal opens
  useEffect(() => {
    if (item) {
      setFormData({
        dateFrom: item.dateFrom || "",
        dateTo: item.dateTo || "",
        reason: item.reason || "",
      });
    }
  }, [item]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      await axiosInstance.put(
        `/adminOfficialBusiness/adminedit_OB/${item.id}`,
        formData
      );

      toast({
        title: "Updated",
        description: "Official business request has been updated successfully.",
        status: "success",
        duration: 3000,
        position: "top",
        isClosable: true,
      });

      onSubmit(); // Refresh table in parent
      onClose();
    } catch (err) {
      console.error("Error updating official business:", err);
      toast({
        title: "Error",
        description: "Failed to update official business request.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} isCentered size="lg">
      <ModalOverlay bg="blackAlpha.600" backdropFilter="blur(6px)" />
      <ModalContent
        borderRadius="xl"
        shadow="2xl"
        bg={useColorModeValue("white", "gray.800")}
        mx={4}
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
            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
              <FormControl>
                <FormLabel>
                  Date From{" "}
                  <Box as="span" color="red.200">
                    *
                  </Box>
                </FormLabel>
                <Input
                  type="date"
                  name="dateFrom"
                  value={formData.dateFrom}
                  onChange={handleChange}
                  borderRadius="md"
                />
              </FormControl>
              <FormControl>
                <FormLabel>
                  Date To{" "}
                  <Box as="span" color="red.200">
                    *
                  </Box>
                </FormLabel>
                <Input
                  type="date"
                  name="dateTo"
                  value={formData.dateTo}
                  onChange={handleChange}
                  borderRadius="md"
                />
              </FormControl>
            </SimpleGrid>

            <FormControl>
              <FormLabel>
                Reason{" "}
                <Box as="span" color="red.200">
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
          >
            Save Changes
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default EditOfficialBusinessModal;
