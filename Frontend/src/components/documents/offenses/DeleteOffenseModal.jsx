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
  Alert,
  AlertIcon,
} from "@chakra-ui/react";

const DeleteConfirmModal = ({ isOpen, onClose, onConfirm, title, message }) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} isCentered>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>{title || "Confirm Delete"}</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <Alert status="warning" borderRadius="md" mb={4}>
            <AlertIcon />
            This action cannot be undone
          </Alert>
          <Text>{message || "Are you sure you want to delete this item?"}</Text>
        </ModalBody>

        <ModalFooter>
          <Button variant="ghost" mr={3} onClick={onClose}>
            Cancel
          </Button>
          <Button colorScheme="red" onClick={onConfirm}>
            Delete
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default DeleteConfirmModal;
