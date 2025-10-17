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
  useToast,
} from "@chakra-ui/react";
import axiosInstance from "../../lib/axiosInstance";

const EditPolicyModal = ({ isOpen, onClose, item, onUpdate }) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const toast = useToast();

  // Update form when item changes
  useEffect(() => {
    if (item) {
      setTitle(item.title || "");
      setDescription(item.description || "");
    }
  }, [item]);

  const handleSubmit = async () => {
    const policyId = item?._id || item?.id;

    if (!policyId) {
      toast({
        title: "Update failed",
        description: "Policy ID not found.",
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

    setIsLoading(true);
    try {
      const response = await axiosInstance.put(`/policy/${policyId}`, {
        title: title.trim(),
        description: description.trim(),
      });

      toast({
        title: "Success",
        description: "Policy updated successfully.",
        status: "success",
        duration: 3000,
        isClosable: true,
      });

      // Call the parent callback to update the list
      if (onUpdate) {
        onUpdate(response.data.policy || response.data);
      }

      // Close modal and reset form
      handleClose();
    } catch (error) {
      console.error("Update failed:", error);
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Failed to update policy.";

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
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} size="lg">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Edit Policy</ModalHeader>
        <ModalCloseButton />
        <ModalBody pb={6}>
          <VStack spacing={4}>
            <FormControl isRequired>
              <FormLabel>Title</FormLabel>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter policy title"
              />
            </FormControl>

            <FormControl>
              <FormLabel>Description</FormLabel>
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Enter policy description"
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

export default EditPolicyModal;
