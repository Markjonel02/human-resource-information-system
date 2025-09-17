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
import { FiXCircle, FiAlertTriangle } from "react-icons/fi";

const RejectConfirmationModal = ({
  isOpen,
  onClose,
  onConfirm,
  itemId,
  itemName,
  itemType = "request",
  isLoading = false,
  title = "Reject Request",
  message = "Are you sure you want to reject this request? This action cannot be undone.",
  customContent = null,
}) => {
  const bgColor = useColorModeValue("white", "gray.800");
  const headerBg = useColorModeValue("white");
  const borderColor = useColorModeValue("white");

  const handleConfirm = async () => {
    try {
      if (itemId) {
        await onConfirm(itemId);
      } else {
        await onConfirm();
      }
    } catch (err) {
      console.error("Reject failed:", err);
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
      aria-describedby="reject-modal-description"
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
            <Box p={2}>
              <Icon as={FiAlertTriangle} w={6} h={6} color="orange.500" />
            </Box>
            <Text
              fontSize="lg"
              fontWeight="bold"
              color={useColorModeValue("orange.700", "orange.300")}
            >
              {title}
            </Text>
          </HStack>
        </ModalHeader>

        <ModalCloseButton isDisabled={isLoading} />

        <ModalBody py={6} id="reject-modal-description">
          <VStack spacing={4} align="stretch">
            <VStack spacing={3} textAlign="left">
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
                      be rejected:
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
              bg={useColorModeValue("orange.50", "orange.900")}
              borderRadius="md"
              border="1px"
              borderColor={useColorModeValue("orange.200", "orange.600")}
            >
              <HStack spacing={2}>
                <Icon as={FiAlertTriangle} color="orange.500" w={4} h={4} />
                <Text
                  fontSize="sm"
                  color={useColorModeValue("orange.700", "orange.300")}
                >
                  <strong>Note:</strong> This action cannot be undone.
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
            colorScheme="orange"
            onClick={handleConfirm}
            isLoading={isLoading}
            loadingText="Rejecting..."
            leftIcon={!isLoading ? <FiXCircle /> : undefined}
          >
            Reject {itemType}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default RejectConfirmationModal;
