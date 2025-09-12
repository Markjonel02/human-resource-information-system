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
  VStack,
  HStack,
  Icon,
  Box,
  useColorModeValue,
  Divider,
} from "@chakra-ui/react";
import { FiTrash2, FiAlertTriangle } from "react-icons/fi";

const DeleteConfirmationModal = ({
  isOpen,
  onClose,
  onConfirm,
  itemId,
  itemName,
  itemType = "item",
  isLoading = false,
  title = "Delete Item",
  message = "Are you sure you want to delete this item? This action cannot be undone.",
  customContent = null,
}) => {
  const bgColor = useColorModeValue("white", "gray.800");
  const headerBg = useColorModeValue("red.50", "red.900");
  const borderColor = useColorModeValue("red.200", "red.600");

  const handleConfirm = async () => {
    try {
      if (itemId) {
        await onConfirm(itemId);
      } else {
        await onConfirm();
      }
    } catch (err) {
      console.error("Delete failed:", err);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      isCentered
      motionPreset="slideInBottom"
      closeOnOverlayClick={!isLoading}
      closeOnEsc={!isLoading}
      aria-describedby="delete-modal-description"
    >
      <ModalOverlay bg="blackAlpha.600" backdropFilter="blur(10px)" />
      <ModalContent
        borderRadius="xl"
        shadow="2xl"
        bg={bgColor}
        border="1px"
        borderColor={borderColor}
        mx={4}
        maxW="md"
      >
        <ModalHeader bg={headerBg} borderTopRadius="xl" pb={4} pt={6}>
          <HStack spacing={3}>
            <Box
              p={2}
              borderRadius="full"
              bg={useColorModeValue("red.100", "red.800")}
              border="2px"
              borderColor={useColorModeValue("red.300", "red.500")}
            >
              <Icon as={FiAlertTriangle} w={6} h={6} color="red.500" />
            </Box>
            <Text
              fontSize="lg"
              fontWeight="bold"
              color={useColorModeValue("red.700", "red.300")}
            >
              {title}
            </Text>
          </HStack>
        </ModalHeader>

        <ModalCloseButton isDisabled={isLoading} />

        <ModalBody py={6} id="delete-modal-description">
          <VStack spacing={4} align="stretch">
            <VStack spacing={3} textAlign="center">
              <Icon as={FiTrash2} w={12} h={12} color="red.400" opacity={0.7} />
              <Text
                fontSize="md"
                color={useColorModeValue("gray.700", "gray.300")}
              >
                {message}
              </Text>
            </VStack>

            {itemName && (
              <>
                <Divider />
                <Box
                  p={4}
                  bg={useColorModeValue("gray.50", "gray.700")}
                  borderRadius="lg"
                  border="1px"
                  borderColor={useColorModeValue("gray.200", "gray.600")}
                >
                  <VStack spacing={2} align="start">
                    <Text fontSize="sm" fontWeight="semibold" color="gray.500">
                      {itemType.charAt(0).toUpperCase() + itemType.slice(1)} to
                      be deleted:
                    </Text>
                    <Text
                      fontSize="md"
                      fontWeight="bold"
                      color={useColorModeValue("gray.800", "white")}
                    >
                      {itemName}
                    </Text>
                  </VStack>
                </Box>
              </>
            )}

            {customContent && (
              <>
                <Divider />
                {customContent}
              </>
            )}

            <Box
              p={3}
              bg={useColorModeValue("red.50", "red.900")}
              borderRadius="md"
              border="1px"
              borderColor={useColorModeValue("red.200", "red.600")}
            >
              <HStack spacing={2}>
                <Icon as={FiAlertTriangle} color="red.500" w={4} h={4} />
                <Text
                  fontSize="sm"
                  color={useColorModeValue("red.700", "red.300")}
                >
                  <strong>Warning:</strong> This action cannot be undone.
                </Text>
              </HStack>
            </Box>
          </VStack>
        </ModalBody>

        <ModalFooter gap={3} pt={2} pb={6}>
          <Button variant="ghost" onClick={onClose} isDisabled={isLoading}>
            Cancel
          </Button>
          <Button
            colorScheme="red"
            onClick={handleConfirm}
            isLoading={isLoading}
            loadingText="Deleting..."
            leftIcon={!isLoading ? <FiTrash2 /> : undefined}
          >
            Delete {itemType}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default DeleteConfirmationModal;
