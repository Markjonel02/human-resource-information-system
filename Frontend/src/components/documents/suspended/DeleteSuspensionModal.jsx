import React from "react";
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Button,
  Text,
  Box,
  Icon,
} from "@chakra-ui/react";
import { AlertCircle } from "lucide-react";

const DeleteSuspensionModal = ({
  isOpen,
  onClose,
  onConfirm,
  title = "Delete Suspension Record",
  message = "Are you sure you want to delete this suspension record?",
  isLoading = false,
}) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} isCentered>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>{title}</ModalHeader>
        <ModalCloseButton isDisabled={isLoading} />
        <ModalBody>
          <Box display="flex" alignItems="flex-start" gap={4}>
            <Icon as={AlertCircle} color="red.500" boxSize={6} flexShrink={0} />
            <Text fontSize="sm" color="gray.700">
              {message}
            </Text>
          </Box>
        </ModalBody>

        <ModalFooter gap={3}>
          <Button variant="ghost" onClick={onClose} isDisabled={isLoading}>
            Cancel
          </Button>
          <Button
            colorScheme="red"
            onClick={onConfirm}
            isLoading={isLoading}
            loadingText="Deleting..."
          >
            Delete
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default DeleteSuspensionModal;
